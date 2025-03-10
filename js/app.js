// Navigation Menu
document.addEventListener('DOMContentLoaded', () => {
    // Mobile menu toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    menuToggle?.addEventListener('click', () => {
        const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
        menuToggle.setAttribute('aria-expanded', (!isExpanded).toString());
        navMenu?.classList.toggle('active');
    });

    // Live Games button click handler
    const liveGamesBtn = document.querySelector('.btn-live');
    liveGamesBtn?.addEventListener('click', () => {
        window.location.href = 'live-scores.html';
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.nav-menu') && !e.target.closest('.menu-toggle') && navMenu?.classList.contains('active')) {
            navMenu.classList.remove('active');
            menuToggle?.setAttribute('aria-expanded', 'false');
        }
    });
});

// Standings Page Filters
document.addEventListener('DOMContentLoaded', () => {
    const seasonFilter = document.getElementById('season-filter');
    const divisionFilter = document.getElementById('division-filter');

    // Add event listeners for filters
    seasonFilter?.addEventListener('change', updateStandings);
    divisionFilter?.addEventListener('change', updateStandings);

    function updateStandings() {
        const season = seasonFilter?.value;
        const division = divisionFilter?.value;
        
        // Here you would typically make an API call to get the filtered standings data
        console.log(`Filtering standings for season: ${season}, division: ${division}`);
        
        // For now, we'll just log the filter changes
        // In a real application, you would update the table with new data
    }
});

// Stats Page Functionality
document.addEventListener('DOMContentLoaded', () => {
    // Stats page elements
    const statsSearch = document.getElementById('stats-search');
    const seasonFilter = document.getElementById('season-filter');
    const statTabs = document.querySelectorAll('.stat-tab');
    const statPanels = document.querySelectorAll('.stats-panel');

    // Event listeners for search and filters
    statsSearch?.addEventListener('input', handleSearch);
    seasonFilter?.addEventListener('change', updateStats);
    
    // Tab switching
    statTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const type = tab.dataset.type;
            switchTab(type);
            updateStats();
        });
    });

    function switchTab(type) {
        // Update active tab
        statTabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.type === type);
        });

        // Show corresponding panel
        statPanels.forEach(panel => {
            panel.classList.toggle('active', panel.id === `${type}-panel`);
        });
    }

    function handleSearch(e) {
        const searchTerm = e.target.value.toLowerCase();
        const rows = document.querySelectorAll('.stats-table tbody tr');

        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchTerm) ? '' : 'none';
        });
    }

    function updateStats() {
        const season = seasonFilter?.value;
        const activeTab = document.querySelector('.stat-tab.active');
        const statType = activeTab?.dataset.type;

        if (!statType) return;

        // Sample data structure
        const statsData = {
            batting: [
                { rank: 1, player: 'John Smith', team: 'Thunderbolts', avg: '.423', hr: 28, rbi: 89, r: 76, sb: 15, obp: '.534', slg: '.678' },
                { rank: 2, player: 'Mike Johnson', team: 'Cyclones', avg: '.389', hr: 32, rbi: 94, r: 82, sb: 8, obp: '.456', slg: '.699' },
                { rank: 3, player: 'David Wilson', team: 'Dragons', avg: '.375', hr: 25, rbi: 78, r: 68, sb: 22, obp: '.445', slg: '.612' }
            ],
            pitching: [
                { rank: 1, player: 'Tom Brown', team: 'Dragons', era: '1.85', w: 15, l: 3, sv: 0, so: 189, ip: '165.2', whip: '0.98' },
                { rank: 2, player: 'James Lee', team: 'Thunderbolts', era: '2.12', w: 13, l: 5, sv: 0, so: 167, ip: '152.1', whip: '1.05' },
                { rank: 3, player: 'Steve Davis', team: 'Cyclones', era: '2.34', w: 12, l: 6, sv: 0, so: 178, ip: '158.0', whip: '1.12' }
            ],
            fielding: [
                { rank: 1, player: 'Mike Wilson', team: 'Dragons', pos: 'SS', fldPct: '.989', a: 245, po: 156, e: 4, dp: 78, rf: '4.89' },
                { rank: 2, player: 'Tom Clark', team: 'Thunderbolts', pos: '2B', fldPct: '.987', a: 234, po: 167, e: 5, dp: 82, rf: '4.76' },
                { rank: 3, player: 'John Davis', team: 'Cyclones', pos: '3B', fldPct: '.985', a: 198, po: 89, e: 4, dp: 45, rf: '4.12' }
            ],
            team: [
                { rank: 1, team: 'Dragons', gp: 82, w: 56, l: 26, pct: '.683', rs: 423, ra: 298, diff: '+125', strk: 'W4' },
                { rank: 2, team: 'Thunderbolts', gp: 82, w: 52, l: 30, pct: '.634', rs: 398, ra: 312, diff: '+86', strk: 'W2' },
                { rank: 3, team: 'Cyclones', gp: 82, w: 48, l: 34, pct: '.585', rs: 378, ra: 334, diff: '+44', strk: 'L1' }
            ]
        };

        updateTableContent(statsData[statType] || []);
    }

    function updateTableContent(data) {
        const tbody = document.querySelector('.stats-table tbody');
        if (!tbody) return;

        tbody.innerHTML = data.map(row => {
            const cells = Object.values(row).map(value => `<td>${value}</td>`).join('');
            return `<tr>${cells}</tr>`;
        }).join('');
    }

    // Export functionality
    const exportBtn = document.querySelector('.btn-download');
    exportBtn?.addEventListener('click', () => {
        const activeTab = document.querySelector('.stat-tab.active');
        const statType = activeTab?.dataset.type;
        const season = seasonFilter?.value;
        
        // In a real application, this would trigger a CSV download
        alert(`Exporting ${statType} statistics for ${season} season...`);
    });

    // Initialize stats display
    if (document.querySelector('.stats-page')) {
        updateStats();
    }
});
