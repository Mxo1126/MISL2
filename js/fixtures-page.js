// Softball League Fixtures Page JavaScript
import { 
    db, 
    collection, 
    getDocs, 
    query, 
    where, 
    orderBy,
    Timestamp 
} from './firebase-config.js';

// Constants
const DIVISIONS = {
    ALL: 'all',
    PREMIER: 'premier',
    DIVISION1: 'division1',
    DIVISION2: 'division2',
    WOMENS: 'womens',
    YOUTH: 'youth'
};

const VENUES = {
    DIAMOND_A: 'Diamond A',
    DIAMOND_B: 'Diamond B',
    DIAMOND_C: 'Diamond C',
    PRACTICE: 'Practice Diamond',
    TOURNAMENT: 'Tournament Diamond'
};

// State Management
let currentTab = 'fixtures';
let currentDivision = DIVISIONS.ALL;
let currentFilter = 'all';
let fixtures = [];
let results = [];

// DOM Elements
const tabButtons = document.querySelectorAll('.tab-btn');
const filterButtons = document.querySelectorAll('.filter-btn');
const searchInputs = document.querySelectorAll('.search-box input');
const fixturesContainer = document.querySelector('#fixtures .fixture-cards');
const resultsContainer = document.querySelector('#results .result-cards');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    loadFixtures();
    loadResults();
});

// Event Listeners
function initializeEventListeners() {
    // Tab Switching
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.dataset.tab;
            switchTab(tabId);
        });
    });

    // Division Filter
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const parentTab = button.closest('.tab-pane');
            const filterButtons = parentTab.querySelectorAll('.filter-btn');
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentDivision = button.dataset.division;
            if (parentTab.id === 'fixtures') {
                loadFixtures();
            } else {
                loadResults();
            }
        });
    });

    // Search
    searchInputs.forEach(input => {
        input.addEventListener('input', debounce(() => {
            const parentTab = input.closest('.tab-pane');
            if (parentTab.id === 'fixtures') {
                filterFixtures();
            } else {
                filterResults();
            }
        }, 300));
    });

    // Ticket Booking
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-ticket')) {
            const fixtureId = e.target.closest('.fixture-card').dataset.fixtureId;
            handleTicketBooking(fixtureId);
        }
    });

    // Reminders
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-reminder')) {
            const fixtureId = e.target.closest('.fixture-card').dataset.fixtureId;
            handleReminder(fixtureId);
        }
    });
}

// Tab Switching
function switchTab(tabId) {
    // Update buttons
    tabButtons.forEach(button => {
        button.classList.toggle('active', button.dataset.tab === tabId);
    });

    // Update panes
    document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.toggle('active', pane.id === tabId);
    });

    currentTab = tabId;
}

// Data Loading
async function loadFixtures() {
    showLoading(fixturesContainer, true);
    try {
        const fixturesRef = collection(db, 'fixtures');
        let fixturesQuery;

        if (currentDivision === DIVISIONS.ALL) {
            fixturesQuery = query(
                fixturesRef,
                where('completed', '==', false),
                where('date', '>=', Timestamp.now()),
                orderBy('date', 'asc')
            );
        } else {
            fixturesQuery = query(
                fixturesRef,
                where('division', '==', currentDivision),
                where('completed', '==', false),
                where('date', '>=', Timestamp.now()),
                orderBy('date', 'asc')
            );
        }

        const snapshot = await getDocs(fixturesQuery);
        fixtures = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        filterFixtures();
        showLoading(fixturesContainer, false);
    } catch (error) {
        console.error('Error loading fixtures:', error);
        showError(fixturesContainer, 'Failed to load fixtures. Please try again later.');
    }
}

async function loadResults() {
    showLoading(resultsContainer, true);
    try {
        const fixturesRef = collection(db, 'fixtures');
        let resultsQuery;

        if (currentDivision === DIVISIONS.ALL) {
            resultsQuery = query(
                fixturesRef,
                where('completed', '==', true),
                orderBy('date', 'desc')
            );
        } else {
            resultsQuery = query(
                fixturesRef,
                where('division', '==', currentDivision),
                where('completed', '==', true),
                orderBy('date', 'desc')
            );
        }

        const snapshot = await getDocs(resultsQuery);
        results = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        filterResults();
        showLoading(resultsContainer, false);
    } catch (error) {
        console.error('Error loading results:', error);
        showError(resultsContainer, 'Failed to load results. Please try again later.');
    }
}

