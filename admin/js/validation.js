// Form validation rules
const VALIDATION_RULES = {
    // Team validation rules
    team: {
        teamName: {
            minLength: 3,
            maxLength: 50,
            pattern: /^[a-zA-Z0-9\s-]+$/,
            message: "Team name must be 3-50 characters and can only contain letters, numbers, spaces and hyphens"
        },
        teamShortName: {
            minLength: 2,
            maxLength: 3,
            pattern: /^[A-Z]+$/,
            message: "Short name must be 2-3 uppercase letters"
        },
        teamEmail: {
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: "Please enter a valid email address"
        },
        teamPhone: {
            pattern: /^\+?[\d\s-]{10,}$/,
            message: "Please enter a valid phone number"
        },
        teamWebsite: {
            pattern: /^https?:\/\/.+\..+$/,
            message: "Please enter a valid website URL starting with http:// or https://"
        },
        teamFoundedYear: {
            min: 1800,
            max: new Date().getFullYear(),
            message: `Founded year must be between 1800 and ${new Date().getFullYear()}`
        },
        teamVenueCapacity: {
            min: 0,
            max: 150000,
            message: "Venue capacity must be between 0 and 150,000"
        }
    },

    // Player validation rules
    player: {
        playerFirstName: {
            minLength: 2,
            maxLength: 30,
            pattern: /^[a-zA-Z\s-]+$/,
            message: "First name must be 2-30 characters and can only contain letters, spaces and hyphens"
        },
        playerLastName: {
            minLength: 2,
            maxLength: 30,
            pattern: /^[a-zA-Z\s-]+$/,
            message: "Last name must be 2-30 characters and can only contain letters, spaces and hyphens"
        },
        playerNumber: {
            min: 1,
            max: 99,
            message: "Jersey number must be between 1 and 99"
        },
        playerDOB: {
            validate: (value) => {
                const dob = new Date(value);
                const age = new Date().getFullYear() - dob.getFullYear();
                return age >= 15 && age <= 45;
            },
            message: "Player must be between 15 and 45 years old"
        },
        playerEmail: {
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: "Please enter a valid email address"
        },
        playerPhone: {
            pattern: /^\+?[\d\s-]{10,}$/,
            message: "Please enter a valid phone number"
        },
        playerHeight: {
            min: 120,
            max: 220,
            message: "Height must be between 120cm and 220cm"
        },
        playerWeight: {
            min: 40,
            max: 120,
            message: "Weight must be between 40kg and 120kg"
        }
    },

    // News validation rules
    news: {
        title: {
            required: true,
            message: "Title is required"
        },
        category: {
            required: true,
            message: "Category is required"
        },
        author: {
            required: true,
            message: "Author is required"
        },
        excerpt: {
            maxLength: 200,
            message: "Excerpt must be 200 characters or less"
        },
        content: {
            required: true,
            message: "Content is required"
        },
        image: {
            validate: (value) => {
                const file = value.files[0];
                const maxSize = 2 * 1024 * 1024; // 2MB

                if (file.size > maxSize) {
                    return "Image must be less than 2MB";
                }

                if (!file.type.startsWith('image/')) {
                    return "File must be an image";
                }

                return true;
            },
            message: "Invalid image"
        },
        date: {
            validate: (value) => {
                const selectedDate = new Date(value);
                const now = new Date();

                if (document.getElementById('newsStatus').value === 'published' && selectedDate > now) {
                    return "Published articles cannot have a future date";
                }

                return true;
            },
            message: "Invalid date"
        },
        status: {
            required: true,
            message: "Status is required"
        }
    },

    // Event validation rules
    event: {
        homeTeam: {
            required: true,
            message: "Home team is required"
        },
        awayTeam: {
            required: true,
            message: "Away team is required"
        },
        eventDate: {
            required: true,
            message: "Event date is required"
        },
        eventTime: {
            required: true,
            message: "Event time is required"
        },
        venue: {
            required: true,
            message: "Venue is required"
        },
        ticketPrice: {
            min: 0,
            message: "Ticket price must be greater than 0"
        },
        ticketsAvailable: {
            min: 0,
            message: "Available tickets must be greater than 0"
        }
    },

    // Fixture validation rules
    fixture: {
        homeTeam: {
            required: true,
            message: "Home team is required"
        },
        awayTeam: {
            required: true,
            message: "Away team is required"
        },
        matchDate: {
            required: true,
            message: "Match date is required"
        },
        matchTime: {
            required: true,
            message: "Match time is required"
        },
        venue: {
            required: true,
            message: "Venue is required"
        },
        ticketPrice: {
            min: 0,
            message: "Ticket price must be greater than 0"
        },
        ticketQuantity: {
            min: 0,
            message: "Ticket quantity must be greater than 0"
        },
        ticketSaleStart: {
            required: true,
            message: "Ticket sale start date is required"
        }
    },

    // Standings validation rules
    standings: {
        team: {
            required: true,
            message: "Team is required"
        },
        division: {
            required: true,
            message: "Division is required"
        },
        gamesPlayed: {
            required: true,
            message: "Games played is required"
        },
        wins: {
            required: true,
            message: "Wins is required"
        },
        losses: {
            required: true,
            message: "Losses is required"
        },
        lastTen: {
            pattern: /^[0-9]-[0-9]$/,
            message: "Format must be N-N (e.g., 7-3)"
        },
        streakType: {
            required: true,
            message: "Streak type is required"
        },
        streakCount: {
            required: true,
            message: "Streak count is required"
        },
        runsScored: {
            required: true,
            message: "Runs scored is required"
        },
        runsAgainst: {
            required: true,
            message: "Runs against is required"
        }
    },

    // Stats validation rules
    stats: {
        player: {
            required: true,
            message: "Player is required"
        },
        team: {
            required: true,
            message: "Team is required"
        },
        atBats: {
            required: true,
            message: "At bats is required"
        },
        hits: {
            required: true,
            message: "Hits is required"
        },
        homeRuns: {
            required: true,
            message: "Home runs is required"
        },
        rbis: {
            required: true,
            message: "RBIs is required"
        },
        runs: {
            required: true,
            message: "Runs is required"
        },
        stolenBases: {
            required: true,
            message: "Stolen bases is required"
        },
        walks: {
            required: true,
            message: "Walks is required"
        },
        strikeouts: {
            required: true,
            message: "Strikeouts is required"
        },
        inningsPitched: {
            required: true,
            message: "Innings pitched is required"
        },
        earnedRuns: {
            required: true,
            message: "Earned runs is required"
        },
        putouts: {
            required: true,
            message: "Putouts is required"
        },
        assists: {
            required: true,
            message: "Assists is required"
        },
        errors: {
            required: true,
            message: "Errors is required"
        }
    }
};

