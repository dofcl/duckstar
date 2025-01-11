import { ref } from 'vue';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';

const client = generateClient<Schema>();
type ProfileType = Schema['Profile']['type'];
type UpdateableProfileFields = Partial<Omit<ProfileType, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>;

interface CreateProfileInput {
    id: string;  // Added id as it's required
    userId: string;
    username?: string;
    // Optional fields with defaults from schema
    status?: string; // defaults to 'ACTIVE'
    tier?: string; // defaults to 'BRONZE'
    credits?: number; // defaults to 100
    followersCount?: number; // defaults to 0
    followingCount?: number; // defaults to 0
    monthlyScore?: number; // defaults to 0
    songsCreated?: number; // defaults to 0
    totalScore?: number; // defaults to 0
    weeklyScore?: number; // defaults to 0
    winRate?: number; // defaults to 0
    lipSyncBattlesAttempted?: number; // defaults to 0
    lipSyncBattlesLost?: number; // defaults to 0
    // Optional fields without defaults
    avatar?: string;
    bio?: string;
    country?: string;
    displayName?: string;
    email?: string;
    firstName?: string;
    language?: string;
    lastName?: string;
    musicGenre?: string;
    onboarded?: boolean;
    producerId?: string;
    rank?: number;
}

// @ts-expect-error TS7056
export function useProfile() {
    const profiles = ref<Array<ProfileType>>([]);
    const error = ref<string | null>(null);
    const loading = ref(false);

    async function fetchProfiles(userId: string) {
        try {
            loading.value = true;
            error.value = null;
            // @ts-expect-error TS2590
            const { data: items, errors } = await client.models.Profile.list({
                filter: {
                    userId: {
                        eq: userId
                    }
                }
            });

            if (errors) {
                const errorMessage = errors.map(e => e.message).join(', ');
                console.error('Failed to fetch profiles:', errorMessage);
                error.value = 'Failed to fetch profiles: ' + errorMessage;
                return [];
            }

            profiles.value = items;
            return items;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown error';
            console.error('Error fetching profiles:', message);
            error.value = 'Error fetching profiles: ' + message;
            return [];
        } finally {
            loading.value = false;
        }
    }

    async function getProfile(id: string) {
        console.log('getProfile', id);
        try {
            error.value = null;
            const { data, errors } = await client.models.Profile.get({ id }); // Changed to use id

            if (errors) {
                const errorMessage = errors.map(e => e.message).join(', ');
                console.error('Failed to get profile:', errorMessage);
                error.value = 'Failed to get profile: ' + errorMessage;
                return null;
            }

            return data;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown error';
            console.error('Error getting profile:', message);
            error.value = 'Error getting profile: ' + message;
            return null;
        }
    }

    async function createProfile(
        id: string,
        userId: string,
        initialData: Partial<Omit<CreateProfileInput, 'id' | 'userId'>> = {}
    ) {
        try {
            error.value = null;

            const createInput: CreateProfileInput = {
                id,
                userId,
                ...initialData
            };

            const { data, errors } = await client.models.Profile.create(createInput);

            if (errors) {
                const errorMessage = errors.map(e => e.message).join(', ');
                console.error('Failed to create profile:', errorMessage);
                error.value = 'Failed to create profile: ' + errorMessage;
                return null;
            }

            await fetchProfiles(userId); // Refresh the list
            return data;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown error';
            console.error('Error creating profile:', message);
            error.value = 'Error creating profile: ' + message;
            return null;
        }
    }

    async function getOrCreateProfile(
        id: string,
        userId: string,
        initialData: Partial<Omit<CreateProfileInput, 'id' | 'userId'>> = {}
    ) {
        try {
            error.value = null;
            loading.value = true;

            // First try to get the profile
            let profile = await getProfile(id);  // Changed to use id
            console.log('got profile', profile);

            // If profile doesn't exist, create it with initial data
            if (!profile) {
                console.log('create profile', profile);
                profile = await createProfile(id, userId, initialData);
            }

            return profile;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown error';
            console.error('Error in getOrCreate profile:', message);
            error.value = 'Error in getOrCreate profile: ' + message;
            return null;
        } finally {
            loading.value = false;
        }
    }

    async function updateProfileField<K extends keyof UpdateableProfileFields>(
        id: string,  // Changed to use id
        field: K,
        value: UpdateableProfileFields[K]
    ) {
        try {
            error.value = null;
            loading.value = true;           
            
            // @ts-expect-error TS2590: Expression produces a union type that is too complex to represent.
            const { data, errors } = await client.models.Profile.update({
                id,
                [field]: value
            });

            if (errors) {
                const errorMessage = errors.map(e => e.message).join(', ');
                console.error('Failed to update profile:', errorMessage);
                error.value = 'Failed to update profile: ' + errorMessage;
                return null;
            }
            return data;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown error';
            console.error('Error updating profile:', message);
            error.value = 'Error updating profile: ' + message;
            return null;
        } finally {
            loading.value = false;
        }
    }

    return {
        profiles,
        fetchProfiles,
        getProfile,
        createProfile,
        getOrCreateProfile,
        updateProfileField,
        error,
        loading
    };
}