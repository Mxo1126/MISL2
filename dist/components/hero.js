export class HeroSection {
    constructor() {
        this.currentMatchId = null;
        this.setupEventListeners();
    }
    static getInstance() {
        if (!HeroSection.instance) {
            HeroSection.instance = new HeroSection();
        }
        return HeroSection.instance;
    }
    setupEventListeners() {
        const viewScheduleBtn = document.querySelector('.hero-cta .btn-primary');
        const watchLiveBtn = document.querySelector('.hero-cta .btn-secondary');
        viewScheduleBtn?.addEventListener('click', (e) => {
            e.preventDefault();
            this.scrollToSchedule();
        });
        watchLiveBtn?.addEventListener('click', (e) => {
            e.preventDefault();
            this.handleWatchLive();
        });
    }
    scrollToSchedule() {
        const scheduleSection = document.querySelector('.featured-match');
        if (scheduleSection) {
            scheduleSection.scrollIntoView({ behavior: 'smooth' });
        }
    }
    handleWatchLive() {
        const liveMatch = document.querySelector('.featured-match-card');
        if (!liveMatch)
            return;
        const matchId = liveMatch.dataset.matchId;
        if (!matchId)
            return;
        // If we're already watching this match, just scroll to it
        if (this.currentMatchId === matchId) {
            liveMatch.scrollIntoView({ behavior: 'smooth' });
            return;
        }
        // Otherwise, open the live stream
        this.openLiveStream(matchId);
    }
    openLiveStream(matchId) {
        this.currentMatchId = matchId;
        // Create video container if it doesn't exist
        let videoContainer = document.querySelector('.live-stream-container');
        if (!videoContainer) {
            videoContainer = document.createElement('div');
            videoContainer.className = 'live-stream-container';
            videoContainer.innerHTML = `
                <div class="live-stream-header">
                    <h3>Live Stream</h3>
                    <button class="close-stream" aria-label="Close live stream">×</button>
                </div>
                <div class="video-wrapper">
                    <video id="live-stream-player" controls autoplay>
                        <source src="/streams/${matchId}/master.m3u8" type="application/x-mpegURL">
                        Your browser does not support HTML5 video.
                    </video>
                </div>
                <div class="stream-controls">
                    <button class="quality-toggle">HD</button>
                    <button class="fullscreen-toggle">
                        <i class="fas fa-expand"></i>
                    </button>
                </div>
            `;
            document.body.appendChild(videoContainer);
            // Setup stream controls
            const closeBtn = videoContainer.querySelector('.close-stream');
            closeBtn?.addEventListener('click', () => this.closeLiveStream());
            const fullscreenBtn = videoContainer.querySelector('.fullscreen-toggle');
            fullscreenBtn?.addEventListener('click', () => this.toggleFullscreen());
        }
        // Show the container with animation
        requestAnimationFrame(() => {
            videoContainer.classList.add('active');
        });
    }
    closeLiveStream() {
        const videoContainer = document.querySelector('.live-stream-container');
        if (!videoContainer)
            return;
        videoContainer.classList.remove('active');
        this.currentMatchId = null;
        // Remove the container after animation
        setTimeout(() => {
            videoContainer.remove();
        }, 300);
    }
    toggleFullscreen() {
        const videoWrapper = document.querySelector('.video-wrapper');
        if (!videoWrapper)
            return;
        if (!document.fullscreenElement) {
            videoWrapper.requestFullscreen?.();
        }
        else {
            document.exitFullscreen?.();
        }
    }
}
