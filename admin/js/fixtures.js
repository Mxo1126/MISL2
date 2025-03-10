// Import Firebase modules
import { db } from '../../js/firebase-config.js';
import { collection, addDoc, getDocs, query, where, orderBy, deleteDoc, doc, updateDoc, getDoc, Timestamp, serverTimestamp } from 'firebase/firestore';

// DOM Elements
const fixturesList = document.querySelector('.fixtures-list');
const fixtureForm = document.getElementById('fixtureForm');
const fixtureLeagueFilter = document.getElementById('fixtureLeagueFilter');
const filterButtons = document.querySelectorAll('.filter-buttons .btn');

// Current state
let currentFilter = 'upcoming';
let selectedLeague = '';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadLeagues();
    loadFixtures();
    setupEventListeners();
});

// Setup Event Listeners
function setupEventListeners() {
    // League filter change
    fixtureLeagueFilter?.addEventListener('change', (e) => {
        selectedLeague = e.target.value;
        loadFixtures();
    });

    // Filter buttons
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            currentFilter = btn.dataset.filter;
            updateActiveFilter(btn);
            loadFixtures();
        });
    });

    // Fixture form
    fixtureForm?.addEventListener('submit', handleFixtureSubmit);

    // League selection change in fixture form
    const fixtureLeagueSelect = document.getElementById('fixtureLeague');
    fixtureLeagueSelect?.addEventListener('change', (e) => {
        loadTeamsForLeague(e.target.value);
    });
}

// Load leagues into selects
async function loadLeagues() {
    const leagueSelects = [fixtureLeagueFilter, document.getElementById('fixtureLeague')];
    
    try {
        const leaguesRef = collection(db, 'leagues');
        const leaguesSnap = await getDocs(query(leaguesRef, orderBy('name')));
        
        leagueSelects.forEach(select => {
            if (!select) return;
            
            // Clear existing options except the first one
            while (select.options.length > 1) select.remove(1);
            
            leaguesSnap.forEach(doc => {
                const league = doc.data();
                const option = new Option(league.name, doc.id);
                select.add(option);
            });
        });
    } catch (error) {
        console.error('Error loading leagues:', error);
        showToast('Failed to load leagues', 'error');
    }
}

// Load teams for selected league
async function loadTeamsForLeague(leagueId) {
    const teamSelects = [
        document.getElementById('homeTeam'),
        document.getElementById('awayTeam')
    ];
    
    if (!leagueId || !teamSelects[0] || !teamSelects[1]) return;
    
    try {
        const teamsRef = collection(db, 'teams');
        const teamsSnap = await getDocs(
            query(teamsRef, where('league', '==', leagueId))
        );
        
        teamSelects.forEach(select => {
            // Clear existing options except the first one
            while (select.options.length > 1) select.remove(1);
            
            teamsSnap.forEach(doc => {
                const team = doc.data();
                const option = new Option(team.name, doc.id);
                select.add(option);
            });
        });
    } catch (error) {
        console.error('Error loading teams:', error);
        showToast('Failed to load teams', 'error');
    }
}

