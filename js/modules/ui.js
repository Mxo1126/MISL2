// UI Module for enhanced user interactions
export const UI = {
    // Initialize all UI components
    init() {
        this.initNavigation();
        this.initAnimations();
        this.initLiveScores();
        this.initStatistics();
        this.initMediaGallery();
        this.initSearchFeatures();
        this.initMobileMenu();
        this.handleResize();
    },

    // Enhanced Navigation
    initNavigation() {
        const nav = document.querySelector('.navbar');
        let lastScroll = 0;

        // Hide/show navigation on scroll
        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            
            if (currentScroll <= 0) {
                nav.classList.remove('scroll-up');
                return;
            }
            
            if (currentScroll > lastScroll && !nav.classList.contains('scroll-down')) {
                nav.classList.remove('scroll-up');
                nav.classList.add('scroll-down');
            } else if (currentScroll < lastScroll && nav.classList.contains('scroll-down')) {
                nav.classList.remove('scroll-down');
                nav.classList.add('scroll-up');
            }
            lastScroll = currentScroll;
        });
    },

    // Enhanced Animations
    initAnimations() {
        const animatedElements = document.querySelectorAll('.animate-on-scroll');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                    if (entry.target.dataset.delay) {
                        entry.target.style.animationDelay = `${entry.target.dataset.delay}s`;
                    }
                }
            });
        }, { threshold: 0.1 });

        animatedElements.forEach(el => observer.observe(el));
    },

    // Live Scores Feature
    initLiveScores() {
        const liveScores = document.querySelectorAll('.live-score');
        
        const updateScore = (element) => {
            const matchId = element.dataset.matchId;
            fetch(`/api/matches/${matchId}/score`)
                .then(response => response.json())
                .then(data => {
                    element.querySelector('.home-score').textContent = data.homeScore;
                    element.querySelector('.away-score').textContent = data.awayScore;
                    
                    // Add score change animation
                    element.classList.add('score-updated');
                    setTimeout(() => element.classList.remove('score-updated'), 1000);
                })
                .catch(error => console.error('Error updating score:', error));
        };

        // Update scores every 30 seconds
        liveScores.forEach(score => {
            setInterval(() => updateScore(score), 30000);
        });
    },

    // Interactive Statistics
    initStatistics() {
        const stats = document.querySelectorAll('.stat-value');
        
        const animateValue = (element, start, end, duration) => {
            let startTimestamp = null;
            const step = (timestamp) => {
                if (!startTimestamp) startTimestamp = timestamp;
                const progress = Math.min((timestamp - startTimestamp) / duration, 1);
                const value = Math.floor(progress * (end - start) + start);
                element.textContent = value;
                if (progress < 1) {
                    window.requestAnimationFrame(step);
                }
            };
            window.requestAnimationFrame(step);
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const target = entry.target;
                    const endValue = parseInt(target.dataset.value);
                    animateValue(target, 0, endValue, 2000);
                    observer.unobserve(target);
                }
            });
        }, { threshold: 0.5 });

        stats.forEach(stat => observer.observe(stat));
    },

    // Media Gallery
    initMediaGallery() {
        const gallery = document.querySelector('.media-gallery');
        if (!gallery) return;

        const modal = document.createElement('div');
        modal.className = 'media-modal';
        document.body.appendChild(modal);

        gallery.addEventListener('click', (e) => {
            const mediaItem = e.target.closest('.media-item');
            if (!mediaItem) return;

            const mediaUrl = mediaItem.dataset.fullsize;
            const mediaType = mediaItem.dataset.type;

            modal.innerHTML = mediaType === 'video' 
                ? `<video src="${mediaUrl}" controls autoplay></video>`
                : `<img src="${mediaUrl}" alt="Full size media">`;
            
            modal.classList.add('active');
        });

        modal.addEventListener('click', () => {
            modal.classList.remove('active');
        });
    },

    // Enhanced Search Features
    initSearchFeatures() {
        const searchInput = document.querySelector('.search-input');
        if (!searchInput) return;

        const searchResults = document.createElement('div');
        searchResults.className = 'search-results';
        searchInput.parentNode.appendChild(searchResults);

        let debounceTimer;

        searchInput.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                const query = e.target.value;
                if (query.length < 2) {
                    searchResults.innerHTML = '';
                    return;
                }

                fetch(`/api/search?q=${encodeURIComponent(query)}`)
                    .then(response => response.json())
                    .then(data => {
                        searchResults.innerHTML = data.results
                            .map(result => `
                                <div class="search-result-item">
                                    <a href="${result.url}">
                                        <h4>${result.title}</h4>
                                        <p>${result.excerpt}</p>
                                    </a>
                                </div>
                            `)
                            .join('');
                    })
                    .catch(error => console.error('Search error:', error));
            }, 300);
        });

        // Close search results when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-container')) {
                searchResults.innerHTML = '';
            }
        });
    },

    // Mobile Menu
    initMobileMenu() {
        const menuToggle = document.querySelector('.menu-toggle');
        const navMenu = document.querySelector('.nav-menu');
        const navLinks = document.querySelectorAll('.nav-menu a');

        if (menuToggle && navMenu) {
            // Toggle menu
            menuToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                menuToggle.classList.toggle('active');
                document.body.classList.toggle('menu-open');
            });

            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
                    navMenu.classList.remove('active');
                    menuToggle.classList.remove('active');
                    document.body.classList.remove('menu-open');
                }
            });

            // Close menu when clicking on links
            navLinks.forEach(link => {
                link.addEventListener('click', () => {
                    navMenu.classList.remove('active');
                    menuToggle.classList.remove('active');
                    document.body.classList.remove('menu-open');
                });
            });
        }
    },

    // Handle window resize
    handleResize() {
        const navMenu = document.querySelector('.nav-menu');
        const menuToggle = document.querySelector('.menu-toggle');

        window.addEventListener('resize', () => {
            if (window.innerWidth > 991) {
                navMenu?.classList.remove('active');
                menuToggle?.classList.remove('active');
                document.body.classList.remove('menu-open');
            }
        });
    }
};

// Initialize UI when DOM is loaded
document.addEventListener('DOMContentLoaded', () => UI.init());
