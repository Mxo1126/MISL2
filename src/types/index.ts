export interface Match {
    id: string;
    tournament: string;
    datetime: string;
    status: 'live' | 'upcoming' | 'finished';
    homeTeam: Team;
    awayTeam: Team;
    score: Score;
    stats: MatchStats;
}

export interface Team {
    id: string;
    name: string;
    logo: string;
    winStreak: string;
    rank: number;
}

export interface Score {
    home: number;
    away: number;
    inning?: number;
}

export interface MatchStats {
    hits: {
        home: number;
        away: number;
    };
    errors: {
        home: number;
        away: number;
    };
}

export interface UserPreferences {
    favoriteTeam?: string;
    notifications: {
        liveScores: boolean;
        favoriteTeam: boolean;
        news: boolean;
    };
    theme: 'light' | 'dark';
}
