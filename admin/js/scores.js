// Firebase instances
const db = window.db;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Add form submit handler
    document.getElementById('scoreForm')?.addEventListener('submit', handleScoreSubmit);
    
    // Add team selection handlers
    document.getElementById('homeTeam')?.addEventListener('change', handleHomeTeamChange);
    
    // Load initial data
    loadScores();
    loadTeamsForSelect();
});

// Load teams into select dropdowns
async function loadTeamsForSelect() {
    try {
        const teamsRef = db.collection('teams');
        const snapshot = await teamsRef.orderBy('name').get();
        
        const homeSelect = document.getElementById('homeTeam');
        const awaySelect = document.getElementById('awayTeam');
        
        // Clear existing options except the placeholder
        homeSelect.innerHTML = '<option value="">Select Home Team</option>';
        awaySelect.innerHTML = '<option value="">Select Away Team</option>';
        
        snapshot.forEach(doc => {
            const team = doc.data();
            const homeOption = new Option(team.name, doc.id);
            const awayOption = new Option(team.name, doc.id);
            
            // Add team logo as data attribute
            if (team.logoUrl) {
                homeOption.dataset.logo = team.logoUrl;
                awayOption.dataset.logo = team.logoUrl;
            }
            
            // Add home venue as data attribute
            if (team.homeVenue) {
                homeOption.dataset.venue = team.homeVenue;
            }
            
            homeSelect.appendChild(homeOption);
            awaySelect.appendChild(awayOption);
        });
    } catch (error) {
        console.error('Error loading teams:', error);
        window.showNotification('Error loading teams for selection', 'error');
    }
}

// Handle home team change
function handleHomeTeamChange(event) {
    const selectedOption = event.target.options[event.target.selectedIndex];
    const venue = selectedOption.dataset.venue;
    
    if (venue) {
        document.getElementById('matchVenue').value = venue;
    }
}

