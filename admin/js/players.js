// Players Management Functions
let currentPlayerId = null;

// Open player modal
window.openPlayerModal = (playerId = null) => {
    currentPlayerId = playerId;
    const modal = document.getElementById('playerModal');
    const form = document.getElementById('playerForm');
    const titleElement = document.getElementById('playerModalTitle');
    const loadingOverlay = document.getElementById('loadingOverlay');

    // Reset form
    form.reset();
    titleElement.textContent = playerId ? 'Edit Player' : 'Add Player';

    if (playerId) {
        loadingOverlay.style.display = 'flex';
        // Load existing player data
        const docRef = doc(db, 'players', playerId);
        getDocs(docRef)
            .then(doc => {
                if (doc.exists()) {
                    const data = doc.data();
                    document.getElementById('playerName').value = data.name;
                    document.getElementById('playerPosition').value = data.position;
                    document.getElementById('playerNumber').value = data.number;
                    document.getElementById('playerBio').value = data.bio;
                }
            })
            .catch(error => console.error('Error loading player:', error))
            .finally(() => loadingOverlay.style.display = 'none');
    }

    modal.style.display = 'block';
};

// Close player modal
window.closePlayerModal = () => {
    const modal = document.getElementById('playerModal');
    modal.style.display = 'none';
    currentPlayerId = null;
};

// Handle player form submission
document.getElementById('playerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const loadingOverlay = document.getElementById('loadingOverlay');
    loadingOverlay.style.display = 'flex';

    try {
        const name = document.getElementById('playerName').value;
        const position = document.getElementById('playerPosition').value;
        const number = document.getElementById('playerNumber').value;
        const bio = document.getElementById('playerBio').value;
        const imageFile = document.getElementById('playerImage').files[0];
        
        let imageUrl = '';
        
        // Upload image if provided
        if (imageFile) {
            const imageRef = ref(storage, `players/${Date.now()}_${imageFile.name}`);
            const snapshot = await uploadBytes(imageRef, imageFile);
            imageUrl = await getDownloadURL(snapshot.ref);
        }

        const playerData = {
            name,
            position,
            number: parseInt(number),
            bio,
            ...(imageUrl && { imageUrl })
        };

        if (currentPlayerId) {
            // Update existing player
            await updateDoc(doc(db, 'players', currentPlayerId), playerData);
        } else {
            // Add new player
            await addDoc(collection(db, 'players'), playerData);
        }

        closePlayerModal();
        loadPlayers();
        loadCounts();
    } catch (error) {
        console.error('Error saving player:', error);
        alert('Error saving player. Please try again.');
    } finally {
        loadingOverlay.style.display = 'none';
    }
});

// Delete player
window.deletePlayer = async (playerId) => {
    if (!confirm('Are you sure you want to delete this player?')) return;

    const loadingOverlay = document.getElementById('loadingOverlay');
    loadingOverlay.style.display = 'flex';

    try {
        // Get the player document to check for image URL
        const playerDoc = await getDocs(doc(db, 'players', playerId));
        if (playerDoc.exists()) {
            const data = playerDoc.data();
            // Delete image if exists
            if (data.imageUrl) {
                const imageRef = ref(storage, data.imageUrl);
                await deleteObject(imageRef);
            }
        }

        // Delete the player document
        await deleteDoc(doc(db, 'players', playerId));
        loadPlayers();
        loadCounts();
    } catch (error) {
        console.error('Error deleting player:', error);
        alert('Error deleting player. Please try again.');
    } finally {
        loadingOverlay.style.display = 'none';
    }
};

// Load players
window.loadPlayers = async () => {
    const loadingOverlay = document.getElementById('loadingOverlay');
    const playersGrid = document.getElementById('playersGrid');
    
    loadingOverlay.style.display = 'flex';
    playersGrid.innerHTML = '';

    try {
        const querySnapshot = await getDocs(collection(db, 'players'));
        
        if (querySnapshot.empty) {
            playersGrid.innerHTML = '<div class="no-data">No players found</div>';
            return;
        }

        const players = [];
        querySnapshot.forEach(doc => {
            players.push({ id: doc.id, ...doc.data() });
        });

        // Sort by jersey number
        players.sort((a, b) => a.number - b.number);

        players.forEach(item => {
            const card = document.createElement('div');
            card.className = 'grid-card';
            card.innerHTML = `
                ${item.imageUrl ? `<img src="${item.imageUrl}" alt="${item.name}" class="player-image">` : ''}
                <div class="card-header">
                    <h3>${item.name}</h3>
                    <div class="card-actions">
                        <button class="btn-icon" onclick="openPlayerModal('${item.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon" onclick="deletePlayer('${item.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="player-details">
                    <p><strong>Position:</strong> ${item.position}</p>
                    <p><strong>Number:</strong> ${item.number}</p>
                </div>
                <div class="player-bio">${item.bio}</div>
            `;
            playersGrid.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading players:', error);
        playersGrid.innerHTML = '<div class="error-message">Error loading players</div>';
    } finally {
        loadingOverlay.style.display = 'none';
    }
};

// Load players on page load
loadPlayers();