// Validate a single field
function validateField(formType, fieldId, value) {
    const rules = VALIDATION_RULES[formType][fieldId];
    if (!rules) return { isValid: true };

    if (rules.minLength && value.length < rules.minLength) {
        return { isValid: false, message: rules.message };
    }

    if (rules.maxLength && value.length > rules.maxLength) {
        return { isValid: false, message: rules.message };
    }

    if (rules.pattern && !rules.pattern.test(value)) {
        return { isValid: false, message: rules.message };
    }

    if (rules.min !== undefined && (Number(value) < rules.min)) {
        return { isValid: false, message: rules.message };
    }

    if (rules.max !== undefined && (Number(value) > rules.max)) {
        return { isValid: false, message: rules.message };
    }

    if (rules.validate && rules.validate(value) !== true) {
        return { isValid: false, message: rules.validate(value) || rules.message };
    }

    if (rules.required && !value) {
        return { isValid: false, message: rules.message };
    }

    return { isValid: true };
}

// Show validation error
function showValidationError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const errorDiv = field.nextElementSibling?.classList.contains('validation-error') 
        ? field.nextElementSibling 
        : document.createElement('div');
    
    if (!field.nextElementSibling?.classList.contains('validation-error')) {
        errorDiv.className = 'validation-error';
        field.parentNode.insertBefore(errorDiv, field.nextSibling);
    }
    
    errorDiv.textContent = message;
    field.classList.add('invalid');
}