// Load scores
async function loadScores() {
    try {
        const scoresRef = db.collection('scores');
        const snapshot = await scoresRef.orderBy('matchDate', 'desc').get();
        
        const scoresGrid = document.getElementById('scoresGrid');
        scoresGrid.innerHTML = '';
        
        if (snapshot.empty) {
            scoresGrid.innerHTML = '<div class="no-data">No scores found</div>';
            return;
        }
        
        snapshot.forEach(doc => {
            const data = doc.data();
            const score = document.createElement('div');
            score.className = 'grid-item';
            score.innerHTML = `
                <div class="item-card">
                    <div class="score-header">
                        <div class="team-info">
                            ${data.homeLogo ? `<img src="${data.homeLogo}" alt="${data.homeTeam}" class="team-logo-small">` : ''}
                            <span>${data.homeTeam}</span>
                        </div>
                        <div class="score-result">
                            <span class="score">${data.homeScore}</span>
                            <span>-</span>
                            <span class="score">${data.awayScore}</span>
                        </div>
                        <div class="team-info">
                            ${data.awayLogo ? `<img src="${data.awayLogo}" alt="${data.awayTeam}" class="team-logo-small">` : ''}
                            <span>${data.awayTeam}</span>
                        </div>
                    </div>
                    <div class="item-content">
                        <p class="team-info"><i class="fas fa-calendar"></i> ${new Date(data.matchDate).toLocaleString()}</p>
                        <p class="team-info"><i class="fas fa-map-marker-alt"></i> ${data.matchVenue}</p>
                        ${data.matchNotes ? `<p class="match-notes">${data.matchNotes}</p>` : ''}
                        <div class="item-actions">
                            <button class="btn btn-icon" onclick="editScore('${doc.id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-icon" onclick="deleteScore('${doc.id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            scoresGrid.appendChild(score);
        });
    } catch (error) {
        console.error('Error loading scores:', error);
        window.showNotification('Error loading scores', 'error');
    }
}

// Handle score form submission
async function handleScoreSubmit(event) {
    event.preventDefault();
    const loadingOverlay = document.getElementById('loadingOverlay');
    
    try {
        loadingOverlay.style.display = 'flex';
        
        // Get selected teams
        const homeTeamSelect = document.getElementById('homeTeam');
        const awayTeamSelect = document.getElementById('awayTeam');
        const homeTeamOption = homeTeamSelect.options[homeTeamSelect.selectedIndex];
        const awayTeamOption = awayTeamSelect.options[awayTeamSelect.selectedIndex];
        
        const scoreData = {
            homeTeam: homeTeamOption.text,
            awayTeam: awayTeamOption.text,
            homeScore: parseInt(document.getElementById('homeScore').value),
            awayScore: parseInt(document.getElementById('awayScore').value),
            matchDate: new Date(document.getElementById('matchDate').value).toISOString(),
            matchVenue: document.getElementById('matchVenue').value,
            matchNotes: document.getElementById('matchNotes').value,
            homeLogo: homeTeamOption.dataset.logo,
            awayLogo: awayTeamOption.dataset.logo,
            homeTeamId: homeTeamOption.value,
            awayTeamId: awayTeamOption.value,
            updatedAt: new Date()
        };

        await db.collection('scores').add(scoreData);
        
        window.showNotification('Score added successfully!', 'success');
        window.closeModal('addScoreModal');
        event.target.reset();
        await loadScores();
    } catch (error) {
        console.error('Error adding score:', error);
        window.showNotification('Error adding score', 'error');
    } finally {
        loadingOverlay.style.display = 'none';
    }
}

// Delete score
window.deleteScore = async (scoreId) => {
    if (!confirm('Are you sure you want to delete this score?')) return;
    
    const loadingOverlay = document.getElementById('loadingOverlay');
    loadingOverlay.style.display = 'flex';
    
    try {
        await db.collection('scores').doc(scoreId).delete();
        await loadScores();
        window.showNotification('Score deleted successfully!', 'success');
    } catch (error) {
        console.error('Error deleting score:', error);
        window.showNotification('Error deleting score', 'error');
    } finally {
        loadingOverlay.style.display = 'none';
    }
};

// Open score modal
window.openScoreModal = (scoreId = null) => {
    currentScoreId = scoreId;
    const modal = document.getElementById('scoreModal');
    const form = document.getElementById('scoreForm');
    const titleElement = document.getElementById('scoreModalTitle');
    const loadingOverlay = document.getElementById('loadingOverlay');

    // Reset form
    form.reset();
    titleElement.textContent = scoreId ? 'Edit Score' : 'Add Score';

    if (scoreId) {
        loadingOverlay.style.display = 'flex';
        // Load existing score data
        const docRef = db.collection('scores').doc(scoreId);
        docRef.get()
            .then(doc => {
                if (doc.exists()) {
                    const data = doc.data();
                    document.getElementById('homeTeam').value = data.homeTeamId;
                    document.getElementById('awayTeam').value = data.awayTeamId;
                    document.getElementById('homeScore').value = data.homeScore;
                    document.getElementById('awayScore').value = data.awayScore;
                    document.getElementById('matchDate').value = data.matchDate.slice(0, 16); // Format for datetime-local
                    document.getElementById('matchVenue').value = data.matchVenue;
                    document.getElementById('matchNotes').value = data.matchNotes || '';
                }
            })
            .catch(error => console.error('Error loading score:', error))
            .finally(() => loadingOverlay.style.display = 'none');
    }

    modal.style.display = 'block';
};

// Close score modal
window.closeScoreModal = () => {
    const modal = document.getElementById('scoreModal');
    modal.style.display = 'none';
    currentScoreId = null;
};

// Edit score
window.editScore = async (scoreId) => {
    window.openScoreModal(scoreId);
};

// Update score
async function updateScore(scoreId, scoreData) {
    try {
        await db.collection('scores').doc(scoreId).update(scoreData);
        window.showNotification('Score updated successfully!', 'success');
        await loadScores();
    } catch (error) {
        console.error('Error updating score:', error);
        window.showNotification('Error updating score', 'error');
    }
}

// Handle score form submission for edit
async function handleScoreEditSubmit(event) {
    event.preventDefault();
    const loadingOverlay = document.getElementById('loadingOverlay');
    
    try {
        loadingOverlay.style.display = 'flex';
        
        // Get selected teams
        const homeTeamSelect = document.getElementById('homeTeam');
        const awayTeamSelect = document.getElementById('awayTeam');
        const homeTeamOption = homeTeamSelect.options[homeTeamSelect.selectedIndex];
        const awayTeamOption = awayTeamSelect.options[awayTeamSelect.selectedIndex];
        
        const scoreData = {
            homeTeam: homeTeamOption.text,
            awayTeam: awayTeamOption.text,
            homeScore: parseInt(document.getElementById('homeScore').value),
            awayScore: parseInt(document.getElementById('awayScore').value),
            matchDate: new Date(document.getElementById('matchDate').value).toISOString(),
            matchVenue: document.getElementById('matchVenue').value,
            matchNotes: document.getElementById('matchNotes').value,
            homeLogo: homeTeamOption.dataset.logo,
            awayLogo: awayTeamOption.dataset.logo,
            homeTeamId: homeTeamOption.value,
            awayTeamId: awayTeamOption.value,
            updatedAt: new Date()
        };

        await updateScore(currentScoreId, scoreData);
        
        window.closeScoreModal();
        await loadScores();
    } catch (error) {
        console.error('Error editing score:', error);
        window.showNotification('Error editing score', 'error');
    } finally {
        loadingOverlay.style.display = 'none';
    }
}

// Update handleScoreSubmit to handle both add and edit
async function handleScoreSubmit(event) {
    if (currentScoreId) {
        await handleScoreEditSubmit(event);
    } else {
        await handleScoreSubmit(event);
    }
}

let currentScoreId = null;

import { db } from '../../js/firebase-config.js';
