import { ref, computed } from 'vue';
import { generateClient } from 'aws-amplify/api';
import type { Schema } from '../../amplify/data/resource';
import { 
    type Profile, 
    DEFAULT_PROFILE,
    type CreateProfileInput,
    createProfileWithDefaults
} from '../types/schema';

const client = generateClient<Schema>();

// Define proper Amplify response types
type AmplifyData = {
    userId: string;
    username: string;
    producerId: any; // Handle the function type from Amplify
    [key: string]: any; // Allow other properties
};

type AmplifyResponse<T = AmplifyData> = {
    data: T | null;
    errors?: Array<{ message: string }>;
};

function transformAmplifyResponse(data: AmplifyData): Profile {
    return {
        ...DEFAULT_PROFILE,
        ...data,
        producerId: typeof data.producerId === 'function' ? '' : data.producerId,
        // Ensure all required Profile properties are present
        aiCompanions: Array.isArray(data.aiCompanions) ? data.aiCompanions : [],
        songs: Array.isArray(data.songs) ? data.songs : [],
        tracks: Array.isArray(data.tracks) ? data.tracks : []
    } as Profile;
}

export function useProfile() {
    const loading = ref(false);
    const error = ref<string | null>(null);
    const profile = ref<Profile | null>(null);

    async function getProfile(userId: string): Promise<Profile | null> {
        if (!userId) throw new Error('User ID is required');
        loading.value = true;

        try {
            const filter = { userId: { eq: userId } };
            const response = await client.models.Profile.list({ filter }) as unknown as AmplifyResponse<AmplifyData[]>;

            if (!response.data?.length) return null;

            return transformAmplifyResponse(response.data[0]);
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Failed to fetch profile';
            throw err;
        } finally {
            loading.value = false;
        }
    }

    async function getOrCreateProfile(input: CreateProfileInput): Promise<Profile> {
        const existingProfile = await getProfile(input.userId);
        if (existingProfile) return existingProfile;

        const newProfile = createProfileWithDefaults(input);

        try {
            const response = await client.models.Profile.create(newProfile) as unknown as AmplifyResponse<AmplifyData>;
            if (!response.data) {
                throw new Error('Failed to create profile');
            }

            const createdProfile = transformAmplifyResponse(response.data);
            profile.value = createdProfile;
            return createdProfile;
        } catch (err) {
            console.error('Failed to create profile:', err);
            throw err instanceof Error ? err : new Error('Failed to create profile');
        }
    }

    async function updateProfileFields(
        id: string, 
        fields: Partial<Omit<Profile, 'id' | 'createdAt' | 'updatedAt'>>
    ): Promise<Profile> {
        if (!fields || Object.keys(fields).length === 0) {
            throw new Error('No fields provided for update');
        }

        const updateData = {
            id,
            ...fields,
            updatedAt: new Date().toISOString(),
            lastActive: new Date().toISOString(),
        };

        try {
            const response = await client.models.Profile.update(updateData) as AmplifyResponse<Profile>;
            if (!response.data) {
                throw new Error('Update failed');
            }

            const updatedProfile = response.data;

            if (profile.value?.id === id) {
                profile.value = updatedProfile;
            }

            return updatedProfile;
        } catch (err) {
            console.error('Update failed:', err);
            throw err instanceof Error ? err : new Error('Update failed');
        }
    }

    return {
        profile: computed(() => profile.value),
        loading: computed(() => loading.value),
        error: computed(() => error.value),
        getProfile,
        getOrCreateProfile,
        updateProfileFields,
    };
}