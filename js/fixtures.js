// Firebase and DOM initialization
let db;
let auth;

// DOM Elements
const leagueTabs = document.querySelectorAll('.league-nav .league-tab');
const contentTabs = document.querySelectorAll('.tab-buttons .tab-btn');
const filterButtons = document.querySelectorAll('.filter-buttons .filter-btn');
const searchInput = document.querySelector('.search-box input');
const contentSections = document.querySelectorAll('.content-section');

// Current state
let currentLeague = 'premier';
let currentTab = 'fixtures';
let currentFilter = 'all';
let searchQuery = '';

// Real-time listeners
let fixturesUnsubscribe = null;
let resultsUnsubscribe = null;

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM Content Loaded');
    // Initialize Firebase from config
    const firebaseConfig = {
        // Your config will be loaded from firebase-config.js
    };

    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    auth = firebase.auth();

    // Add sample data if needed
    await addSampleData();

    // Setup event listeners and load content
    setupEventListeners();
    loadContent();
});

// Setup Event Listeners
function setupEventListeners() {
    console.log('Setting up event listeners');
    
    // League tabs
    leagueTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            console.log('League tab clicked:', tab.dataset.league);
            leagueTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentLeague = tab.dataset.league;
            loadContent();
        });
    });

    // Content tabs
    contentTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.dataset.tab;
            console.log('Content tab clicked:', targetTab);
            
            // Update tab buttons
            contentTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Update content sections
            contentSections.forEach(section => {
                if (section.id === `${targetTab}-content`) {
                    section.classList.add('active');
                    currentTab = targetTab;
                } else {
                    section.classList.remove('active');
                }
            });
            
            loadContent();
        });
    });

    // Filter buttons
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            console.log('Filter button clicked:', btn.textContent);
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.textContent.toLowerCase();
            loadContent();
        });
    });

    // Search
    searchInput.addEventListener('input', debounce(() => {
        console.log('Search input:', searchInput.value);
        searchQuery = searchInput.value.toLowerCase();
        loadContent();
    }, 300));
}

// Load content based on current state
async function loadContent() {
    // Cleanup existing listeners
    if (fixturesUnsubscribe) fixturesUnsubscribe();
    if (resultsUnsubscribe) resultsUnsubscribe();

    const contentContainer = document.querySelector(`#${currentTab}-content`);
    if (!contentContainer) {
        console.error('Content container not found:', currentTab);
        return;
    }

    showLoading(contentContainer, true);

    try {
        switch (currentTab) {
            case 'fixtures':
                await loadFixtures(contentContainer);
                break;
            case 'results':
                await loadResults(contentContainer);
                break;
            case 'logs':
                await loadLeagueLog(contentContainer);
                break;
        }
    } catch (error) {
        console.error('Error loading content:', error);
        showError(contentContainer);
    }
}

// Load fixtures
async function loadFixtures(container) {
    const fixturesRef = db.collection('fixtures');
    const now = firebase.firestore.Timestamp.now();
    
    let fixturesQuery = fixturesRef
        .where('league', '==', currentLeague)
        .where('completed', '==', false)
        .orderBy('date', 'asc');

    // Apply date filter
    if (currentFilter !== 'all games') {
        const filterDate = getFilterDate();
        if (filterDate) {
            fixturesQuery = fixturesQuery.where('date', '<=', filterDate);
        }
    }

    // Setup real-time listener
    fixturesUnsubscribe = fixturesQuery.onSnapshot((snapshot) => {
        console.log('Received fixtures update:', snapshot.size, 'documents');
        
        if (snapshot.empty) {
            showEmptyState(container, 'No upcoming games found');
            return;
        }

        const fixturesHTML = [];
        snapshot.forEach(doc => {
            const fixture = doc.data();
            if (matchesSearch(fixture)) {
                fixturesHTML.push(createGameCard(fixture));
            }
        });

        if (fixturesHTML.length === 0) {
            showEmptyState(container, 'No games found for your search');
            return;
        }

        container.innerHTML = `
            <div class="fixture-cards">
                ${fixturesHTML.join('')}
            </div>
        `;
    }, error => {
        console.error('Error loading fixtures:', error);
        showError(container);
    });
}