// Clear validation error
function clearValidationError(fieldId) {
    const field = document.getElementById(fieldId);
    const errorDiv = field.nextElementSibling;
    
    if (errorDiv?.classList.contains('validation-error')) {
        errorDiv.remove();
    }
    field.classList.remove('invalid');
}

// Add validation listeners to form
function addFormValidation(formType, formId) {
    const form = document.getElementById(formId);
    const fields = VALIDATION_RULES[formType];

    // Add validation to each field
    Object.keys(fields).forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (!field) return;

        field.addEventListener('input', () => {
            const result = validateField(formType, fieldId, field.value);
            if (!result.isValid) {
                showValidationError(fieldId, result.message);
            } else {
                clearValidationError(fieldId);
            }
        });

        field.addEventListener('blur', () => {
            const result = validateField(formType, fieldId, field.value);
            if (!result.isValid) {
                showValidationError(fieldId, result.message);
            }
        });
    });

    // Validate all fields on form submit
    form.addEventListener('submit', (event) => {
        let isValid = true;
        Object.keys(fields).forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (!field) return;

            const result = validateField(formType, fieldId, field.value);
            if (!result.isValid) {
                showValidationError(fieldId, result.message);
                isValid = false;
            }
        });

        if (!isValid) {
            event.preventDefault();
        }
    });
}

// News Form Validation
function validateNewsForm() {
    const form = document.getElementById('newsForm');
    const fields = {
        title: document.getElementById('newsTitle'),
        category: document.getElementById('newsCategory'),
        author: document.getElementById('newsAuthor'),
        excerpt: document.getElementById('newsExcerpt'),
        content: document.getElementById('newsContent'),
        image: document.getElementById('newsImage'),
        date: document.getElementById('newsDate'),
        status: document.getElementById('newsStatus')
    };

    let isValid = true;

    // Required field validation
    for (const [key, field] of Object.entries(fields)) {
        if (!field.value) {
            showValidationError(key, `${key.charAt(0).toUpperCase() + key.slice(1)} is required`);
            isValid = false;
        } else {
            clearValidationError(key);
        }
    }

    // Excerpt length validation
    if (fields.excerpt.value.length > 200) {
        showValidationError('excerpt', 'Excerpt must be 200 characters or less');
        isValid = false;
    }

    // Image validation
    if (fields.image.files.length > 0) {
        const file = fields.image.files[0];
        const maxSize = 2 * 1024 * 1024; // 2MB

        if (file.size > maxSize) {
            showValidationError('image', 'Image must be less than 2MB');
            isValid = false;
        }

        if (!file.type.startsWith('image/')) {
            showValidationError('image', 'File must be an image');
            isValid = false;
        }
    }

    // Date validation
    const selectedDate = new Date(fields.date.value);
    const now = new Date();
    
    if (fields.status.value === 'published' && selectedDate > now) {
        showValidationError('date', 'Published articles cannot have a future date');
        isValid = false;
    }

    return isValid;
}

// Handle news form submission
function handleNewsSubmit(event) {
    event.preventDefault();
    
    if (validateNewsForm()) {
        // TODO: Handle form submission
        closeModal('addNewsModal');
        showSuccessMessage('News article saved successfully');
    }
}

// Event Form Validation
function validateEventForm() {
    const form = document.getElementById('eventForm');
    const fields = {
        homeTeam: document.getElementById('homeTeam'),
        awayTeam: document.getElementById('awayTeam'),
        eventDate: document.getElementById('eventDate'),
        eventTime: document.getElementById('eventTime'),
        venue: document.getElementById('venue'),
        ticketPrice: document.getElementById('ticketPrice'),
        ticketsAvailable: document.getElementById('ticketsAvailable')
    };

    let isValid = true;

    // Required field validation
    for (const [key, field] of Object.entries(fields)) {
        if (!field.value) {
            showValidationError(key, `${key.charAt(0).toUpperCase() + key.slice(1)} is required`);
            isValid = false;
        } else {
            clearValidationError(key);
        }
    }

    // Same team validation
    if (fields.homeTeam.value === fields.awayTeam.value && fields.homeTeam.value !== '') {
        showValidationError('awayTeam', 'Home and away teams cannot be the same');
        isValid = false;
    }

    // Date validation
    const selectedDate = new Date(fields.eventDate.value + 'T' + fields.eventTime.value);
    const now = new Date();
    
    if (selectedDate < now) {
        showValidationError('eventDate', 'Event date cannot be in the past');
        isValid = false;
    }

    // Ticket validation
    if (document.getElementById('ticketSalesEnabled').checked) {
        if (parseFloat(fields.ticketPrice.value) <= 0) {
            showValidationError('ticketPrice', 'Ticket price must be greater than 0');
            isValid = false;
        }
        if (parseInt(fields.ticketsAvailable.value) <= 0) {
            showValidationError('ticketsAvailable', 'Available tickets must be greater than 0');
            isValid = false;
        }
    }

    return isValid;
}

