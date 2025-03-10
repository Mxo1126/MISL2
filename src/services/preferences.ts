import { UserPreferences } from '../types';

export class PreferencesService {
    private static readonly STORAGE_KEY = 'misl_preferences';
    private static instance: PreferencesService;
    private preferences: UserPreferences;

    private constructor() {
        this.preferences = this.loadPreferences();
    }

    public static getInstance(): PreferencesService {
        if (!PreferencesService.instance) {
            PreferencesService.instance = new PreferencesService();
        }
        return PreferencesService.instance;
    }

    private loadPreferences(): UserPreferences {
        const defaultPreferences: UserPreferences = {
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
        } catch (error) {
            console.error('Error loading preferences:', error);
            return defaultPreferences;
        }
    }

    public getPreferences(): UserPreferences {
        return { ...this.preferences };
    }

    public updatePreferences(newPreferences: Partial<UserPreferences>): void {
        this.preferences = { ...this.preferences, ...newPreferences };
        this.savePreferences();
        this.applyPreferences();
    }

    private savePreferences(): void {
        try {
            localStorage.setItem(PreferencesService.STORAGE_KEY, JSON.stringify(this.preferences));
        } catch (error) {
            console.error('Error saving preferences:', error);
        }
    }

    private applyPreferences(): void {
        // Apply theme
        document.documentElement.setAttribute('data-theme', this.preferences.theme);

        // Apply other preferences
        if (this.preferences.notifications.liveScores) {
            this.requestNotificationPermission();
        }
    }

    private async requestNotificationPermission(): Promise<void> {
        if ('Notification' in window) {
            try {
                const permission = await Notification.requestPermission();
                if (permission !== 'granted') {
                    this.preferences.notifications.liveScores = false;
                    this.savePreferences();
                }
            } catch (error) {
                console.error('Error requesting notification permission:', error);
            }
        }
    }

    public setFavoriteTeam(teamId: string): void {
        this.updatePreferences({ favoriteTeam: teamId });
    }

    public toggleTheme(): void {
        const newTheme = this.preferences.theme === 'light' ? 'dark' : 'light';
        this.updatePreferences({ theme: newTheme });
    }
}