// Load results
async function loadResults(container) {
    const resultsRef = db.collection('fixtures');
    
    let resultsQuery = resultsRef
        .where('league', '==', currentLeague)
        .where('completed', '==', true)
        .orderBy('date', 'desc');

    // Setup real-time listener
    resultsUnsubscribe = resultsQuery.onSnapshot((snapshot) => {
        console.log('Received results update:', snapshot.size, 'documents');
        
        if (snapshot.empty) {
            showEmptyState(container, 'No game results found');
            return;
        }

        const resultsHTML = [];
        snapshot.forEach(doc => {
            const result = doc.data();
            if (matchesSearch(result)) {
                resultsHTML.push(createGameCard(result, true));
            }
        });

        if (resultsHTML.length === 0) {
            showEmptyState(container, 'No results found for your search');
            return;
        }

        container.innerHTML = `
            <div class="result-cards">
                ${resultsHTML.join('')}
            </div>
        `;
    }, error => {
        console.error('Error loading results:', error);
        showError(container);
    });
}

// Load league standings
async function loadLeagueLog(container) {
    const fixturesRef = db.collection('fixtures');
    
    const completedGames = await fixturesRef
        .where('league', '==', currentLeague)
        .where('completed', '==', true)
        .get();

    if (completedGames.empty) {
        showEmptyState(container, 'No completed games to generate standings');
        return;
    }

    // Calculate standings
    const standings = calculateStandings(completedGames.docs.map(doc => doc.data()));
    
    // Sort teams by points, then run difference
    const sortedTeams = Object.values(standings).sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        return (b.runsFor - b.runsAgainst) - (a.runsFor - a.runsAgainst);
    });

    // Render standings table
    container.querySelector('.league-log').style.display = 'block';
    const tbody = container.querySelector('.standings-table tbody');
    tbody.innerHTML = sortedTeams.map((team, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${team.name}</td>
            <td>${team.played}</td>
            <td>${team.won}</td>
            <td>${team.lost}</td>
            <td>${team.runsFor}</td>
            <td>${team.runsAgainst}</td>
            <td>${team.runsFor - team.runsAgainst}</td>
            <td>${(team.won / team.played * 100).toFixed(1)}%</td>
            <td>${team.streak}</td>
        </tr>
    `).join('');
}

// Helper Functions
function calculateStandings(games) {
    const standings = {};

    games.forEach(game => {
        const homeTeam = game.homeTeam.id;
        const awayTeam = game.awayTeam.id;
        
        // Initialize team records if needed
        if (!standings[homeTeam]) {
            standings[homeTeam] = initializeTeamRecord(game.homeTeam.name);
        }
        if (!standings[awayTeam]) {
            standings[awayTeam] = initializeTeamRecord(game.awayTeam.name);
        }

        // Update statistics
        standings[homeTeam].played++;
        standings[awayTeam].played++;
        
        standings[homeTeam].runsFor += game.homeScore;
        standings[homeTeam].runsAgainst += game.awayScore;
        standings[awayTeam].runsFor += game.awayScore;
        standings[awayTeam].runsAgainst += game.homeScore;

        if (game.homeScore > game.awayScore) {
            standings[homeTeam].won++;
            standings[awayTeam].lost++;
            standings[homeTeam].streak = updateStreak(standings[homeTeam].streak, 'W');
            standings[awayTeam].streak = updateStreak(standings[awayTeam].streak, 'L');
        } else {
            standings[awayTeam].won++;
            standings[homeTeam].lost++;
            standings[awayTeam].streak = updateStreak(standings[awayTeam].streak, 'W');
            standings[homeTeam].streak = updateStreak(standings[homeTeam].streak, 'L');
        }

        // Calculate points (2 for win, 0 for loss)
        standings[homeTeam].points = standings[homeTeam].won * 2;
        standings[awayTeam].points = standings[awayTeam].won * 2;
    });

    return standings;
}

function initializeTeamRecord(name) {
    return {
        name,
        played: 0,
        won: 0,
        lost: 0,
        runsFor: 0,
        runsAgainst: 0,
        points: 0,
        streak: '-'
    };
}

function updateStreak(currentStreak, result) {
    if (currentStreak === '-') return result;
    if (currentStreak[currentStreak.length - 1] === result) {
        const count = parseInt(currentStreak) || 1;
        return `${count + 1}${result}`;
    }
    return result;
}

function createGameCard(game, isResult = false) {
    const date = game.date.toDate();
    const formattedDate = new Intl.DateTimeFormat('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
    }).format(date);

    const formattedTime = new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: '2-digit'
    }).format(date);

    return `
        <div class="fixture-card">
            <div class="card-header">
                <div class="match-date">${formattedDate}</div>
                <div class="match-field">${game.venue}</div>
            </div>
            <div class="match-teams">
                <div class="team home">
                    <img class="team-logo" src="${game.homeTeam.logo}" alt="${game.homeTeam.name}" onerror="this.src='images/default-team.png'">
                    <div class="team-name">${game.homeTeam.name}</div>
                </div>
                <div class="match-info">
                    ${isResult ? 
                        `<div class="match-score">${game.homeScore} - ${game.awayScore}</div>` :
                        `<div class="match-time">${formattedTime}</div>`
                    }
                </div>
                <div class="team away">
                    <div class="team-name">${game.awayTeam.name}</div>
                    <img class="team-logo" src="${game.awayTeam.logo}" alt="${game.awayTeam.name}" onerror="this.src='images/default-team.png'">
                </div>
            </div>
            <div class="card-footer">
                ${isResult ?
                    `<button class="btn btn-secondary game-details">
                        <i class="fas fa-chart-bar"></i> Game Stats
                    </button>` :
                    `<button class="btn btn-primary book-ticket">Book Tickets</button>
                    <button class="btn btn-secondary game-details">
                        <i class="fas fa-info-circle"></i> Details
                    </button>`
                }
            </div>
        </div>
    `;
}

function getFilterDate() {
    const now = new Date();
    switch (currentFilter) {
        case "today's games":
            return firebase.firestore.Timestamp.fromDate(
                new Date(now.setHours(23, 59, 59, 999))
            );
        case 'this week':
            now.setDate(now.getDate() + (7 - now.getDay()));
            return firebase.firestore.Timestamp.fromDate(
                new Date(now.setHours(23, 59, 59, 999))
            );
        case 'tournament games':
            // For tournament games, we'll need to add a 'tournament' field to the fixtures
            return null;
        default:
            return null;
    }
}

function matchesSearch(data) {
    if (!searchQuery) return true;
    return data.homeTeam.name.toLowerCase().includes(searchQuery) ||
           data.awayTeam.name.toLowerCase().includes(searchQuery) ||
           data.venue.toLowerCase().includes(searchQuery);
}

function showLoading(container, show) {
    const loadingState = container.querySelector('.loading-state');
    if (loadingState) {
        loadingState.style.display = show ? 'flex' : 'none';
    }
}

function showEmptyState(container, message) {
    const emptyState = container.querySelector('.empty-state');
    if (emptyState) {
        emptyState.querySelector('p').textContent = message;
        emptyState.style.display = 'block';
    }
}

function showError(container) {
    container.innerHTML = `
        <div class="error-state">
            <i class="fas fa-exclamation-circle"></i>
            <h3>Oops! Something went wrong</h3>
            <p>Unable to load the content. Please try again later.</p>
        </div>
    `;
}

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

// Add sample data if needed
async function addSampleData() {
    try {
        console.log('Checking for existing fixtures...');
        const fixturesRef = db.collection('fixtures');
        const snapshot = await fixturesRef.limit(1).get();
        
        if (snapshot.empty) {
            console.log('No fixtures found, adding sample data...');
            
            // Sample teams data
            const teams = {
                strikers: {
                    id: 'strikers',
                    name: 'Metro Strikers',
                    logo: './images/teams/strikers.png'
                },
                diamonds: {
                    id: 'diamonds',
                    name: 'City Diamonds',
                    logo: './images/teams/diamonds.png'
                },
                panthers: {
                    id: 'panthers',
                    name: 'Pink Panthers',
                    logo: './images/teams/panthers.png'
                },
                eagles: {
                    id: 'eagles',
                    name: 'Coastal Eagles',
                    logo: './images/teams/eagles.png'
                },
                wildcats: {
                    id: 'wildcats',
                    name: 'Urban Wildcats',
                    logo: './images/teams/wildcats.png'
                },
                hornets: {
                    id: 'hornets',
                    name: 'Highland Hornets',
                    logo: './images/teams/hornets.png'
                }
            };

            // Generate fixtures for each league
            const leagues = ['premier', 'division1', 'division2', 'womens', 'youth'];
            const diamonds = ['Diamond A', 'Diamond B', 'Diamond C', 'Practice Diamond', 'Tournament Diamond'];
            
            const fixtures = [];
            const teamIds = Object.keys(teams);
            
            // Helper function to get random team
            const getRandomTeam = (exclude) => {
                let availableTeams = teamIds.filter(id => id !== exclude);
                return teams[availableTeams[Math.floor(Math.random() * availableTeams.length)]];
            };

            // Generate fixtures for each league
            leagues.forEach(league => {
                // Past games (completed)
                for (let i = 0; i < 5; i++) {
                    const homeTeam = teams[teamIds[i]];
                    const awayTeam = getRandomTeam(homeTeam.id);
                    
                    fixtures.push({
                        league,
                        date: firebase.firestore.Timestamp.fromDate(
                            new Date(Date.now() - (i + 1) * 24 * 60 * 60 * 1000) // Past days
                        ),
                        completed: true,
                        homeTeam,
                        awayTeam,
                        homeScore: Math.floor(Math.random() * 15),
                        awayScore: Math.floor(Math.random() * 15),
                        venue: diamonds[Math.floor(Math.random() * diamonds.length)],
                        innings: 7,
                        stats: {
                            home: {
                                hits: Math.floor(Math.random() * 20),
                                errors: Math.floor(Math.random() * 5),
                                leftOnBase: Math.floor(Math.random() * 10)
                            },
                            away: {
                                hits: Math.floor(Math.random() * 20),
                                errors: Math.floor(Math.random() * 5),
                                leftOnBase: Math.floor(Math.random() * 10)
                            }
                        }
                    });
                }

                // Upcoming games
                for (let i = 0; i < 5; i++) {
                    const homeTeam = teams[teamIds[i]];
                    const awayTeam = getRandomTeam(homeTeam.id);
                    
                    fixtures.push({
                        league,
                        date: firebase.firestore.Timestamp.fromDate(
                            new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000) // Future days
                        ),
                        completed: false,
                        homeTeam,
                        awayTeam,
                        venue: diamonds[Math.floor(Math.random() * diamonds.length)],
                        innings: 7,
                        tournament: Math.random() > 0.8 // 20% chance of being a tournament game
                    });
                }
            });

            // Add each fixture in batches of 500 (Firestore limit)
            const batchSize = 500;
            for (let i = 0; i < fixtures.length; i += batchSize) {
                const batch = db.batch();
                const currentBatch = fixtures.slice(i, i + batchSize);
                
                currentBatch.forEach(fixture => {
                    const docRef = fixturesRef.doc();
                    batch.set(docRef, fixture);
                });
                
                await batch.commit();
                console.log(`Committed batch ${i / batchSize + 1} of ${Math.ceil(fixtures.length / batchSize)}`);
            }
            console.log('Added sample fixtures data successfully');
        } else {
            console.log('Found existing fixtures, skipping sample data');
        }
    } catch (error) {
        console.error('Error adding sample data:', error);
        throw error;
    }
}