// Handle event form submission
function handleEventSubmit(event) {
    event.preventDefault();
    
    if (validateEventForm()) {
        // TODO: Handle form submission
        closeModal('addEventModal');
        showSuccessMessage('Event saved successfully');
    }
}

// Update ticket fields based on sales enabled
document.getElementById('ticketSalesEnabled')?.addEventListener('change', function(e) {
    const ticketFields = ['ticketPrice', 'ticketsAvailable'];
    ticketFields.forEach(id => {
        const field = document.getElementById(id);
        field.required = e.target.checked;
        field.disabled = !e.target.checked;
    });
});

// Image preview functionality
document.getElementById('newsImage')?.addEventListener('change', function(e) {
    const preview = document.getElementById('imagePreview');
    const file = e.target.files[0];
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
        };
        reader.readAsDataURL(file);
    } else {
        preview.innerHTML = '';
    }
});

// Fixture Form Validation
function validateFixtureForm() {
    const form = document.getElementById('fixtureForm');
    const fields = {
        homeTeam: document.getElementById('homeTeam'),
        awayTeam: document.getElementById('awayTeam'),
        matchDate: document.getElementById('matchDate'),
        matchTime: document.getElementById('matchTime'),
        venue: document.getElementById('venue'),
        ticketPrice: document.getElementById('ticketPrice'),
        ticketQuantity: document.getElementById('ticketQuantity'),
        ticketSaleStart: document.getElementById('ticketSaleStart')
    };

    let isValid = true;

    // Required field validation
    for (const [key, field] of Object.entries(fields)) {
        if (!field.value) {
            showValidationError(field.id, `${key.charAt(0).toUpperCase() + key.slice(1)} is required`);
            isValid = false;
        } else {
            clearValidationError(field.id);
        }
    }

    // Same team validation
    if (fields.homeTeam.value === fields.awayTeam.value) {
        showValidationError('awayTeam', 'Home and away teams cannot be the same');
        isValid = false;
    }

    // Date validation
    const matchDateTime = new Date(`${fields.matchDate.value} ${fields.matchTime.value}`);
    const now = new Date();
    
    if (matchDateTime < now) {
        showValidationError('matchDate', 'Match date and time must be in the future');
        isValid = false;
    }

    // Ticket sale start validation
    const ticketSaleDateTime = new Date(fields.ticketSaleStart.value);
    if (ticketSaleDateTime >= matchDateTime) {
        showValidationError('ticketSaleStart', 'Ticket sales must start before the match');
        isValid = false;
    }

    // Price and quantity validation
    const price = parseFloat(fields.ticketPrice.value);
    const quantity = parseInt(fields.ticketQuantity.value);

    if (price <= 0) {
        showValidationError('ticketPrice', 'Ticket price must be greater than 0');
        isValid = false;
    }

    if (quantity <= 0) {
        showValidationError('ticketQuantity', 'Ticket quantity must be greater than 0');
        isValid = false;
    }

    return isValid;
}

// Handle fixture form submission
function handleFixtureSubmit(event) {
    event.preventDefault();
    
    if (validateFixtureForm()) {
        // TODO: Handle form submission
        closeModal('addFixtureModal');
        showSuccessMessage('Fixture added successfully');
    }
}

// Initialize fixture form validation
document.getElementById('fixtureForm')?.addEventListener('submit', handleFixtureSubmit);

// Prevent same team selection
document.getElementById('homeTeam')?.addEventListener('change', function() {
    const awayTeam = document.getElementById('awayTeam');
    const selectedValue = this.value;
    
    Array.from(awayTeam.options).forEach(option => {
        option.disabled = option.value === selectedValue;
    });
});

