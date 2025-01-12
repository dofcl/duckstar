import { ref } from 'vue';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';

const client = generateClient<Schema>();
type ProfileType = Schema['Profile']['type'];
type UpdateableProfileFields = Partial<Omit<ProfileType, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>;

interface ProfileResponse {
    data?: ProfileType;
    errors?: { message: string }[];
}

interface CreateProfileInput {
    id: string;
    userId: string;
    username?: string;
    status?: string;
    tier?: string;
    credits?: number;
    followersCount?: number;
    followingCount?: number;
    monthlyScore?: number;
    songsCreated?: number;
    totalScore?: number;
    weeklyScore?: number;
    winRate?: number;
    lipSyncBattlesAttempted?: number;
    lipSyncBattlesLost?: number;
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

export function useProfile() {
    const profiles = ref<Array<ProfileType>>([]);
    const error = ref<string | null>(null);
    const loading = ref(false);

    async function fetchProfiles(userId: string) {
        console.log('fetch p', userId)
        try {
            loading.value = true;
            error.value = null;

            const response = await client.models.Profile.list({
                index: "userId-index",
                filter: {
                    userId: {
                        eq: userId
                    }
                }
            });

            const { data: items, errors } = response;

            if (errors) {
                const errorMessage = Array.isArray(errors) ? errors.join(', ') : errors.toString();
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
        try {
            error.value = null;
            const response = await client.models.Profile.get({ id }) as ProfileResponse;

            if (response.errors) {
                const errorMessage = response.errors.map(e => e.message).join(', ');
                console.error('Failed to get profile:', errorMessage);
                error.value = 'Failed to get profile: ' + errorMessage;
                return null;
            }

            return response.data;
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

            // Use create instead of update for new profiles
            const response = await client.models.Profile.create(createInput);

            if (response.errors) {
                const errorMessage = Array.isArray(response.errors) 
                    ? response.errors.join(', ') 
                    : response.errors.toString();
                console.error('Failed to create profile:', errorMessage);
                error.value = 'Failed to create profile: ' + errorMessage;
                return null;
            }

            await fetchProfiles(userId); // Refresh the list
            return response.data;
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

            let profile = await getProfile(id);

            if (!profile) {
                console.log('Creating new profile...');
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
        id: string,
        field: K,
        value: UpdateableProfileFields[K]
    ) {
        try {
            error.value = null;
            loading.value = true;

            const payload = { id, [field]: value };
            const response = await client.models.Profile.update(payload);

            if (response.errors) {
                const errorMessage = Array.isArray(response.errors) 
                    ? response.errors.join(', ') 
                    : response.errors.toString();
                console.error('Failed to update profile:', errorMessage);
                error.value = 'Failed to update profile: ' + errorMessage;
                return null;
            }
            return response.data;
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