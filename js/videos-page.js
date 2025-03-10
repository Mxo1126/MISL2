// Initialize variables
let currentDivision = 'all';
let currentCategory = '';
let currentDateFilter = '';
let lastVideoDoc = null;
const videosPerPage = 12;

// DOM Elements
const divisionButtons = document.querySelectorAll('.division-btn');
const searchInput = document.querySelector('.search-input input');
const filterSelects = document.querySelectorAll('.filter-group select');
const videosGrid = document.querySelector('.videos-grid');
const loadingState = document.querySelector('.loading');
const emptyState = document.querySelector('.empty-state');
const errorState = document.querySelector('.error-state');
const loadMoreBtn = document.querySelector('.load-more');
const featuredPlayer = document.querySelector('.featured-player');

// Event Listeners
divisionButtons.forEach(button => {
    button.addEventListener('click', () => {
        divisionButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        currentDivision = button.textContent.toLowerCase().replace(' league', '').replace(' ', '-');
        resetAndLoadVideos();
    });
});

searchInput.addEventListener('input', debounce(() => {
    resetAndLoadVideos();
}, 300));

filterSelects.forEach(select => {
    select.addEventListener('change', () => {
        if (select.value.includes('highlights') || select.value.includes('interviews')) {
            currentCategory = select.value;
        } else {
            currentDateFilter = select.value;
        }
        resetAndLoadVideos();
    });
});

loadMoreBtn.addEventListener('click', loadMoreVideos);

// Initialize videos on page load
document.addEventListener('DOMContentLoaded', () => {
    loadVideos();
    setupFeaturedVideo();
});

// Helper Functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function resetAndLoadVideos() {
    videosGrid.innerHTML = '';
    lastVideoDoc = null;
    loadVideos();
}

async function loadVideos() {
    try {
        showLoading(true);
        
        let query = db.collection('videos')
            .orderBy('publishDate', 'desc');

        // Apply division filter
        if (currentDivision !== 'all') {
            query = query.where('division', '==', currentDivision);
        }

        // Apply category filter
        if (currentCategory) {
            query = query.where('category', '==', currentCategory);
        }

        // Apply date filter
        if (currentDateFilter) {
            const dateLimit = getDateLimit(currentDateFilter);
            query = query.where('publishDate', '>=', dateLimit);
        }

        // Apply search
        const searchTerm = searchInput.value.toLowerCase().trim();
        
        // Get next batch
        if (lastVideoDoc) {
            query = query.startAfter(lastVideoDoc);
        }
        
        query = query.limit(videosPerPage);

        const snapshot = await query.get();
        
        if (snapshot.empty && !lastVideoDoc) {
            showEmptyState(true);
            return;
        }

        const videos = [];
        snapshot.forEach(doc => {
            const video = doc.data();
            if (!searchTerm || 
                video.title.toLowerCase().includes(searchTerm) ||
                video.description?.toLowerCase().includes(searchTerm) ||
                video.teams?.some(team => team.toLowerCase().includes(searchTerm))) {
                videos.push({ id: doc.id, ...video });
            }
        });

        lastVideoDoc = snapshot.docs[snapshot.docs.length - 1];
        
        renderVideos(videos);
        showEmptyState(videos.length === 0);
        loadMoreBtn.style.display = snapshot.docs.length < videosPerPage ? 'none' : 'block';

    } catch (error) {
        console.error('Error loading videos:', error);
        showError(true);
    } finally {
        showLoading(false);
    }
}

function renderVideos(videos) {
    videos.forEach(video => {
        const videoItem = createVideoItem(video);
        videosGrid.appendChild(videoItem);
    });
}

function createVideoItem(video) {
    const div = document.createElement('div');
    div.className = 'video-item';
    
    const divisionClass = getDivisionClass(video.division);
    
    div.innerHTML = `
        <div class="thumbnail-wrap">
            <img src="${video.thumbnailUrl}" alt="${video.title}">
            <div class="division-tag ${divisionClass}">${formatDivision(video.division)}</div>
            <div class="video-duration">${formatDuration(video.duration)}</div>
        </div>
        <div class="video-details">
            <h3>${video.title}</h3>
            <div class="video-meta">
                <span>${formatDate(video.publishDate)}</span>
                <span>${formatViews(video.views)} views</span>
            </div>
        </div>
    `;
    
    div.addEventListener('click', () => {
        playVideo(video);
    });
    
    return div;
}