document.getElementById('awayTeam')?.addEventListener('change', function() {
    const homeTeam = document.getElementById('homeTeam');
    const selectedValue = this.value;
    
    Array.from(homeTeam.options).forEach(option => {
        option.disabled = option.value === selectedValue;
    });
});

// Standings Form Validation
function validateStandingsForm() {
    const form = document.getElementById('standingsForm');
    const fields = {
        team: document.getElementById('standingsTeam'),
        division: document.getElementById('standingsDivision'),
        gamesPlayed: document.getElementById('gamesPlayed'),
        wins: document.getElementById('wins'),
        losses: document.getElementById('losses'),
        lastTen: document.getElementById('lastTen'),
        streakType: document.getElementById('streakType'),
        streakCount: document.getElementById('streakCount'),
        runsScored: document.getElementById('runsScored'),
        runsAgainst: document.getElementById('runsAgainst')
    };

    let isValid = true;

    // Required field validation
    for (const [key, field] of Object.entries(fields)) {
        if (!field.value) {
            showValidationError(key, `${key.charAt(0).toUpperCase() + key.slice(1)} is required`);
            isValid = false;
        } else {
            clearValidationError(key);
        }
    }

    // Games played validation
    const gp = parseInt(fields.gamesPlayed.value);
    const wins = parseInt(fields.wins.value);
    const losses = parseInt(fields.losses.value);

    if (wins + losses !== gp) {
        showValidationError('gamesPlayed', 'Games played must equal wins plus losses');
        isValid = false;
    }

    // Last 10 games validation
    const lastTenPattern = /^[0-9]-[0-9]$/;
    if (!lastTenPattern.test(fields.lastTen.value)) {
        showValidationError('lastTen', 'Format must be N-N (e.g., 7-3)');
        isValid = false;
    } else {
        const [wins10, losses10] = fields.lastTen.value.split('-').map(Number);
        if (wins10 + losses10 !== 10) {
            showValidationError('lastTen', 'Last 10 games must sum to 10');
            isValid = false;
        }
    }

    // Streak validation
    const streakCount = parseInt(fields.streakCount.value);
    if (streakCount > gp) {
        showValidationError('streakCount', 'Streak cannot be longer than games played');
        isValid = false;
    }

    // Update calculated fields
    if (gp > 0) {
        document.getElementById('winPercentage').value = (wins / gp).toFixed(3);
    }

    const runDiff = parseInt(fields.runsScored.value) - parseInt(fields.runsAgainst.value);
    document.getElementById('runDifferential').value = runDiff > 0 ? `+${runDiff}` : runDiff;

    return isValid;
}

// Handle standings form submission
function handleStandingsSubmit(event) {
    event.preventDefault();
    
    if (validateStandingsForm()) {
        // TODO: Handle form submission
        closeModal('updateStandingsModal');
        showSuccessMessage('Standings updated successfully');
    }
}

// Auto-calculate win percentage and run differential
document.getElementById('standingsForm')?.addEventListener('input', function(e) {
    const target = e.target;
    if (['gamesPlayed', 'wins'].includes(target.id)) {
        const gp = parseInt(document.getElementById('gamesPlayed').value) || 0;
        const wins = parseInt(document.getElementById('wins').value) || 0;
        if (gp > 0) {
            document.getElementById('winPercentage').value = (wins / gp).toFixed(3);
        }
    } else if (['runsScored', 'runsAgainst'].includes(target.id)) {
        const rs = parseInt(document.getElementById('runsScored').value) || 0;
        const ra = parseInt(document.getElementById('runsAgainst').value) || 0;
        const diff = rs - ra;
        document.getElementById('runDifferential').value = diff > 0 ? `+${diff}` : diff;
    }
});

// Position status validation
document.getElementById('divisionLeader')?.addEventListener('change', function(e) {
    if (e.target.checked) {
        document.getElementById('wildcardPosition').checked = false;
    }
});

document.getElementById('wildcardPosition')?.addEventListener('change', function(e) {
    if (e.target.checked) {
        document.getElementById('divisionLeader').checked = false;
    }
});

