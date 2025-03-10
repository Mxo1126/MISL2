// Teams Management Functions
import { firebase } from '../../js/firebase-config.js';

const db = firebase.firestore();
const storage = firebase.storage();

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Add form submit handler
    document.getElementById('teamForm')?.addEventListener('submit', handleTeamSubmit);
    
    // Load initial data
    loadTeams();
});

// Upload logo to Firebase Storage
async function uploadLogo(file) {
    try {
        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!validTypes.includes(file.type)) {
            throw new Error('Invalid file type. Please upload a JPEG, PNG, or GIF image.');
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            throw new Error('File size too large. Maximum size is 5MB.');
        }

        const storageRef = storage.ref(`teams/${Date.now()}_${file.name}`);
        await storageRef.put(file);
        return await storageRef.getDownloadURL();
    } catch (error) {
        throw new Error(`Error uploading logo: ${error.message}`);
    }
}

// Load teams
async function loadTeams() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    try {
        loadingOverlay.style.display = 'flex';
        const teamsRef = db.collection('teams');
        const snapshot = await teamsRef.orderBy('name').get();
        
        const teamsGrid = document.getElementById('teamsGrid');
        if (!teamsGrid) return;
        
        teamsGrid.innerHTML = '';
        
        if (snapshot.empty) {
            teamsGrid.innerHTML = '<div class="no-data">No teams found</div>';
            return;
        }
        
        snapshot.forEach(doc => {
            const data = doc.data();
            const team = document.createElement('div');
            team.className = 'grid-item';
            team.innerHTML = `
                <div class="item-card">
                    ${data.logoUrl ? `<img src="${data.logoUrl}" alt="${data.name}" class="team-logo" onerror="this.src='placeholder.jpg'">` : ''}
                    <div class="item-content">
                        <h3>${data.name}</h3>
                        <p class="team-info"><i class="fas fa-map-marker-alt"></i> ${data.city || 'No city'}</p>
                        <p class="team-info"><i class="fas fa-user"></i> Coach: ${data.coach || 'Not specified'}</p>
                        <p class="team-info"><i class="fas fa-home"></i> ${data.homeVenue || 'No home venue'}</p>
                        <div class="item-actions">
                            <button class="btn btn-icon" onclick="editTeam('${doc.id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-icon" onclick="deleteTeam('${doc.id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            teamsGrid.appendChild(team);
        });
    } catch (error) {
        console.error('Error loading teams:', error);
        window.showNotification('Error loading teams', 'error');
    } finally {
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
        }
    }
}

// Handle team form submission
async function handleTeamSubmit(event) {
    event.preventDefault();
    const loadingOverlay = document.getElementById('loadingOverlay');
    
    try {
        loadingOverlay.style.display = 'flex';
        
        const teamData = {
            name: document.getElementById('teamName').value.trim(),
            city: document.getElementById('teamCity').value.trim(),
            coach: document.getElementById('teamCoach').value.trim(),
            homeVenue: document.getElementById('teamHome').value.trim(),
            colors: document.getElementById('teamColors').value.trim(),
            description: document.getElementById('teamDescription').value.trim(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        if (!teamData.name) {
            throw new Error('Team name is required');
        }

        // Handle logo upload if present
        const logoFile = document.getElementById('teamLogo').files[0];
        if (logoFile) {
            const logoUrl = await uploadLogo(logoFile);
            teamData.logoUrl = logoUrl;
        }

        await db.collection('teams').add(teamData);
        
        window.showNotification('Team added successfully!', 'success');
        closeTeamModal();
        await loadTeams();
    } catch (error) {
        console.error('Error adding team:', error);
        window.showNotification(error.message || 'Error adding team', 'error');
    } finally {
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
        }
    }
}

// Delete team
window.deleteTeam = async (teamId) => {
    if (!confirm('Are you sure you want to delete this team?')) return;
    
    const loadingOverlay = document.getElementById('loadingOverlay');
    loadingOverlay.style.display = 'flex';
    
    try {
        const docRef = db.collection('teams').doc(teamId);
        const doc = await docRef.get();
        
        if (doc.exists) {
            const data = doc.data();
            if (data.logoUrl) {
                try {
                    const logoRef = storage.refFromURL(data.logoUrl);
                    await logoRef.delete();
                } catch (imageError) {
                    console.error('Error deleting logo:', imageError);
                }
            }
            await docRef.delete();
            window.showNotification('Team deleted successfully!', 'success');
        }
        
        await loadTeams();
    } catch (error) {
        console.error('Error deleting team:', error);
        window.showNotification('Error deleting team', 'error');
    } finally {
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
        }
    }
};

// Close team modal
function closeTeamModal() {
    const form = document.getElementById('teamForm');
    if (form) form.reset();
    const logoPreview = document.getElementById('logoPreview');
    if (logoPreview) logoPreview.style.display = 'none';
    window.closeModal('addTeamModal');
}

// Handle logo preview
const logoInput = document.getElementById('teamLogo');
if (logoInput) {
    logoInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!validTypes.includes(file.type)) {
            window.showNotification('Invalid file type. Please upload a JPEG, PNG, or GIF image.', 'error');
            e.target.value = '';
            return;
        }

        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            window.showNotification('File size too large. Maximum size is 5MB.', 'error');
            e.target.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = function(event) {
            const logoPreview = document.getElementById('logoPreview');
            logoPreview.src = event.target.result;
            logoPreview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    });
}
