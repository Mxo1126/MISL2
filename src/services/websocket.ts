import { io, Socket } from 'socket.io-client';
import { Match } from '../types';

export class WebSocketService {
    private socket: Socket;
    private static instance: WebSocketService;

    private constructor() {
        this.socket = io('wss://api.misl.com', {
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000
        });

        this.setupEventListeners();
    }

    public static getInstance(): WebSocketService {
        if (!WebSocketService.instance) {
            WebSocketService.instance = new WebSocketService();
        }
        return WebSocketService.instance;
    }

    private setupEventListeners(): void {
        this.socket.on('connect', () => {
            console.log('Connected to WebSocket server');
            this.showNotification('Connected to live updates');
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from WebSocket server');
            this.showNotification('Live updates disconnected', 'error');
        });

        this.socket.on('error', (error: Error) => {
            console.error('WebSocket error:', error);
            this.showNotification('Error connecting to live updates', 'error');
        });
    }

    public subscribeToMatch(matchId: string, callback: (match: Match) => void): void {
        this.socket.on(`match:${matchId}`, callback);
    }

    public unsubscribeFromMatch(matchId: string): void {
        this.socket.off(`match:${matchId}`);
    }

    private showNotification(message: string, type: 'info' | 'error' = 'info'): void {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    public disconnect(): void {
        this.socket.disconnect();
    }
}