// Stats Form Validation
function validateStatsForm() {
    const form = document.getElementById('statsForm');
    const fields = {
        player: document.getElementById('statsPlayer'),
        team: document.getElementById('statsTeam'),
        atBats: document.getElementById('atBats'),
        hits: document.getElementById('hits'),
        homeRuns: document.getElementById('homeRuns'),
        rbis: document.getElementById('rbis'),
        runs: document.getElementById('runs'),
        stolenBases: document.getElementById('stolenBases'),
        walks: document.getElementById('walks'),
        strikeouts: document.getElementById('strikeouts')
    };

    let isValid = true;

    // Required field validation
    for (const [key, field] of Object.entries(fields)) {
        if (!field.value) {
            showValidationError(key, `${key.charAt(0).toUpperCase() + key.slice(1)} is required`);
            isValid = false;
        } else {
            clearValidationError(key);
        }
    }

    // Batting stats validation
    const atBats = parseInt(fields.atBats.value);
    const hits = parseInt(fields.hits.value);

    if (hits > atBats) {
        showValidationError('hits', 'Hits cannot exceed at bats');
        isValid = false;
    }

    // Calculate batting stats
    if (atBats > 0) {
        document.getElementById('battingAverage').value = (hits / atBats).toFixed(3);
        const singles = hits - parseInt(fields.homeRuns.value);
        const sluggingPercentage = (singles + (4 * parseInt(fields.homeRuns.value))) / atBats;
        document.getElementById('slugging').value = sluggingPercentage.toFixed(3);
        
        const plateAppearances = atBats + parseInt(fields.walks.value);
        const obp = (hits + parseInt(fields.walks.value)) / plateAppearances;
        document.getElementById('obp').value = obp.toFixed(3);
    }

    // Pitching stats validation
    const inningsPitched = parseFloat(document.getElementById('inningsPitched').value) || 0;
    const earnedRuns = parseInt(document.getElementById('earnedRuns').value) || 0;

    if (inningsPitched > 0) {
        // Calculate ERA: (earned runs / innings pitched) × 9
        const era = (earnedRuns / inningsPitched) * 9;
        document.getElementById('era').value = era.toFixed(2);

        // Calculate WHIP: (walks + hits) / innings pitched
        const whip = (parseInt(fields.walks.value) + hits) / inningsPitched;
        document.getElementById('whip').value = whip.toFixed(2);
    }

    // Fielding stats validation
    const putouts = parseInt(document.getElementById('putouts').value) || 0;
    const assists = parseInt(document.getElementById('assists').value) || 0;
    const errors = parseInt(document.getElementById('errors').value) || 0;

    if (putouts > 0 || assists > 0 || errors > 0) {
        const totalChances = putouts + assists + errors;
        const fieldingPct = ((putouts + assists) / totalChances);
        document.getElementById('fieldingPercentage').value = fieldingPct.toFixed(3);
    }

    return isValid;
}

// Handle stats form submission
function handleStatsSubmit(event) {
    event.preventDefault();
    
    if (validateStatsForm()) {
        // TODO: Handle form submission
        closeModal('updateStatsModal');
        showSuccessMessage('Player stats updated successfully');
    }
}

