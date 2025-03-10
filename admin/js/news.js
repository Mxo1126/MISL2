// News Management Functions
let currentNewsId = null;

// Import news module
import { firebase } from '../../js/firebase-config.js';

const db = firebase.firestore();
const storage = firebase.storage();

// Initialize Quill editor
let quill;
document.addEventListener('DOMContentLoaded', () => {
    quill = new Quill('#editor', {
        theme: 'snow',
        modules: {
            toolbar: [
                [{ 'header': [1, 2, 3, false] }],
                ['bold', 'italic', 'underline'],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                ['link', 'image'],
                ['clean']
            ]
        },
        placeholder: 'Write your article content here...'
    });

    // Add form submit handler
    document.getElementById('newsForm')?.addEventListener('submit', handleNewsSubmit);
    
    // Load initial data
    loadNews();
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
        const maxSize = 5 * 1024 * 1024; // 5MB in bytes
        if (file.size > maxSize) {
            throw new Error('File size too large. Maximum size is 5MB.');
        }

        const storageRef = storage.ref(`news/${Date.now()}_${file.name}`);
        await storageRef.put(file);
        return await storageRef.getDownloadURL();
    } catch (error) {
        throw new Error(`Error uploading image: ${error.message}`);
    }
}

// Load news articles
async function loadNews() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    try {
        loadingOverlay.style.display = 'flex';
        const newsRef = db.collection('news');
        const snapshot = await newsRef.orderBy('createdAt', 'desc').get();
        
        const newsGrid = document.getElementById('newsGrid');
        if (!newsGrid) return;
        
        newsGrid.innerHTML = '';
        
        if (snapshot.empty) {
            newsGrid.innerHTML = '<div class="no-data">No news articles found</div>';
            return;
        }
        
        snapshot.forEach(doc => {
            const data = doc.data();
            const date = data.date ? formatDate(data.date) : 'No date';
            
            const article = document.createElement('div');
            article.className = 'grid-item';
            article.innerHTML = `
                <div class="item-card">
                    ${data.imageUrl ? `<img src="${data.imageUrl}" alt="${data.title}" class="item-image" onerror="this.src='placeholder.jpg'">` : ''}
                    <div class="item-content">
                        <h3>${data.title}</h3>
                        <p class="item-date"><i class="fas fa-calendar-alt"></i> ${date}</p>
                        <div class="item-actions">
                            <button class="btn btn-icon" onclick="viewNews('${doc.id}')">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-icon" onclick="editNews('${doc.id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-icon" onclick="deleteNews('${doc.id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            newsGrid.appendChild(article);
        });
    } catch (error) {
        console.error('Error loading news:', error);
        window.showNotification('Error loading news articles', 'error');
    } finally {
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
        }
    }
}

// Handle news form submission
async function handleNewsSubmit(event) {
    event.preventDefault();
    const loadingOverlay = document.getElementById('loadingOverlay');
    
    try {
        loadingOverlay.style.display = 'flex';
        
        const newsData = {
            title: document.getElementById('newsTitle').value.trim(),
            date: document.getElementById('newsDate').value,
            content: quill.root.innerHTML,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        if (!newsData.title) {
            throw new Error('Title is required');
        }

        // Handle image upload if present
        const imageFile = document.getElementById('newsImage').files[0];
        if (imageFile) {
            const imageUrl = await uploadImage(imageFile);
            newsData.imageUrl = imageUrl;
        }

        if (currentNewsId) {
            await db.collection('news').doc(currentNewsId).update(newsData);
            window.showNotification('News article updated successfully!', 'success');
        } else {
            await db.collection('news').add(newsData);
            window.showNotification('News article added successfully!', 'success');
        }
        
        closeNewsModal();
        await loadNews();
    } catch (error) {
        console.error('Error handling news:', error);
        window.showNotification(error.message || 'Error handling news article', 'error');
    } finally {
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
        }
    }
}

// Delete news article
window.deleteNews = async (newsId) => {
    if (!confirm('Are you sure you want to delete this news article?')) return;
    
    const loadingOverlay = document.getElementById('loadingOverlay');
    loadingOverlay.style.display = 'flex';
    
    try {
        const docRef = db.collection('news').doc(newsId);
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
            window.showNotification('News article deleted successfully!', 'success');
        }
        
        await loadNews();
    } catch (error) {
        console.error('Error deleting news:', error);
        window.showNotification('Error deleting news article', 'error');
    } finally {
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
        }
    }
};

// Format date for display
function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } catch (error) {
        console.error('Error formatting date:', error);
        return dateString;
    }
}

// Close news modal
function closeNewsModal() {
    const modal = document.getElementById('addNewsModal');
    const form = document.getElementById('newsForm');
    if (form) form.reset();
    if (quill) quill.setContents([]);
    const imagePreview = document.getElementById('imagePreview');
    if (imagePreview) imagePreview.style.display = 'none';
    currentNewsId = null;
    window.closeModal('addNewsModal');
}

// Handle image preview
const imageInput = document.getElementById('newsImage');
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

// Open news modal
window.openNewsModal = (newsId = null) => {
    currentNewsId = newsId;
    const modal = document.getElementById('newsModal');
    const form = document.getElementById('newsForm');
    const titleElement = document.getElementById('newsModalTitle');
    const loadingOverlay = document.getElementById('loadingOverlay');

    // Reset form
    form.reset();
    quill.root.innerHTML = '';
    titleElement.textContent = newsId ? 'Edit News' : 'Add News';

    if (newsId) {
        loadingOverlay.style.display = 'flex';
        // Load existing news data
        const docRef = db.collection('news').doc(newsId);
        docRef.get()
            .then(doc => {
                if (doc.exists()) {
                    const data = doc.data();
                    document.getElementById('newsTitle').value = data.title;
                    document.getElementById('newsCategory').value = data.category || '';
                    document.getElementById('newsAuthor').value = data.author || '';
                    document.getElementById('newsDate').value = data.date ? new Date(data.date).toISOString().slice(0, 16) : '';
                    document.getElementById('newsTags').value = data.tags ? data.tags.join(', ') : '';
                    document.getElementById('newsExcerpt').value = data.excerpt || '';
                    quill.root.innerHTML = data.content || '';
                    
                    // Show existing image preview if any
                    const imagePreview = document.getElementById('newsImagePreview');
                    if (data.imageUrl) {
                        imagePreview.src = data.imageUrl;
                        imagePreview.style.display = 'block';
                    } else {
                        imagePreview.style.display = 'none';
                    }
                }
            })
            .catch(error => console.error('Error loading news:', error))
            .finally(() => loadingOverlay.style.display = 'none');
    } else {
        // Set default date to now for new articles
        document.getElementById('newsDate').value = new Date().toISOString().slice(0, 16);
        document.getElementById('newsImagePreview').style.display = 'none';
    }

    modal.style.display = 'block';
};

// Navigation
window.showSection = (sectionId) => {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.style.display = 'none';
    });
    
    // Show selected section
    document.getElementById(sectionId).style.display = 'block';
    
    // Update active state in sidebar
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Find and activate the clicked nav item
    const navItem = document.querySelector(`.nav-item[onclick*="'${sectionId}'"]`);
    if (navItem) {
        navItem.classList.add('active');
    }
};

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Fade in
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}
