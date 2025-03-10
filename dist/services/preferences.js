export class PreferencesService {
    constructor() {
        this.preferences = this.loadPreferences();
    }
    static getInstance() {
        if (!PreferencesService.instance) {
            PreferencesService.instance = new PreferencesService();
        }
        return PreferencesService.instance;
    }
    loadPreferences() {
        const defaultPreferences = {
            notifications: {
                liveScores: true,
                favoriteTeam: true,
                news: true
            },
            theme: 'light'
        };
        try {
            const stored = localStorage.getItem(PreferencesService.STORAGE_KEY);
            return stored ? { ...defaultPreferences, ...JSON.parse(stored) } : defaultPreferences;
        }
        catch (error) {
            console.error('Error loading preferences:', error);
            return defaultPreferences;
        }
    }
    getPreferences() {
        return { ...this.preferences };
    }
    updatePreferences(newPreferences) {
        this.preferences = { ...this.preferences, ...newPreferences };
        this.savePreferences();
        this.applyPreferences();
    }
    savePreferences() {
        try {
            localStorage.setItem(PreferencesService.STORAGE_KEY, JSON.stringify(this.preferences));
        }
        catch (error) {
            console.error('Error saving preferences:', error);
        }
    }
    applyPreferences() {
        // Apply theme
        document.documentElement.setAttribute('data-theme', this.preferences.theme);
        // Apply other preferences
        if (this.preferences.notifications.liveScores) {
            this.requestNotificationPermission();
        }
    }
    async requestNotificationPermission() {
        if ('Notification' in window) {
            try {
                const permission = await Notification.requestPermission();
                if (permission !== 'granted') {
                    this.preferences.notifications.liveScores = false;
                    this.savePreferences();
                }
            }
            catch (error) {
                console.error('Error requesting notification permission:', error);
            }
        }
    }
    setFavoriteTeam(teamId) {
        this.updatePreferences({ favoriteTeam: teamId });
    }
    toggleTheme() {
        const newTheme = this.preferences.theme === 'light' ? 'dark' : 'light';
        this.updatePreferences({ theme: newTheme });
    }
}
PreferencesService.STORAGE_KEY = 'misl_preferences';
