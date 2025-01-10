interface BaseModel {
    id: string;
    createdAt: string;
    updatedAt: string;
}

interface AiCompanionData {
    ownerId: string;
    name: string;
    imageURL: string;
    bio: string;
    country: string;
    createdAt?: string;
    updatedAt?: string;
}

interface Songs {
    // Define the properties of Songs here
    songId: string;
    title: string;
    duration: number;
}

interface Tracks {
    // Define the properties of Tracks here
    trackId: string;
    trackName: string;
    length: number;
}

export type Status = 'ACTIVE' | 'INACTIVE' | 'DELETED';
export type Tier = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND';

export interface Profile extends BaseModel {
    // Required fields with no defaults
    userId: string;
    username: string;

    // Required fields with defaults
    status: Status;
    onboarded: boolean;
    credits: number;
    songsCreated: number;
    lipSyncBattlesAttempted: number;
    lipSyncBattlesWon: number;
    lipSyncBattlesLost: number;
    winRate: number;
    totalScore: number;
    weeklyScore: number;
    monthlyScore: number;
    tier: Tier;
    followersCount: number;
    followingCount: number;

    // Optional fields that could be empty but not null
    email: string;
    firstName: string;
    lastName: string;
    displayName: string;
    avatar: string;
    bio: string;
    country: string;
    language: string;
    musicGenre: string;
    lastActive: string;
    producerId: string;

    // Optional fields that might be undefined but not null
    rank?: number;

    // Relationships (optional but not null when present)
    aiCompanions: AiCompanionData[];
    songs: Songs[];
    tracks: Tracks[];
}

// Default values for a new profile
export const DEFAULT_PROFILE: Partial<Profile> = {
    status: 'ACTIVE',
    onboarded: false,
    credits: 100,
    songsCreated: 0,
    lipSyncBattlesAttempted: 0,
    lipSyncBattlesWon: 0,
    lipSyncBattlesLost: 0,
    winRate: 0,
    totalScore: 0,
    weeklyScore: 0,
    monthlyScore: 0,
    tier: 'BRONZE',
    followersCount: 0,
    followingCount: 0,
    email: '',
    firstName: '',
    lastName: '',
    displayName: '',
    avatar: '',
    bio: '',
    country: '',
    language: '',
    musicGenre: '',
    aiCompanions: [],
    songs: [],
    tracks: [],
    lastActive: new Date().toISOString(),
};

// Type for creating a new profile with required fields
export type CreateProfileInput = Pick<Profile, 'userId' | 'username'> & Partial<Omit<Profile, 'userId' | 'username' | keyof BaseModel>>;

// Helper function to create a new profile with defaults
export function createProfileWithDefaults(input: CreateProfileInput): Omit<Profile, keyof BaseModel> {
    return {
        ...DEFAULT_PROFILE as Required<Profile>,
        ...input,
        lastActive: new Date().toISOString()
    };
}