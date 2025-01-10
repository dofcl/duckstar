export type Status = 'ACTIVE' | 'INACTIVE' | 'DELETED';
export type Nullable<T> = T | null;
export type Tier = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND';
export type BattleResult = 'WIN' | 'LOSE' | 'DRAW';

interface BaseModel {
    id: string;
    createdAt: string;
    updatedAt: string;
}

export interface AiCompanionData extends BaseModel {
    aiOwnerId: string;
    aiOwner?: Profile | null;
    seedId: string;
    name: Nullable<string>; 
    imageURL: Nullable<string>; 
    bio: Nullable<string>;
    country: Nullable<string>;
    price:Nullable<number>;
}

interface Producers extends BaseModel {
    profiles: Profile[];
    name: string;
    ttsId: string;
    imageURL: string;
    bio: string;
    country: string;
    price:Nullable<number>;
}

interface LipSyncBattlesEntries extends BaseModel {
    playerOwnerId: string;
    song: Songs;
    imageUrl: string;
    audioUrl: string;
    videoUrl: string;
    status: Status;
    royalties: number;
    judge1Score: number;
    judge2Score: number;
    judge3Score: number;
    totalJudgeScore: number;
    communityScoreAvg: number;
    result: BattleResult;
}

interface LipSyncBattlesParent extends BaseModel {
    player1: Profile;
    player2: Profile;
    player1Entry: LipSyncBattlesEntries;
    player2Entry: LipSyncBattlesEntries;
    song: Songs;
    winner: Profile;
    comments: Comment[];
    battleType: string;
    status: Status;
    likes: number;
    shares: number;
    royalties: number;
}

interface Songs extends BaseModel {
    songOwner: Profile;
    lipSyncBattles: LipSyncBattlesParent[];
    title: string;
    imageURL: string;
    description: string;
    lyrics: string;
    mainMusicOwnerId: string;
    mainVocalsOwnerId: string;
    audioUrl: string;
    mainMusicTrack: Tracks;
    otherTracks: string;
    remixedFrom: string;
    comments: Comment[];
    playCount: number;
    likes: number;
    shares: number;
    royalties: number;
    status: Status;
}

interface Tracks extends BaseModel {
    trackOwner: Profile;
    songs: Songs[];
    recordLabel: string;
    title: string;
    description: string;
    instruments: string;
    audioUrl: string;
    songCount: number;
    status: Status;
    royalties: number;
}

interface Followers extends BaseModel {
    follower: Profile;
    following: Profile;
    status: Status;
}

interface TokenCreditLogs extends BaseModel {
    creditOwner: Profile;
    direction: string;
    paymentMethod: string;
    deductionDescription: string;
    amount: number;
    status: Status;
}

interface ComputeTasks extends BaseModel {
    taskOwner: Profile;
    taskId: string;
    taskDescription: string;
    finishedAt: string;
    status: string;
    finished: boolean;
    failed: boolean;
    failedReason: string;
}

export interface Profile extends BaseModel {
    // Required fields
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

    // Optional fields
    email?: string;
    firstName?: string;
    lastName?: string;
    displayName?: string;
    avatar?: string;
    bio?: string;
    country?: string;
    language?: string;
    musicGenre?: string | null;  // Allow null for musicGenre if not set
    lastActive: string;
    rank?: number | null;  // Allow null for rank if not set

    // Relationships
    producerId: string;
    producer: Producers;
    aiCompanions: AiCompanionData[];
    songs: Songs[];
    tracks: Tracks[];
    followers: Followers[];
    following: Followers[];
    wonLipSyncBattles: LipSyncBattlesParent[];
    participatedLipSyncBattles: LipSyncBattlesParent[];
    participant2LipSyncBattles: LipSyncBattlesParent[];
    tokenCreditLogs: TokenCreditLogs[];
    computeTasks: ComputeTasks[];
}

// Updated DEFAULT_PROFILE
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

export type CreateProfileInput = Pick<Profile, 'userId' | 'username'> & 
    Partial<Omit<Profile, 'userId' | 'username' | keyof BaseModel>>;

export function createProfileWithDefaults(input: CreateProfileInput): Omit<Profile, keyof BaseModel> {
    return {
        ...DEFAULT_PROFILE as Required<Profile>,
        ...input,
        lastActive: new Date().toISOString()
    };
}