function getDivisionClass(division) {
    switch (division?.toLowerCase()) {
        case 'premier': return 'premier';
        case 'division-1': return 'div-1';
        case 'division-2': return 'div-2';
        case 'womens': return 'womens';
        case 'youth': return 'youth';
        default: return '';
    }
}

function formatDivision(division) {
    switch (division?.toLowerCase()) {
        case 'premier': return 'Premier League';
        case 'division-1': return 'Division 1';
        case 'division-2': return 'Division 2';
        case 'womens': return 'Women\'s League';
        case 'youth': return 'Youth League';
        default: return division || '';
    }
}

function showEmptyState(show) {
    emptyState.style.display = show ? 'block' : 'none';
    loadMoreBtn.style.display = show ? 'none' : 'block';
}

function showError(show) {
    errorState.style.display = show ? 'block' : 'none';
    loadMoreBtn.style.display = show ? 'none' : 'block';
}

function showLoading(show) {
    loadingState.style.display = show ? 'block' : 'none';
    loadMoreBtn.style.display = show ? 'none' : 'block';
}

function getDateLimit(filter) {
    const now = new Date();
    switch (filter) {
        case 'today':
            now.setHours(0, 0, 0, 0);
            return now;
        case 'week':
            return new Date(now.setDate(now.getDate() - 7));
        case 'month':
            return new Date(now.setMonth(now.getMonth() - 1));
        case 'year':
            return new Date(now.setFullYear(now.getFullYear() - 1));
        default:
            return null;
    }
}

function formatDuration(seconds) {
    if (!seconds) return '00:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function formatDate(timestamp) {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('en-ZA', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }).format(date);
}

function formatViews(views) {
    if (!views) return '0';
    if (views < 1000) return views.toString();
    if (views < 1000000) return `${(views / 1000).toFixed(1)}K`;
    return `${(views / 1000000).toFixed(1)}M`;
}

async function loadMoreVideos() {
    if (lastVideoDoc) {
        await loadVideos();
    }
}

async function setupFeaturedVideo() {
    try {
        const featuredSnapshot = await db.collection('videos')
            .where('featured', '==', true)
            .orderBy('publishDate', 'desc')
            .limit(1)
            .get();

        if (!featuredSnapshot.empty) {
            const featuredVideo = { 
                id: featuredSnapshot.docs[0].id, 
                ...featuredSnapshot.docs[0].data() 
            };
            
            const featuredPreview = document.querySelector('.featured-preview');
            const featuredInfo = document.querySelector('.featured-info');
            
            if (featuredPreview && featuredInfo) {
                featuredPreview.querySelector('img').src = featuredVideo.thumbnailUrl;
                featuredPreview.querySelector('.division-tag').className = 
                    `division-tag ${getDivisionClass(featuredVideo.division)}`;
                featuredPreview.querySelector('.division-tag').textContent = 
                    formatDivision(featuredVideo.division);
                
                featuredInfo.querySelector('h3').textContent = featuredVideo.title;
                const meta = featuredInfo.querySelector('.featured-meta');
                meta.innerHTML = `
                    <span><i class="far fa-calendar"></i> ${formatDate(featuredVideo.publishDate)}</span>
                    <span><i class="far fa-clock"></i> ${formatDuration(featuredVideo.duration)}</span>
                    <span><i class="far fa-eye"></i> ${formatViews(featuredVideo.views)} views</span>
                `;
                
                featuredPlayer.addEventListener('click', () => {
                    playVideo(featuredVideo);
                });
            }
        }
    } catch (error) {
        console.error('Error setting up featured video:', error);
    }
}

function playVideo(video) {
    // Implement video playback logic here
    // This could open a modal, redirect to a video page, or integrate with a video player
    console.log('Playing video:', video.id);
    window.location.href = `/watch.html?id=${video.id}`;
}
