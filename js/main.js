// DOM Elements and Event Handlers
const initializeEventListeners = () => {
    document.addEventListener('DOMContentLoaded', () => {
        setupLiveGamesButton();
        setupFixtureFilters();
        setupSearch();
        setupTeamCards();
        setupActionButtons();
    });
};

const setupLiveGamesButton = () => {
    const liveGamesBtn = document.querySelector('.btn-live');
    liveGamesBtn?.addEventListener('click', () => {
        window.location.href = 'live-scores.html';
    });
};

const setupFixtureFilters = () => {
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            filterFixtures(button.textContent.toLowerCase());
        });
    });
};

const setupSearch = () => {
    const searchInput = document.querySelector('.search-box input');
    searchInput?.addEventListener('input', (e) => {
        searchFixtures(e.target.value);
    });
};

const setupTeamCards = () => {
    const teamCards = document.querySelectorAll('.team-card');
    teamCards.forEach(card => {
        card.addEventListener('click', () => {
            const teamId = card.dataset.team;
            window.location.href = `team-details.html?team=${teamId}`;
        });
    });
};

const setupActionButtons = () => {
    setupWatchButtons();
    setupStatsButtons();
};

const setupWatchButtons = () => {
    const watchButtons = document.querySelectorAll('.btn-watch');
    watchButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'watch-live.html';
        });
    });
};

const setupStatsButtons = () => {
    const statsButtons = document.querySelectorAll('.btn-stats');
    statsButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'match-stats.html';
        });
    });
};

// Fixture Filtering Logic
const filterFixtures = (filter) => {
    const fixtureCards = document.querySelectorAll('.fixture-card');
    
    fixtureCards.forEach(card => {
        const displayStyle = getDisplayStyle(filter, card);
        card.style.display = displayStyle;
    });
};

const getDisplayStyle = (filter, card) => {
    switch(filter) {
        case 'all matches':
            return 'flex';
        case 'this week':
            return checkIfThisWeek(card) ? 'flex' : 'none';
        case 'this month':
            return checkIfThisMonth(card) ? 'flex' : 'none';
        case 'my team':
            return checkIfMyTeam(card) ? 'flex' : 'none';
        default:
            return 'flex';
    }
};

// Search Logic
const searchFixtures = (query) => {
    const fixtureCards = document.querySelectorAll('.fixture-card');
    const normalizedQuery = query.toLowerCase();
    
    fixtureCards.forEach(card => {
        const teamNames = card.querySelectorAll('.team span');
        const teams = Array.from(teamNames).map(team => team.textContent.toLowerCase());
        const matchesSearch = teams.some(team => team.includes(normalizedQuery));
        card.style.display = matchesSearch ? 'flex' : 'none';
    });
};

// Helper Functions
function checkIfThisWeek(card) {
    const dateElement = card.querySelector('.fixture-date');
    // Add logic to check if date is within current week
    return true; // Placeholder
}

function checkIfThisMonth(card) {
    const dateElement = card.querySelector('.fixture-date');
    // Add logic to check if date is within current month
    return true; // Placeholder
}

function checkIfMyTeam(card) {
    // Add logic to check if user's favorite team is playing
    return true; // Placeholder
}

// Live Match Updates
const updateLiveMatch = async () => {
    try {
        const response = await fetch('/api/live-matches');
        if (!response.ok) throw new Error('Failed to fetch live matches');
        
        const matches = await response.json();
        updateMatchDisplay(matches);
    } catch (error) {
        console.error('Error updating live matches:', error);
        showErrorNotification('Unable to update live matches');
    }
};

const updateMatchDisplay = (matches) => {
    matches.forEach(match => {
        const matchElement = document.querySelector(`[data-match-id="${match.id}"]`);
        if (matchElement) {
            updateMatchScore(matchElement, match);
            updateMatchStats(matchElement, match);
        }
    });
};

const showErrorNotification = (message) => {
    // Add notification implementation
    console.error(message);
};

const updateMatchScore = (matchElement, match) => {
    // Add logic to update match score
};

const updateMatchStats = (matchElement, match) => {
    // Add logic to update match stats
};

// Initialize the application
initializeEventListeners();

// Update live matches every minute
setInterval(updateLiveMatch, 60000);