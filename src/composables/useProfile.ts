import { ref, computed, type ComputedRef } from 'vue'
import { generateClient } from 'aws-amplify/api'
import type { Schema } from '../../amplify/data/resource'

const client = generateClient<Schema>()

type Profile = {
    id?: string
    userId: string
    username: string
    email: string | null
    onboarded: boolean
    firstName?: string | null
    lastName?: string | null
    displayName?: string | null
    avatar?: string | null
    bio?: string | null
    country?: string | null
    language?: string | null
    lastActive?: string
    credits: number
    songsCreated: number
    lipSyncBattlesAttempted: number
    lipSyncBattlesWon: number
    lipSyncBattlesLost: number
    producerId?: string | null
    aiCompanions?: string | null
    status: string
    createdAt?: string
    updatedAt?: string
}


type ProfileResponse = {
    data: Profile
    errors?: { message: string }[]
}

type ProfileListResponse = {
    data: Profile[]
    errors?: { message: string }[]
    nextToken?: string
}

type ProfileFilter = {
    filter?: Record<string, unknown>
    limit?: number
    nextToken?: string
}

export function useProfile() {
    const loading = ref(false)
    const error = ref<string | null>(null)
    const profile = ref<Profile | null>(null)

    const defaultProfile = {
        status: 'ACTIVE',
        credits: 100,
        onboarded: false,
        songsCreated: 0,
        lipSyncBattlesAttempted: 0,
        lipSyncBattlesWon: 0,
        lipSyncBattlesLost: 0
    }

    async function getProfile(userId: string): Promise<Profile | null> {
        if (!userId) throw new Error('User ID is required')
        loading.value = true

        try {
            const response = await client.models.Profile.list({
                filter: { userId: { eq: userId } }
            }) as ProfileListResponse

            return response.data[0] || null
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Failed to fetch profile'
            throw err
        } finally {
            loading.value = false
        }
    }

    async function getOrCreateProfile(userData: Pick<Profile, 'userId' | 'username'> & Partial<Profile>): Promise<Profile> {
        const existingProfile = await getProfile(userData.userId)
        if (existingProfile) return existingProfile

        const newProfile = {
            ...defaultProfile,
            ...userData,
            id: userData.userId,
            lastActive: new Date().toISOString()
        }

        const response = await client.models.Profile.create(newProfile) as ProfileResponse
        profile.value = response.data
        return response.data
    }

    async function updateProfile(id: string, data: Partial<Omit<Profile, 'id' | 'userId' | 'createdAt'>>): Promise<Profile> {
        if (!id) throw new Error('Profile ID is required')

        const updateData = {
            id,
            ...data,
            updatedAt: new Date().toISOString(),
            lastActive: data.lastActive || new Date().toISOString()
        }

        const response = await client.models.Profile.update(updateData) as ProfileResponse
        return response.data
    }

    
    async function updateProfileFields(id: string, fields: Partial<Profile>) {
        if (!id) throw new Error('Profile ID is required')
    
        try {
            // First validate we have fields to update
            if (!fields || Object.keys(fields).length === 0) {
                throw new Error('No fields provided for update');
            }
    
            // Make sure the field exists in Profile type
            console.log(fields)
    
    
            const updateData = {
                id,
                ...fields,
                updatedAt: new Date().toISOString(),
                lastActive: new Date().toISOString()
            };
    
            const response = await client.models.Profile.update(updateData) as ProfileResponse;
            return response.data;
        } catch (error) {
            console.error('Update failed:', error);
            throw error;
        }
    }

    async function listProfiles(filter?: ProfileFilter): Promise<ProfileListResponse> {
        loading.value = true

        try {
            return await client.models.Profile.list(filter) as ProfileListResponse
        } finally {
            loading.value = false
        }
    }

    async function deleteProfile(id: string): Promise<Profile> {
        if (!id) throw new Error('Profile ID is required')
        loading.value = true

        try {
            const response = await client.models.Profile.delete({ id }) as ProfileResponse
            profile.value = null
            return response.data
        } finally {
            loading.value = false
        }
    }

    return {
        profile: computed(() => profile.value),
        loading: computed(() => loading.value),
        error: computed(() => error.value),
        getOrCreateProfile,
        updateProfile,
        updateProfileFields,
        listProfiles,
        deleteProfile
    }
}