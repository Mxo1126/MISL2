import { WebSocketService } from './services/websocket';
import { PreferencesService } from './services/preferences';
import { Match } from './types';

class App {
    private wsService: WebSocketService;
    private preferencesService: PreferencesService;
    private activeMatches: Set<string> = new Set();

    constructor() {
        this.wsService = WebSocketService.getInstance();
        this.preferencesService = PreferencesService.getInstance();
        this.initializeApp();
    }

    private initializeApp(): void {
        this.registerServiceWorker();
        this.setupEventListeners();
        this.initializeTheme();
        this.subscribeToActiveMatches();
    }

    private async registerServiceWorker(): Promise<void> {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/service-worker.js');
                console.log('ServiceWorker registration successful:', registration.scope);
            } catch (error) {
                console.error('ServiceWorker registration failed:', error);
            }
        }
    }

    private setupEventListeners(): void {
        document.addEventListener('DOMContentLoaded', () => {
            this.setupNavigation();
            this.setupFilters();
            this.setupSearch();
            this.setupThemeToggle();
        });
    }

    private setupNavigation(): void {
        const menuToggle = document.querySelector('.menu-toggle');
        const navMenu = document.querySelector('.nav-menu');

        menuToggle?.addEventListener('click', () => {
            const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
            menuToggle.setAttribute('aria-expanded', (!isExpanded).toString());
            navMenu?.classList.toggle('active');
        });

        // Handle live games button
        const liveGamesBtn = document.querySelector('.btn-live');
        liveGamesBtn?.addEventListener('click', () => {
            window.location.href = 'live-scores.html';
        });
    }

    private setupFilters(): void {
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const target = e.target as HTMLElement;
                filterButtons.forEach(btn => btn.classList.remove('active'));
                target.classList.add('active');
                this.filterMatches(target.dataset.filter || 'all');
            });
        });
    }

    private setupSearch(): void {
        const searchInput = document.querySelector<HTMLInputElement>('.search-box input');
        let debounceTimer: number;

        searchInput?.addEventListener('input', (e) => {
            const target = e.target as HTMLInputElement;
            clearTimeout(debounceTimer);
            debounceTimer = window.setTimeout(() => {
                this.searchMatches(target.value);
            }, 300);
        });
    }

    private setupThemeToggle(): void {
        const themeToggle = document.querySelector('.theme-toggle');
        themeToggle?.addEventListener('click', () => {
            this.preferencesService.toggleTheme();
        });
    }

    private initializeTheme(): void {
        const preferences = this.preferencesService.getPreferences();
        document.documentElement.setAttribute('data-theme', preferences.theme);
    }

    private subscribeToActiveMatches(): void {
        const liveMatches = document.querySelectorAll('.match-card[data-status="live"]');
        liveMatches.forEach(match => {
            const matchId = match.getAttribute('data-match-id');
            if (matchId && !this.activeMatches.has(matchId)) {
                this.activeMatches.add(matchId);
                this.wsService.subscribeToMatch(matchId, (matchData: Match) => {
                    this.updateMatchDisplay(matchId, matchData);
                });
            }
        });
    }

    private updateMatchDisplay(matchId: string, match: Match): void {
        const matchElement = document.querySelector(`[data-match-id="${matchId}"]`);
        if (!matchElement) return;

        // Update score
        const scoreElement = matchElement.querySelector('.team-score');
        if (scoreElement) {
            scoreElement.textContent = `${match.score.home} - ${match.score.away}`;
        }

        // Update stats
        const statsElement = matchElement.querySelector('.match-stats');
        if (statsElement) {
            statsElement.innerHTML = `
                <div class="stat">
                    <span>Hits</span>
                    <span>${match.stats.hits.home} - ${match.stats.hits.away}</span>
                </div>
                <div class="stat">
                    <span>Errors</span>
                    <span>${match.stats.errors.home} - ${match.stats.errors.away}</span>
                </div>
            `;
        }
    }

    private filterMatches(filter: string): void {
        const matches = document.querySelectorAll('.match-card');
        matches.forEach(match => {
            const matchElement = match as HTMLElement;
            const isVisible = this.shouldShowMatch(matchElement, filter);
            matchElement.style.display = isVisible ? 'flex' : 'none';
        });
    }

    private shouldShowMatch(match: HTMLElement, filter: string): boolean {
        switch (filter) {
            case 'live':
                return match.dataset.status === 'live';
            case 'upcoming':
                return match.dataset.status === 'upcoming';
            case 'finished':
                return match.dataset.status === 'finished';
            case 'favorite':
                const preferences = this.preferencesService.getPreferences();
                return match.dataset.homeTeam === preferences.favoriteTeam || 
                       match.dataset.awayTeam === preferences.favoriteTeam;
            default:
                return true;
        }
    }

    private searchMatches(query: string): void {
        const matches = document.querySelectorAll('.match-card');
        const normalizedQuery = query.toLowerCase();

        matches.forEach(match => {
            const matchElement = match as HTMLElement;
            const teamNames = matchElement.querySelectorAll('.team-name');
            const teams = Array.from(teamNames).map(team => team.textContent?.toLowerCase() || '');
            const matchesSearch = teams.some(team => team.includes(normalizedQuery));
            matchElement.style.display = matchesSearch ? 'flex' : 'none';
        });
    }
}

// Initialize the application
new App();
