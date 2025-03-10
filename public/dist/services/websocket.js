import { io } from 'socket.io-client';
export class WebSocketService {
    constructor() {
        this.socket = io('wss://api.misl.com', {
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000
        });
        this.setupEventListeners();
    }
    static getInstance() {
        if (!WebSocketService.instance) {
            WebSocketService.instance = new WebSocketService();
        }
        return WebSocketService.instance;
    }
    setupEventListeners() {
        this.socket.on('connect', () => {
            console.log('Connected to WebSocket server');
            this.showNotification('Connected to live updates');
        });
        this.socket.on('disconnect', () => {
            console.log('Disconnected from WebSocket server');
            this.showNotification('Live updates disconnected', 'error');
        });
        this.socket.on('error', (error) => {
            console.error('WebSocket error:', error);
            this.showNotification('Error connecting to live updates', 'error');
        });
    }
    subscribeToMatch(matchId, callback) {
        this.socket.on(`match:${matchId}`, callback);
    }
    unsubscribeFromMatch(matchId) {
        this.socket.off(`match:${matchId}`);
    }
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    disconnect() {
        this.socket.disconnect();
    }
}
