// Events Management Functions
import { firebase } from '../../js/firebase-config.js';

const db = firebase.firestore();
const storage = firebase.storage();

let currentEventId = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Add form submit handler
    document.getElementById('eventForm')?.addEventListener('submit', handleEventSubmit);
    
    // Load initial data
    loadEvents();
});

// Upload image to Firebase Storage
async function uploadImage(file) {
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

        const storageRef = storage.ref(`events/${Date.now()}_${file.name}`);
        await storageRef.put(file);
        return await storageRef.getDownloadURL();
    } catch (error) {
        throw new Error(`Error uploading image: ${error.message}`);
    }
}

// Load events
async function loadEvents() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    const eventsGrid = document.getElementById('eventsGrid');
    
    try {
        if (!eventsGrid) return;
        
        loadingOverlay.style.display = 'flex';
        eventsGrid.innerHTML = '';

        const eventsRef = db.collection('events');
        const snapshot = await eventsRef.orderBy('date', 'asc').get();
        
        if (snapshot.empty) {
            eventsGrid.innerHTML = '<div class="no-data">No events found</div>';
            return;
        }

        const events = [];
        snapshot.forEach(doc => {
            events.push({ id: doc.id, ...doc.data() });
        });

        events.forEach(item => {
            const eventDate = new Date(item.date);
            const isPastEvent = eventDate < new Date();
            
            const card = document.createElement('div');
            card.className = 'grid-card';
            card.style.opacity = isPastEvent ? '0.7' : '1';
            card.innerHTML = `
                ${item.imageUrl ? `<img src="${item.imageUrl}" alt="${item.title}" class="event-image" onerror="this.src='placeholder.jpg'">` : ''}
                <div class="card-header">
                    <h3>${item.title}</h3>
                    <div class="card-actions">
                        <button class="btn-icon" onclick="editEvent('${item.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon" onclick="deleteEvent('${item.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="event-details">
                    <p><i class="fas fa-calendar"></i> ${formatDate(eventDate)}</p>
                    <p><i class="fas fa-map-marker-alt"></i> ${item.venue || 'No venue specified'}</p>
                </div>
                <div class="event-description">${item.description || ''}</div>
            `;
            eventsGrid.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading events:', error);
        if (eventsGrid) {
            eventsGrid.innerHTML = '<div class="error-message">Error loading events</div>';
        }
        window.showNotification('Error loading events', 'error');
    } finally {
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
        }
    }
}

// Handle event form submission
async function handleEventSubmit(event) {
    event.preventDefault();
    const loadingOverlay = document.getElementById('loadingOverlay');
    
    try {
        loadingOverlay.style.display = 'flex';
        
        const eventData = {
            title: document.getElementById('eventTitle').value.trim(),
            date: document.getElementById('eventDate').value,
            venue: document.getElementById('eventVenue').value.trim(),
            description: document.getElementById('eventDescription').value.trim(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        if (!eventData.title) {
            throw new Error('Event title is required');
        }

        if (!eventData.date) {
            throw new Error('Event date is required');
        }

        // Handle image upload if present
        const imageFile = document.getElementById('eventImage').files[0];
        if (imageFile) {
            const imageUrl = await uploadImage(imageFile);
            eventData.imageUrl = imageUrl;
        }

        if (currentEventId) {
            await db.collection('events').doc(currentEventId).update(eventData);
            window.showNotification('Event updated successfully!', 'success');
        } else {
            await db.collection('events').add(eventData);
            window.showNotification('Event added successfully!', 'success');
        }
        
        closeEventModal();
        await loadEvents();
    } catch (error) {
        console.error('Error handling event:', error);
        window.showNotification(error.message || 'Error handling event', 'error');
    } finally {
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
        }
    }
}

// Delete event
window.deleteEvent = async (eventId) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    const loadingOverlay = document.getElementById('loadingOverlay');
    loadingOverlay.style.display = 'flex';

    try {
        const docRef = db.collection('events').doc(eventId);
        const doc = await docRef.get();
        
        if (doc.exists) {
            const data = doc.data();
            if (data.imageUrl) {
                try {
                    const imageRef = storage.refFromURL(data.imageUrl);
                    await imageRef.delete();
                } catch (imageError) {
                    console.error('Error deleting image:', imageError);
                }
            }
            await docRef.delete();
            window.showNotification('Event deleted successfully!', 'success');
        }
        
        await loadEvents();
    } catch (error) {
        console.error('Error deleting event:', error);
        window.showNotification('Error deleting event', 'error');
    } finally {
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
        }
    }
};

// Edit event
window.editEvent = async (eventId) => {
    currentEventId = eventId;
    const loadingOverlay = document.getElementById('loadingOverlay');
    
    try {
        loadingOverlay.style.display = 'flex';
        const docRef = db.collection('events').doc(eventId);
        const doc = await docRef.get();
        
        if (doc.exists) {
            const data = doc.data();
            document.getElementById('eventTitle').value = data.title || '';
            document.getElementById('eventDate').value = data.date ? new Date(data.date).toISOString().slice(0, 16) : '';
            document.getElementById('eventVenue').value = data.venue || '';
            document.getElementById('eventDescription').value = data.description || '';
            
            const imagePreview = document.getElementById('imagePreview');
            if (imagePreview && data.imageUrl) {
                imagePreview.src = data.imageUrl;
                imagePreview.style.display = 'block';
            }
        }
        
        window.openModal('addEventModal');
    } catch (error) {
        console.error('Error loading event:', error);
        window.showNotification('Error loading event details', 'error');
    } finally {
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
        }
    }
};

// Format date for display
function formatDate(date) {
    try {
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        console.error('Error formatting date:', error);
        return 'Invalid date';
    }
}

// Close event modal
function closeEventModal() {
    const form = document.getElementById('eventForm');
    if (form) form.reset();
    const imagePreview = document.getElementById('imagePreview');
    if (imagePreview) imagePreview.style.display = 'none';
    currentEventId = null;
    window.closeModal('addEventModal');
}

// Handle image preview
const imageInput = document.getElementById('eventImage');
if (imageInput) {
    imageInput.addEventListener('change', (e) => {
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
            const imagePreview = document.getElementById('imagePreview');
            imagePreview.src = event.target.result;
            imagePreview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    });
}
