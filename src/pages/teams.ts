import { PreferencesService } from '../services/preferences';
import { TicketModal } from '../components/ticket-modal';

class TeamsPage {
    private preferencesService: PreferencesService;
    private ticketModal: TicketModal;
    private activeFilter: string = 'all';
    private searchQuery: string = '';

    constructor() {
        this.preferencesService = PreferencesService.getInstance();
        this.ticketModal = new TicketModal();
        this.initializeEventListeners();
    }

    private initializeEventListeners(): void {
        this.setupFilters();
        this.setupSearch();
        this.setupFavoriteButtons();
        this.setupTicketButtons();
        this.setupAnimations();
    }

    private setupFilters(): void {
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const target = e.target as HTMLElement;
                this.activeFilter = target.dataset.filter || 'all';
                
                // Update active state
                filterButtons.forEach(btn => btn.classList.remove('active'));
                target.classList.add('active');

                this.filterTeams();
            });
        });
    }

    private setupSearch(): void {
        const searchInput = document.querySelector<HTMLInputElement>('.search-input');
        let debounceTimer: number;

        searchInput?.addEventListener('input', (e) => {
            const target = e.target as HTMLInputElement;
            clearTimeout(debounceTimer);
            debounceTimer = window.setTimeout(() => {
                this.searchQuery = target.value.toLowerCase();
                this.filterTeams();
            }, 300);
        });
    }

    private setupFavoriteButtons(): void {
        const favoriteButtons = document.querySelectorAll('.favorite-btn');
        const preferences = this.preferencesService.getPreferences();

        favoriteButtons.forEach(button => {
            const teamCard = button.closest('.team-card');
            const teamId = teamCard?.dataset.team;

            // Set initial state
            if (teamId === preferences.favoriteTeam) {
                button.querySelector('i')?.classList.replace('far', 'fas');
                button.setAttribute('aria-label', 'Remove from favorites');
            }

            button.addEventListener('click', () => {
                if (!teamId) return;

                const icon = button.querySelector('i');
                if (!icon) return;

                const isFavorite = icon.classList.contains('fas');
                
                if (isFavorite) {
                    icon.classList.replace('fas', 'far');
                    button.setAttribute('aria-label', 'Set as favorite team');
                    this.preferencesService.updatePreferences({ favoriteTeam: undefined });
                } else {
                    // Remove previous favorite
                    document.querySelectorAll('.favorite-btn i.fas').forEach(i => {
                        i.classList.replace('fas', 'far');
                        i.closest('button')?.setAttribute('aria-label', 'Set as favorite team');
                    });

                    icon.classList.replace('far', 'fas');
                    button.setAttribute('aria-label', 'Remove from favorites');
                    this.preferencesService.updatePreferences({ favoriteTeam: teamId });
                }
            });
        });
    }

    private setupTicketButtons(): void {
        document.querySelectorAll('.btn-buy-tickets').forEach(button => {
            button.addEventListener('click', (e) => {
                const target = e.target as HTMLElement;
                const teamCard = target.closest('.team-card');
                if (!teamCard) return;

                const gameId = teamCard.dataset.nextGameId;
                if (!gameId) {
                    console.error('No game ID found for ticket purchase');
                    return;
                }

                this.ticketModal.open(gameId);
            });
        });
    }

    private setupAnimations(): void {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '50px'
        });

        document.querySelectorAll('.team-card, .stat-card').forEach(card => {
            observer.observe(card);
        });
    }

    private filterTeams(): void {
        const teamCards = document.querySelectorAll('.team-card');
        
        teamCards.forEach(card => {
            const teamElement = card as HTMLElement;
            const division = teamElement.dataset.division || '';
            const teamName = teamElement.querySelector('h3')?.textContent?.toLowerCase() || '';
            const description = teamElement.querySelector('.team-description')?.textContent?.toLowerCase() || '';

            const matchesFilter = this.activeFilter === 'all' || division === this.activeFilter;
            const matchesSearch = !this.searchQuery || 
                teamName.includes(this.searchQuery) || 
                description.includes(this.searchQuery);

            teamElement.style.display = matchesFilter && matchesSearch ? 'block' : 'none';

            if (matchesFilter && matchesSearch) {
                this.animateTeamCard(teamElement);
            }
        });
    }

    private animateTeamCard(card: HTMLElement): void {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        requestAnimationFrame(() => {
            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        });
    }
}

// Initialize the teams page
document.addEventListener('DOMContentLoaded', () => {
    new TeamsPage();
});