// Load fixtures
async function loadFixtures() {
    if (!fixturesList) return;

    // Show loading state
    fixturesList.querySelector('.loading-state').style.display = 'flex';
    
    try {
        const fixturesRef = collection(db, 'fixtures');
        let fixturesQuery = fixturesRef;
        
        // Apply league filter
        if (selectedLeague) {
            fixturesQuery = query(fixturesQuery, where('league', '==', selectedLeague));
        }
        
        // Apply date filter
        const now = Timestamp.now();
        switch (currentFilter) {
            case 'upcoming':
                fixturesQuery = query(fixturesQuery, where('date', '>=', now), orderBy('date', 'asc'));
                break;
            case 'completed':
                fixturesQuery = query(fixturesQuery, where('completed', '==', true), orderBy('date', 'desc'));
                break;
            default:
                fixturesQuery = query(fixturesQuery, orderBy('date', 'desc'));
        }
        
        const fixturesSnap = await getDocs(fixturesQuery);
        
        // Clear existing fixtures except loading state
        const loadingState = fixturesList.querySelector('.loading-state');
        fixturesList.innerHTML = '';
        fixturesList.appendChild(loadingState);
        
        if (fixturesSnap.empty) {
            fixturesList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-calendar-times"></i>
                    <p>No fixtures found</p>
                    <button class="btn btn-primary" onclick="openModal('addFixtureModal')">
                        Add New Fixture
                    </button>
                </div>
            `;
            return;
        }

        const fixturesGrid = document.createElement('div');
        fixturesGrid.className = 'fixtures-grid';
        
        fixturesSnap.forEach(doc => {
            const fixture = doc.data();
            const fixtureCard = createFixtureCard(doc.id, fixture);
            fixturesGrid.appendChild(fixtureCard);
        });
        
        fixturesList.appendChild(fixturesGrid);
    } catch (error) {
        console.error('Error loading fixtures:', error);
        fixturesList.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-circle"></i>
                <p>Failed to load fixtures</p>
                <button class="btn btn-primary" onclick="loadFixtures()">
                    Try Again
                </button>
            </div>
        `;
    }
    
    // Hide loading state
    fixturesList.querySelector('.loading-state').style.display = 'none';
}

// Create fixture card
function createFixtureCard(fixtureId, fixture) {
    const date = fixture.date.toDate();
    const card = document.createElement('div');
    card.className = 'fixture-card';
    
    const completed = fixture.completed;
    const scoreSection = completed ? `
        <div class="fixture-score">
            <span class="score">${fixture.homeScore}</span>
            <span class="score-divider">-</span>
            <span class="score">${fixture.awayScore}</span>
        </div>
    ` : '';
    
    card.innerHTML = `
        <div class="fixture-date">
            <span class="day">${date.getDate()}</span>
            <span class="month">${date.toLocaleString('default', { month: 'short' }).toUpperCase()}</span>
            <span class="time">${date.toLocaleTimeString('default', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <div class="fixture-teams">
            <div class="team home">
                <img src="${fixture.homeTeam.logo}" alt="${fixture.homeTeam.name}">
                <span>${fixture.homeTeam.name}</span>
            </div>
            <div class="fixture-info">
                ${scoreSection}
                <div class="venue">${fixture.venue}</div>
                ${completed ? '<span class="status completed">Final</span>' : '<span class="status upcoming">Upcoming</span>'}
            </div>
            <div class="team away">
                <img src="${fixture.awayTeam.logo}" alt="${fixture.awayTeam.name}">
                <span>${fixture.awayTeam.name}</span>
            </div>
        </div>
        <div class="fixture-actions">
            <button class="btn btn-icon" onclick="editFixture('${fixtureId}')" title="Edit Fixture">
                <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-icon btn-danger" onclick="deleteFixture('${fixtureId}')" title="Delete Fixture">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    
    return card;
}

// Handle fixture form submission
async function handleFixtureSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitButton = form.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.innerHTML;
    
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    // Show loading state
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
    
    try {
        const fixtureData = {
            league: form.league.value,
            date: new Date(`${form.date.value}T${form.time.value}`),
            homeTeam: form.homeTeam.value,
            awayTeam: form.awayTeam.value,
            venue: form.venue.value,
            completed: form.completed?.checked || false
        };
        
        if (fixtureData.completed) {
            fixtureData.homeScore = parseInt(form.homeScore.value) || 0;
            fixtureData.awayScore = parseInt(form.awayScore.value) || 0;
        }
        
        // Add or update fixture
        const fixtureId = form.dataset.fixtureId;
        if (fixtureId) {
            await updateFixture(fixtureId, fixtureData);
        } else {
            await addFixture(fixtureData);
        }
        
        // Reset form and close modal
        form.reset();
        delete form.dataset.fixtureId;
        closeModal('addFixtureModal');
        
        // Reload fixtures
        await loadFixtures();
        
        showToast(`Fixture ${fixtureId ? 'updated' : 'added'} successfully`, 'success');
    } catch (error) {
        console.error('Error saving fixture:', error);
        showToast(error.message || 'Failed to save fixture', 'error');
    } finally {
        // Reset button state
        submitButton.disabled = false;
        submitButton.innerHTML = originalButtonText;
    }
}

// Add new fixture
async function addFixture(fixtureData) {
    const fixturesRef = collection(db, 'fixtures');
    await addDoc(fixturesRef, {
        ...fixtureData,
        createdAt: serverTimestamp()
    });
}

// Update fixture
async function updateFixture(fixtureId, fixtureData) {
    await updateDoc(doc(db, 'fixtures', fixtureId), {
        ...fixtureData,
        updatedAt: serverTimestamp()
    });
}

// Edit fixture
async function editFixture(fixtureId) {
    try {
        const fixtureDoc = await getDoc(doc(db, 'fixtures', fixtureId));
        if (!fixtureDoc.exists()) {
            throw new Error('Fixture not found');
        }

        const fixture = fixtureDoc.data();
        const form = document.getElementById('fixtureForm');
        
        // Set form data
        form.dataset.fixtureId = fixtureId;
        form.league.value = fixture.league;
        await loadTeamsForLeague(fixture.league);
        
        const date = fixture.date.toDate();
        form.date.value = date.toISOString().split('T')[0];
        form.time.value = date.toTimeString().slice(0, 5);
        
        form.homeTeam.value = fixture.homeTeam;
        form.awayTeam.value = fixture.awayTeam;
        form.venue.value = fixture.venue;
        
        // Show score section if completed
        const scoreSection = document.getElementById('scoreSection');
        if (scoreSection) {
            scoreSection.style.display = fixture.completed ? 'block' : 'none';
            form.completed.checked = fixture.completed;
            if (fixture.completed) {
                form.homeScore.value = fixture.homeScore;
                form.awayScore.value = fixture.awayScore;
            }
        }
        
        // Open modal
        openModal('addFixtureModal');
    } catch (error) {
        console.error('Error loading fixture for edit:', error);
        showToast(error.message || 'Failed to load fixture', 'error');
    }
}

// Delete fixture
async function deleteFixture(fixtureId) {
    if (!confirm('Are you sure you want to delete this fixture? This action cannot be undone.')) {
        return;
    }
    
    try {
        await deleteDoc(doc(db, 'fixtures', fixtureId));
        await loadFixtures();
        showToast('Fixture deleted successfully', 'success');
    } catch (error) {
        console.error('Error deleting fixture:', error);
        showToast(error.message || 'Failed to delete fixture', 'error');
    }
}

// Update active filter
function updateActiveFilter(clickedBtn) {
    filterButtons.forEach(btn => btn.classList.remove('active'));
    clickedBtn.classList.add('active');
}

// Export functions for use in other modules
export {
    loadFixtures,
    loadLeagues,
    addFixture,
    editFixture,
    deleteFixture
};
