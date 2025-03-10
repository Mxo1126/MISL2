// Live Scores JavaScript
import { 
    db, 
    collection, 
    query, 
    where, 
    orderBy,
    onSnapshot,
    Timestamp 
} from './firebase-config.js';

// State Management
let currentDivision = 'premier';
let liveMatchesUnsubscribe = null;
let recentResultsUnsubscribe = null;

// DOM Elements
const liveScoresGrid = document.getElementById('liveScores');
const recentResultsGrid = document.getElementById('recentResults');
const filterButtons = document.querySelectorAll('.filter-btn');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    setupRealTimeListeners();
});

// Event Listeners
function initializeEventListeners() {
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentDivision = button.dataset.filter;
            setupRealTimeListeners();
        });
    });
}

// Firebase Listeners
function setupRealTimeListeners() {
    // Cleanup existing listeners
    if (liveMatchesUnsubscribe) liveMatchesUnsubscribe();
    if (recentResultsUnsubscribe) recentResultsUnsubscribe();

    // Set up live matches listener
    const liveMatchesQuery = query(
        collection(db, 'fixtures'),
        where('division', currentDivision === 'all' ? '!=' : '==', currentDivision),
        where('completed', '==', false),
        where('date', '>=', Timestamp.fromDate(new Date())),
        orderBy('date', 'asc')
    );

    liveMatchesUnsubscribe = onSnapshot(liveMatchesQuery, (snapshot) => {
        const matches = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        renderLiveMatches(matches);
    });

    // Set up recent results listener
    const recentResultsQuery = query(
        collection(db, 'fixtures'),
        where('division', currentDivision === 'all' ? '!=' : '==', currentDivision),
        where('completed', '==', true),
        orderBy('date', 'desc')
    );

    recentResultsUnsubscribe = onSnapshot(recentResultsQuery, (snapshot) => {
        const results = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        renderRecentResults(results);
    });
}

// Rendering Functions
function renderLiveMatches(matches) {
    if (!matches.length) {
        liveScoresGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-baseball-ball"></i>
                <h3>No Live Games</h3>
                <p>There are no games in progress at the moment</p>
            </div>
        `;
        return;
    }

    liveScoresGrid.innerHTML = matches.map(match => createMatchCard(match, true)).join('');
}

function renderRecentResults(results) {
    if (!results.length) {
        recentResultsGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-baseball-ball"></i>
                <h3>No Recent Results</h3>
                <p>Check back later for match results</p>
            </div>
        `;
        return;
    }

    recentResultsGrid.innerHTML = results.slice(0, 6).map(result => createMatchCard(result, false)).join('');
}

function createMatchCard(match, isLive) {
    const matchDate = match.date.toDate();
    const isTournament = match.tournament;
    const inningDisplay = isLive ? `
        <div class="match-inning">
            <span class="current-inning">${match.currentInning || '1st'} Inning</span>
            <div class="inning-details">
                <span class="outs">${match.outs || 0} Out${match.outs !== 1 ? 's' : ''}</span>
                <div class="bases-status">
                    <i class="fas fa-circle ${match.bases?.first ? 'active' : ''}"></i>
                    <i class="fas fa-circle ${match.bases?.second ? 'active' : ''}"></i>
                    <i class="fas fa-circle ${match.bases?.third ? 'active' : ''}"></i>
                </div>
            </div>
        </div>
    ` : '';

    return `
        <div class="match-card ${isLive ? 'live' : ''} ${isTournament ? 'tournament' : ''}" data-match-id="${match.id}">
            <div class="match-header">
                <div class="match-info">
                    <span class="match-time">${formatMatchTime(matchDate)}</span>
                    <span class="match-venue">${match.venue}</span>
                    <span class="match-division">${formatDivision(match.division)}</span>
                </div>
                ${isLive ? '<div class="live-indicator"><span class="pulse"></span>LIVE</div>' : ''}
            </div>

            <div class="match-teams">
                <div class="team home ${match.homeScore > match.awayScore ? 'winner' : ''}">
                    <img src="${match.homeTeam.logo}" alt="${match.homeTeam.name}" class="team-logo">
                    <span class="team-name">${match.homeTeam.name}</span>
                    <span class="team-score">${match.homeScore || 0}</span>
                    <div class="team-stats">
                        <span class="hits">${match.homeStats?.hits || 0} Hits</span>
                        <span class="errors">${match.homeStats?.errors || 0} Errors</span>
                    </div>
                </div>

                ${inningDisplay}

                <div class="team away ${match.awayScore > match.homeScore ? 'winner' : ''}">
                    <img src="${match.awayTeam.logo}" alt="${match.awayTeam.name}" class="team-logo">
                    <span class="team-name">${match.awayTeam.name}</span>
                    <span class="team-score">${match.awayScore || 0}</span>
                    <div class="team-stats">
                        <span class="hits">${match.awayStats?.hits || 0} Hits</span>
                        <span class="errors">${match.awayStats?.errors || 0} Errors</span>
                    </div>
                </div>
            </div>

            ${isTournament ? `
                <div class="tournament-badge">
                    <i class="fas fa-trophy"></i> Tournament Game
                </div>
            ` : ''}

            <div class="match-footer">
                <div class="match-actions">
                    ${isLive ? `
                        <button class="btn-watch">
                            <i class="fas fa-play-circle"></i>
                            Watch Live
                        </button>
                    ` : `
                        <button class="btn-highlights">
                            <i class="fas fa-film"></i>
                            Highlights
                        </button>
                    `}
                    <button class="btn-stats">
                        <i class="fas fa-chart-bar"></i>
                        Match Stats
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Utility Functions
function formatMatchTime(date) {
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    return isToday 
        ? date.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })
        : date.toLocaleDateString('en-ZA', { 
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
}

function formatDivision(division) {
    switch (division) {
        case 'premier': return 'Premier Softball League';
        case 'division1': return 'Division 1 Softball';
        case 'division2': return 'Division 2 Softball';
        case 'womens': return "Women's Softball League";
        case 'youth': return 'Youth Softball League';
        default: return division;
    }
}
