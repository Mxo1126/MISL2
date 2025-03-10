// Live Updates Module for real-time data handling
export const LiveUpdates = {
    // WebSocket connection
    socket: null,
    
    // Initialize live updates
    init() {
        this.connectWebSocket();
        this.initializeListeners();
    },

    // Connect to WebSocket server
    connectWebSocket() {
        this.socket = new WebSocket(location.origin.replace(/^http/, 'ws') + '/ws');
        
        this.socket.onopen = () => {
            console.log('WebSocket connected');
            this.subscribeToUpdates();
        };

        this.socket.onclose = () => {
            console.log('WebSocket disconnected, attempting to reconnect...');
            setTimeout(() => this.connectWebSocket(), 5000);
        };

        this.socket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        this.socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.handleUpdate(data);
        };
    },

    // Subscribe to relevant update channels
    subscribeToUpdates() {
        const subscriptions = [
            'live_scores',
            'match_events',
            'statistics',
            'notifications'
        ];

        subscriptions.forEach(channel => {
            this.socket.send(JSON.stringify({
                action: 'subscribe',
                channel: channel
            }));
        });
    },

    // Initialize DOM event listeners
    initializeListeners() {
        // Live score updates
        document.querySelectorAll('[data-live-score]').forEach(element => {
            this.initializeLiveScore(element);
        });

        // Match events
        document.querySelectorAll('[data-match-events]').forEach(element => {
            this.initializeMatchEvents(element);
        });

        // Statistics updates
        document.querySelectorAll('[data-live-stat]').forEach(element => {
            this.initializeLiveStatistic(element);
        });
    },

    // Handle incoming updates
    handleUpdate(data) {
        switch(data.type) {
            case 'score_update':
                this.updateScore(data);
                break;
            case 'match_event':
                this.addMatchEvent(data);
                break;
            case 'statistic_update':
                this.updateStatistic(data);
                break;
            case 'notification':
                this.showNotification(data);
                break;
        }
    },

    // Update live score display
    updateScore(data) {
        const scoreElement = document.querySelector(`[data-match-id="${data.matchId}"]`);
        if (!scoreElement) return;

        const homeScore = scoreElement.querySelector('.home-score');
        const awayScore = scoreElement.querySelector('.away-score');

        if (homeScore) homeScore.textContent = data.homeScore;
        if (awayScore) awayScore.textContent = data.awayScore;

        // Add update animation
        scoreElement.classList.add('score-updated');
        setTimeout(() => scoreElement.classList.remove('score-updated'), 1000);
    },

    // Add new match event
    addMatchEvent(data) {
        const eventsContainer = document.querySelector(`[data-match-events="${data.matchId}"]`);
        if (!eventsContainer) return;

        const eventElement = document.createElement('div');
        eventElement.className = `match-event ${data.eventType}`;
        eventElement.innerHTML = `
            <span class="event-time">${data.time}'</span>
            <span class="event-description">${data.description}</span>
        `;

        eventsContainer.insertBefore(eventElement, eventsContainer.firstChild);
        eventElement.classList.add('fade-in');
    },

    // Update live statistics
    updateStatistic(data) {
        const statElement = document.querySelector(`[data-stat-id="${data.statId}"]`);
        if (!statElement) return;

        const currentValue = parseInt(statElement.textContent);
        const newValue = data.value;

        // Animate value change
        this.animateValue(statElement, currentValue, newValue, 1000);
    },

    // Show notification
    showNotification(data) {
        const notification = document.createElement('div');
        notification.className = `notification ${data.type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <h4>${data.title}</h4>
                <p>${data.message}</p>
            </div>
            <button class="notification-close">&times;</button>
        `;

        document.body.appendChild(notification);
        setTimeout(() => notification.classList.add('show'), 100);

        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        });

        if (data.autoClose) {
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => notification.remove(), 300);
            }, 5000);
        }
    },

    // Utility function to animate value changes
    animateValue(element, start, end, duration) {
        const range = end - start;
        const startTime = performance.now();
        
        const updateValue = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            const currentValue = Math.round(start + (range * progress));
            element.textContent = currentValue;

            if (progress < 1) {
                requestAnimationFrame(updateValue);
            }
        };

        requestAnimationFrame(updateValue);
    }
};

// Initialize live updates when DOM is loaded
document.addEventListener('DOMContentLoaded', () => LiveUpdates.init());