// Filtering
function filterFixtures() {
    const searchTerm = document.querySelector('#fixtures .search-box input').value.toLowerCase();
    let filteredFixtures = [...fixtures];

    // Apply search filter
    if (searchTerm) {
        filteredFixtures = filteredFixtures.filter(fixture => {
            const homeTeam = fixture.homeTeam.name.toLowerCase();
            const awayTeam = fixture.awayTeam.name.toLowerCase();
            const venue = fixture.venue.toLowerCase();
            const division = formatDivision(fixture.division).toLowerCase();
            return homeTeam.includes(searchTerm) || 
                   awayTeam.includes(searchTerm) || 
                   venue.includes(searchTerm) ||
                   division.includes(searchTerm);
        });
    }

    renderFixtures(filteredFixtures);
}

function filterResults() {
    const searchTerm = document.querySelector('#results .search-box input').value.toLowerCase();
    let filteredResults = [...results];

    // Apply search filter
    if (searchTerm) {
        filteredResults = filteredResults.filter(result => {
            const homeTeam = result.homeTeam.name.toLowerCase();
            const awayTeam = result.awayTeam.name.toLowerCase();
            const venue = result.venue.toLowerCase();
            const division = formatDivision(result.division).toLowerCase();
            return homeTeam.includes(searchTerm) || 
                   awayTeam.includes(searchTerm) || 
                   venue.includes(searchTerm) ||
                   division.includes(searchTerm);
        });
    }

    renderResults(filteredResults);
}

// Rendering
function renderFixtures(fixtures) {
    if (!fixtures.length) {
        showEmptyState(fixturesContainer, 'No upcoming fixtures found');
        return;
    }

    const fixtureGroups = groupFixturesByDate(fixtures);
    let html = '';

    for (const [date, groupFixtures] of Object.entries(fixtureGroups)) {
        html += `
            <div class="fixture-group">
                <h2>${formatDateHeader(date)}</h2>
                <div class="fixture-cards">
                    ${groupFixtures.map(fixture => createFixtureCard(fixture)).join('')}
                </div>
            </div>
        `;
    }

    fixturesContainer.innerHTML = html;
}

function renderResults(results) {
    if (!results.length) {
        showEmptyState(resultsContainer, 'No match results found');
        return;
    }

    const resultGroups = groupFixturesByDate(results);
    let html = '';

    for (const [date, groupResults] of Object.entries(resultGroups)) {
        html += `
            <div class="fixture-group">
                <h2>${formatDateHeader(date)}</h2>
                <div class="fixture-cards">
                    ${groupResults.map(result => createResultCard(result)).join('')}
                </div>
            </div>
        `;
    }

    resultsContainer.innerHTML = html;
}

function createFixtureCard(fixture) {
    const fixtureDate = fixture.date.toDate();
    const isTournament = fixture.tournament;

    return `
        <div class="fixture-card ${isTournament ? 'tournament' : ''}" data-fixture-id="${fixture.id}">
            <div class="fixture-date">
                <span class="day">${fixtureDate.getDate()}</span>
                <span class="month">${formatMonth(fixtureDate)}</span>
                <span class="time">${formatTime(fixtureDate)}</span>
            </div>
            <div class="fixture-teams">
                <div class="team home">
                    <img src="${fixture.homeTeam.logo}" alt="${fixture.homeTeam.name}" onerror="this.src='images/default-team.png'">
                    <span>${fixture.homeTeam.name}</span>
                </div>
                <div class="fixture-info">
                    <span class="vs">VS</span>
                    <div class="venue">${fixture.venue}</div>
                    <div class="division">${formatDivision(fixture.division)}</div>
                </div>
                <div class="team away">
                    <img src="${fixture.awayTeam.logo}" alt="${fixture.awayTeam.name}" onerror="this.src='images/default-team.png'">
                    <span>${fixture.awayTeam.name}</span>
                </div>
            </div>
            <div class="fixture-actions">
                <button class="btn-ticket">
                    <i class="fas fa-ticket-alt"></i>
                    Book Tickets
                </button>
                <button class="btn-reminder">
                    <i class="far fa-bell"></i>
                    Set Reminder
                </button>
            </div>
            ${isTournament ? `
                <div class="tournament-badge">
                    <i class="fas fa-trophy"></i> Tournament Game
                </div>
            ` : ''}
        </div>
    `;
}

