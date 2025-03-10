// Import Firebase modules
import { db } from '../../js/firebase-config.js';
import { collection, addDoc, getDocs, query, where, orderBy, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';

// DOM Elements
const leaguesList = document.querySelector('.leagues-list');
const quickLeagueForm = document.getElementById('quickLeagueForm');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadLeagues();
    setupEventListeners();
});

// Setup Event Listeners
function setupEventListeners() {
    if (quickLeagueForm) {
        quickLeagueForm.addEventListener('submit', addLeague);
    }
}

// Load leagues
async function loadLeagues() {
    if (!leaguesList) return;

    // Show loading state
    leaguesList.querySelector('.loading-state').style.display = 'flex';
    
    try {
        const leaguesRef = collection(db, 'leagues');
        const leaguesSnap = await getDocs(query(leaguesRef, orderBy('name')));
        
        // Clear existing leagues except loading state
        const loadingState = leaguesList.querySelector('.loading-state');
        leaguesList.innerHTML = '';
        leaguesList.appendChild(loadingState);
        
        if (leaguesSnap.empty) {
            leaguesList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-trophy"></i>
                    <p>No leagues added yet</p>
                    <button class="btn btn-primary" onclick="openModal('addLeagueModal')">
                        Add Your First League
                    </button>
                </div>
            `;
            return;
        }

        const leaguesGrid = document.createElement('div');
        leaguesGrid.className = 'leagues-grid';
        
        leaguesSnap.forEach(doc => {
            const league = doc.data();
            const leagueCard = document.createElement('div');
            leagueCard.className = 'league-card';
            leagueCard.innerHTML = `
                <div class="league-info">
                    <h3>${league.name}</h3>
                    <p class="league-code">${league.code}</p>
                    ${league.description ? `<p class="league-description">${league.description}</p>` : ''}
                </div>
                <div class="league-actions">
                    <button class="btn btn-icon" onclick="editLeague('${doc.id}')" title="Edit League">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-icon btn-danger" onclick="deleteLeague('${doc.id}')" title="Delete League">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            leaguesGrid.appendChild(leagueCard);
        });
        
        leaguesList.appendChild(leaguesGrid);
    } catch (error) {
        console.error('Error loading leagues:', error);
        leaguesList.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-circle"></i>
                <p>Failed to load leagues</p>
                <button class="btn btn-primary" onclick="loadLeagues()">
                    Try Again
                </button>
            </div>
        `;
    }
    
    // Hide loading state
    leaguesList.querySelector('.loading-state').style.display = 'none';
}

// Add new league
async function addLeague(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitButton = form.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.innerHTML;
    
    // Basic form validation
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const leagueName = form.leagueName.value.trim();
    const leagueCode = form.leagueCode.value.trim().toLowerCase();
    const leagueDescription = form.leagueDescription?.value.trim();
    
    // Show loading state
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';
    
    try {
        // Check for duplicate league code
        const leaguesRef = collection(db, 'leagues');
        const duplicateCheck = await getDocs(query(leaguesRef, where('code', '==', leagueCode)));
        
        if (!duplicateCheck.empty) {
            throw new Error('A league with this code already exists');
        }
        
        // Add the league
        await addDoc(leaguesRef, {
            name: leagueName,
            code: leagueCode,
            description: leagueDescription || '',
            createdAt: serverTimestamp()
        });
        
        // Reset form and close modal
        form.reset();
        closeModal('addLeagueModal');
        
        // Reload leagues list
        await loadLeagues();
        
        // Show success message
        showToast('League added successfully', 'success');
    } catch (error) {
        console.error('Error adding league:', error);
        showToast(error.message || 'Failed to add league', 'error');
    } finally {
        // Reset button state
        submitButton.disabled = false;
        submitButton.innerHTML = originalButtonText;
    }
}

// Delete league
async function deleteLeague(leagueId) {
    if (!confirm('Are you sure you want to delete this league? This action cannot be undone.')) {
        return;
    }
    
    try {
        // Check if league has any teams
        const teamsRef = collection(db, 'teams');
        const teamsSnap = await getDocs(query(teamsRef, where('league', '==', leagueId)));
        
        if (!teamsSnap.empty) {
            throw new Error('Cannot delete league: This league has associated teams');
        }
        
        // Check if league has any fixtures
        const fixturesRef = collection(db, 'fixtures');
        const fixturesSnap = await getDocs(query(fixturesRef, where('league', '==', leagueId)));
        
        if (!fixturesSnap.empty) {
            throw new Error('Cannot delete league: This league has associated fixtures');
        }
        
        // Delete the league
        await deleteDoc(doc(db, 'leagues', leagueId));
        
        // Reload leagues list
        await loadLeagues();
        
        showToast('League deleted successfully', 'success');
    } catch (error) {
        console.error('Error deleting league:', error);
        showToast(error.message || 'Failed to delete league', 'error');
    }
}

// Edit league
async function editLeague(leagueId) {
    try {
        const leagueDoc = await getDoc(doc(db, 'leagues', leagueId));
        if (!leagueDoc.exists()) {
            throw new Error('League not found');
        }

        const league = leagueDoc.data();
        
        // Populate form
        const form = document.getElementById('quickLeagueForm');
        form.leagueName.value = league.name;
        form.leagueCode.value = league.code;
        if (form.leagueDescription) {
            form.leagueDescription.value = league.description || '';
        }
        
        // Update form submission handler
        form.onsubmit = async (e) => {
            e.preventDefault();
            await updateLeague(leagueId, form);
        };
        
        // Open modal
        openModal('addLeagueModal');
    } catch (error) {
        console.error('Error loading league for edit:', error);
        showToast(error.message || 'Failed to load league', 'error');
    }
}

// Update league
async function updateLeague(leagueId, form) {
    const submitButton = form.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.innerHTML;
    
    // Show loading state
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';
    
    try {
        const leagueName = form.leagueName.value.trim();
        const leagueCode = form.leagueCode.value.trim().toLowerCase();
        const leagueDescription = form.leagueDescription?.value.trim();
        
        // Check if code changed and if new code exists
        const leagueDoc = await getDoc(doc(db, 'leagues', leagueId));
        const currentCode = leagueDoc.data().code;
        
        if (leagueCode !== currentCode) {
            const leaguesRef = collection(db, 'leagues');
            const duplicateCheck = await getDocs(query(leaguesRef, where('code', '==', leagueCode)));
            
            if (!duplicateCheck.empty) {
                throw new Error('A league with this code already exists');
            }
        }
        
        // Update the league
        await updateDoc(doc(db, 'leagues', leagueId), {
            name: leagueName,
            code: leagueCode,
            description: leagueDescription || '',
            updatedAt: serverTimestamp()
        });
        
        // Reset form and close modal
        form.reset();
        form.onsubmit = addLeague; // Reset form handler
        closeModal('addLeagueModal');
        
        // Reload leagues list
        await loadLeagues();
        
        showToast('League updated successfully', 'success');
    } catch (error) {
        console.error('Error updating league:', error);
        showToast(error.message || 'Failed to update league', 'error');
    } finally {
        // Reset button state
        submitButton.disabled = false;
        submitButton.innerHTML = originalButtonText;
    }
}

// Export functions for use in other modules
export {
    loadLeagues,
    addLeague,
    deleteLeague,
    editLeague
};
