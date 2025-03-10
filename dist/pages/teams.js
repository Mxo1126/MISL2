import { PreferencesService } from '../services/preferences';
import { TicketModal } from '../components/ticket-modal';
class TeamsPage {
    constructor() {
        this.activeFilter = 'all';
        this.searchQuery = '';
        this.preferencesService = PreferencesService.getInstance();
        this.ticketModal = new TicketModal();
        this.initializeEventListeners();
    }
    initializeEventListeners() {
        this.setupFilters();
        this.setupSearch();
        this.setupFavoriteButtons();
        this.setupTicketButtons();
        this.setupAnimations();
    }
    setupFilters() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const target = e.target;
                this.activeFilter = target.dataset.filter || 'all';
                // Update active state
                filterButtons.forEach(btn => btn.classList.remove('active'));
                target.classList.add('active');
                this.filterTeams();
            });
        });
    }
    setupSearch() {
        const searchInput = document.querySelector('.search-input');
        let debounceTimer;
        searchInput?.addEventListener('input', (e) => {
            const target = e.target;
            clearTimeout(debounceTimer);
            debounceTimer = window.setTimeout(() => {
                this.searchQuery = target.value.toLowerCase();
                this.filterTeams();
            }, 300);
        });
    }
    setupFavoriteButtons() {
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
                if (!teamId)
                    return;
                const icon = button.querySelector('i');
                if (!icon)
                    return;
                const isFavorite = icon.classList.contains('fas');
                if (isFavorite) {
                    icon.classList.replace('fas', 'far');
                    button.setAttribute('aria-label', 'Set as favorite team');
                    this.preferencesService.updatePreferences({ favoriteTeam: undefined });
                }
                else {
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
    setupTicketButtons() {
        document.querySelectorAll('.btn-buy-tickets').forEach(button => {
            button.addEventListener('click', (e) => {
                const target = e.target;
                const teamCard = target.closest('.team-card');
                if (!teamCard)
                    return;
                const gameId = teamCard.dataset.nextGameId;
                if (!gameId) {
                    console.error('No game ID found for ticket purchase');
                    return;
                }
                this.ticketModal.open(gameId);
            });
        });
    }
    setupAnimations() {
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
    filterTeams() {
        const teamCards = document.querySelectorAll('.team-card');
        teamCards.forEach(card => {
            const teamElement = card;
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
    animateTeamCard(card) {
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