function createResultCard(result) {
    const resultDate = result.date.toDate();
    const isTournament = result.tournament;
    const homeWon = result.homeScore > result.awayScore;
    const awayWon = result.awayScore > result.homeScore;

    return `
        <div class="fixture-card result ${isTournament ? 'tournament' : ''}" data-fixture-id="${result.id}">
            <div class="fixture-date">
                <span class="day">${resultDate.getDate()}</span>
                <span class="month">${formatMonth(resultDate)}</span>
                <span class="time">${formatTime(resultDate)}</span>
            </div>
            <div class="fixture-teams">
                <div class="team home ${homeWon ? 'winner' : ''}">
                    <img src="${result.homeTeam.logo}" alt="${result.homeTeam.name}" onerror="this.src='images/default-team.png'">
                    <span>${result.homeTeam.name}</span>
                    <div class="score">${result.homeScore}</div>
                    <div class="stats">
                        <span class="hits">${result.homeStats?.hits || 0} H</span>
                        <span class="errors">${result.homeStats?.errors || 0} E</span>
                    </div>
                </div>
                <div class="fixture-info">
                    <span class="final">FINAL</span>
                    <div class="venue">${result.venue}</div>
                    <div class="division">${formatDivision(result.division)}</div>
                </div>
                <div class="team away ${awayWon ? 'winner' : ''}">
                    <img src="${result.awayTeam.logo}" alt="${result.awayTeam.name}" onerror="this.src='images/default-team.png'">
                    <span>${result.awayTeam.name}</span>
                    <div class="score">${result.awayScore}</div>
                    <div class="stats">
                        <span class="hits">${result.awayStats?.hits || 0} H</span>
                        <span class="errors">${result.awayStats?.errors || 0} E</span>
                    </div>
                </div>
            </div>
            <div class="fixture-actions">
                <button class="btn-highlights">
                    <i class="fas fa-play-circle"></i>
                    Watch Highlights
                </button>
                <button class="btn-boxscore">
                    <i class="fas fa-chart-bar"></i>
                    Box Score
                </button>
            </div>
            ${isTournament ? `
                <div class="tournament-badge">
                    <i class="fas fa-trophy"></i> Tournament Game
                </div>
            ` : ''}
            ${result.walkoff ? `
                <div class="walkoff-badge">
                    <i class="fas fa-bolt"></i> Walk-off Win!
                </div>
            ` : ''}
        </div>
    `;
}

// Utility Functions
function groupFixturesByDate(fixtures) {
    return fixtures.reduce((groups, fixture) => {
        const date = fixture.date.toDate().toDateString();
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(fixture);
        return groups;
    }, {});
}

function formatDateHeader(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (isSameDay(date, today)) {
        return "Today's Games - " + date.toLocaleDateString('en-ZA', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    } else if (isSameDay(date, tomorrow)) {
        return "Tomorrow's Games - " + date.toLocaleDateString('en-ZA', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    } else if (isSameDay(date, yesterday)) {
        return "Yesterday's Games - " + date.toLocaleDateString('en-ZA', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    }
    return date.toLocaleDateString('en-ZA', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });
}

function formatMonth(date) {
    return date.toLocaleString('en-ZA', { month: 'short' }).toUpperCase();
}

function formatTime(date) {
    return date.toLocaleString('en-ZA', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
}

function formatDivision(division) {
    switch (division) {
        case DIVISIONS.PREMIER: return 'Premier Softball League';
        case DIVISIONS.DIVISION1: return 'Division 1 Softball';
        case DIVISIONS.DIVISION2: return 'Division 2 Softball';
        case DIVISIONS.WOMENS: return "Women's Softball League";
        case DIVISIONS.YOUTH: return 'Youth Softball League';
        default: return division;
    }
}

function isSameDay(date1, date2) {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
}

function showLoading(container, show) {
    const loadingElement = container.querySelector('.loading');
    if (show) {
        if (!loadingElement) {
            container.innerHTML = `
                <div class="loading">
                    <i class="fas fa-baseball-ball fa-spin"></i>
                    <span>Loading...</span>
                </div>
            `;
        }
    } else if (loadingElement) {
        loadingElement.remove();
    }
}

function showError(container, message) {
    container.innerHTML = `
        <div class="error-state">
            <i class="fas fa-exclamation-circle"></i>
            <h3>Oops!</h3>
            <p>${message}</p>
            <button onclick="loadFixtures()" class="btn-retry">
                <i class="fas fa-redo"></i>
                Try Again
            </button>
        </div>
    `;
}

function showEmptyState(container, message) {
    container.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-calendar-alt"></i>
            <h3>No Games Found</h3>
            <p>${message}</p>
        </div>
    `;
}

// Event Handlers
async function handleTicketBooking(fixtureId) {
    // Implement ticket booking functionality
    console.log('Booking tickets for fixture:', fixtureId);
}

async function handleReminder(fixtureId) {
    // Implement reminder functionality
    console.log('Setting reminder for fixture:', fixtureId);
}

// Debounce Utility
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