// Auto-calculate stats on input
document.getElementById('statsForm')?.addEventListener('input', function(e) {
    const target = e.target;
    const battingFields = ['atBats', 'hits', 'homeRuns', 'walks'];
    const pitchingFields = ['inningsPitched', 'earnedRuns'];
    const fieldingFields = ['putouts', 'assists', 'errors'];

    if (battingFields.includes(target.id)) {
        const atBats = parseInt(document.getElementById('atBats').value) || 0;
        const hits = parseInt(document.getElementById('hits').value) || 0;
        const homeRuns = parseInt(document.getElementById('homeRuns').value) || 0;
        const walks = parseInt(document.getElementById('walks').value) || 0;

        if (atBats > 0) {
            // Calculate AVG
            document.getElementById('battingAverage').value = (hits / atBats).toFixed(3);

            // Calculate SLG
            const singles = hits - homeRuns;
            const sluggingPercentage = (singles + (4 * homeRuns)) / atBats;
            document.getElementById('slugging').value = sluggingPercentage.toFixed(3);

            // Calculate OBP
            const plateAppearances = atBats + walks;
            const obp = (hits + walks) / plateAppearances;
            document.getElementById('obp').value = obp.toFixed(3);
        }
    } else if (pitchingFields.includes(target.id)) {
        const inningsPitched = parseFloat(document.getElementById('inningsPitched').value) || 0;
        const earnedRuns = parseInt(document.getElementById('earnedRuns').value) || 0;
        const hits = parseInt(document.getElementById('hits').value) || 0;
        const walks = parseInt(document.getElementById('walks').value) || 0;

        if (inningsPitched > 0) {
            // Calculate ERA
            const era = (earnedRuns / inningsPitched) * 9;
            document.getElementById('era').value = era.toFixed(2);

            // Calculate WHIP
            const whip = (walks + hits) / inningsPitched;
            document.getElementById('whip').value = whip.toFixed(2);
        }
    } else if (fieldingFields.includes(target.id)) {
        const putouts = parseInt(document.getElementById('putouts').value) || 0;
        const assists = parseInt(document.getElementById('assists').value) || 0;
        const errors = parseInt(document.getElementById('errors').value) || 0;

        if (putouts > 0 || assists > 0 || errors > 0) {
            const totalChances = putouts + assists + errors;
            const fieldingPct = ((putouts + assists) / totalChances);
            document.getElementById('fieldingPercentage').value = fieldingPct.toFixed(3);
        }
    }
});

// Validate fixture form
function validateFixtureForm() {
    const form = document.getElementById('fixtureForm');
    if (!form) return false;

    const homeTeam = form.homeTeam.value;
    const awayTeam = form.awayTeam.value;
    const matchDate = new Date(form.matchDate.value + ' ' + form.matchTime.value);
    const ticketSaleStart = new Date(form.ticketSaleStart.value);
    const now = new Date();

    // Clear previous errors
    clearFormErrors(form);

    let isValid = true;

    // Check if teams are different
    if (homeTeam === awayTeam) {
        showFieldError(form.homeTeam, 'Home and away teams must be different');
        showFieldError(form.awayTeam, 'Home and away teams must be different');
        isValid = false;
    }

    // Check if match date is in the future
    if (matchDate <= now) {
        showFieldError(form.matchDate, 'Match date must be in the future');
        isValid = false;
    }

    // Check if ticket sale start is before match date
    if (ticketSaleStart >= matchDate) {
        showFieldError(form.ticketSaleStart, 'Ticket sale must start before match date');
        isValid = false;
    }

    // Check if ticket sale start is in the future
    if (ticketSaleStart <= now) {
        showFieldError(form.ticketSaleStart, 'Ticket sale start must be in the future');
        isValid = false;
    }

    // Check ticket price
    const ticketPrice = parseFloat(form.ticketPrice.value);
    if (isNaN(ticketPrice) || ticketPrice <= 0) {
        showFieldError(form.ticketPrice, 'Please enter a valid ticket price');
        isValid = false;
    }

    // Check ticket quantity
    const ticketQuantity = parseInt(form.ticketQuantity.value);
    if (isNaN(ticketQuantity) || ticketQuantity < 0) {
        showFieldError(form.ticketQuantity, 'Please enter a valid number of tickets');
        isValid = false;
    }

    // Check venue
    if (!form.venue.value.trim()) {
        showFieldError(form.venue, 'Please enter a venue');
        isValid = false;
    }

    return isValid;
}

// Show field error
function showFieldError(field, message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
    field.classList.add('error');
    field.parentNode.appendChild(errorDiv);
}

// Clear form errors
function clearFormErrors(form) {
    form.querySelectorAll('.field-error').forEach(error => error.remove());
    form.querySelectorAll('.error').forEach(field => field.classList.remove('error'));
}

// Initialize validation
document.addEventListener('DOMContentLoaded', () => {
    addFormValidation('team', 'teamForm');
    addFormValidation('player', 'playerForm');
    addFormValidation('news', 'newsForm');
    addFormValidation('event', 'eventForm');
    addFormValidation('fixture', 'fixtureForm');
    addFormValidation('standings', 'standingsForm');
    addFormValidation('stats', 'statsForm');
});
