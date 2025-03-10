export interface Match {
    id: string;
    homeTeam: string;
    awayTeam: string;
    score: {
        home: number;
        away: number;
    };
    stats: {
        hits: {
            home: number;
            away: number;
        };
        errors: {
            home: number;
            away: number;
        };
    };
    status: 'live' | 'upcoming' | 'finished';
    startTime: string;
    venue: string;
}

export interface UserPreferences {
    notifications: {
        liveScores: boolean;
        favoriteTeam: boolean;
        news: boolean;
    };
    theme: 'light' | 'dark';
    favoriteTeam?: string;
}
