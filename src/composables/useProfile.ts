import { ref, computed, type ComputedRef } from 'vue'
import { generateClient } from 'aws-amplify/api'
import type { Schema } from '../../amplify/data/resource'

const client = generateClient<Schema>()

interface AmplifyResponse<T> {
  data: T;
  errors?: { message: string }[];
}

interface AmplifyListResponse<T> {
  data: T[];
  errors?: { message: string }[];
  nextToken?: string;
}

export interface ProfileData {
  id?: string
  userId: string
  username: string
  email: string | null
  onboarded: boolean | null
  firstName?: string | null
  lastName?: string | null
  displayName?: string | null
  avatar?: string | null
  bio?: string | null
  country?: string | null
  language?: string | null
  lastActive?: string | null
  credits: number
  songsCreated: number
  lipSyncBattlesAttempted: number
  lipSyncBattlesWon: number
  lipSyncBattlesLost: number
  producerId?: string
  aiCompanions?: string[]
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
  createdAt?: string
  updatedAt?: string
}

export interface ProfileServiceReturn {
  profile: ComputedRef<ProfileData | null>
  loading: ComputedRef<boolean>
  error: ComputedRef<string | null>
  getOrCreateProfile: (userData: Pick<ProfileData, 'userId' | 'username' | 'email'> & Partial<ProfileData>) => Promise<ProfileData>
  createProfile: (data: CreateProfileInput) => Promise<AmplifyResponse<ProfileData>>
  updateProfile: (id: string, data: Partial<Omit<ProfileData, 'id' | 'userId' | 'createdAt'>>) => Promise<AmplifyResponse<ProfileData>>
  listProfiles: (filter?: ListProfilesFilter) => Promise<AmplifyListResponse<ProfileData>>
  deleteProfile: (id: string) => Promise<AmplifyResponse<ProfileData>>
}

interface CreateProfileInput extends Omit<ProfileData, 'id' | 'createdAt' | 'updatedAt'> {
  userId: string
  username: string
}

interface ListProfilesFilter {
  filter?: Record<string, unknown>
  limit?: number
  nextToken?: string
}

export function useProfile(): ProfileServiceReturn {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const profile = ref<ProfileData | null>(null)

  async function checkProfileExists(userId: string): Promise<ProfileData | null> {
    if (!userId) throw new Error('User ID is required')

    loading.value = true
    error.value = null
    
    try {
      const response = await client.models.Profile.list({
        filter: { userId: { eq: userId } }
      }) as AmplifyListResponse<ProfileData>
      
      if (response.data?.[0]) {
        const profileData: ProfileData = {
          ...response.data[0],
          onboarded: response.data[0].onboarded ?? false,
          status: response.data[0].status || 'ACTIVE'
        }
        profile.value = profileData
        return profileData
      }
      
      return null
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to check profile'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function getOrCreateProfile(
    userData: Pick<ProfileData, 'userId' | 'username' | 'email'> & Partial<ProfileData>
  ): Promise<ProfileData> {
    if (!userData.userId) throw new Error('User ID is required')

    loading.value = true
    error.value = null
    
    try {
      const existingProfile = await checkProfileExists(userData.userId)
      if (existingProfile) return existingProfile
      
      const initialData: CreateProfileInput = {
        ...userData,
        status: 'ACTIVE',
        credits: 100,
        onboarded: false,
        songsCreated: 0,
        lipSyncBattlesAttempted: 0,
        lipSyncBattlesWon: 0,
        lipSyncBattlesLost: 0
      }
  
      const response = await createProfile(initialData)
      profile.value = response.data
      return response.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Profile creation failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createProfile(data: CreateProfileInput): Promise<AmplifyResponse<ProfileData>> {
    if (!data.userId || !data.username) {
      throw new Error('userId and username are required')
    }
  
    const profileData = {
      ...data,
      credits: data.credits ?? 100,
      status: data.status ?? 'ACTIVE',
      onboarded: data.onboarded ?? false,
      songsCreated: data.songsCreated ?? 0,
      lipSyncBattlesAttempted: data.lipSyncBattlesAttempted ?? 0,
      lipSyncBattlesWon: data.lipSyncBattlesWon ?? 0,
      lipSyncBattlesLost: data.lipSyncBattlesLost ?? 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastActive: new Date().toISOString()
    }

    const response = await client.models.Profile.create(profileData)
    if (!response.data) throw new Error('Profile creation failed')
    return response as AmplifyResponse<ProfileData>
  }

  async function updateProfile(
    id: string,
    data: Partial<Omit<ProfileData, 'id' | 'userId' | 'createdAt'>>
  ): Promise<AmplifyResponse<ProfileData>> {
    if (!id) throw new Error('Profile ID is required')
    
    const updateData = {
      id,
      ...data,
      updatedAt: new Date().toISOString(),
      ...(data.lastActive ? {} : { lastActive: new Date().toISOString() })
    }

    const response = await client.models.Profile.update(updateData)
    if (!response.data) throw new Error('Profile update failed')
    return response as AmplifyResponse<ProfileData>
  }

  async function listProfiles(filter?: ListProfilesFilter): Promise<AmplifyListResponse<ProfileData>> {
    loading.value = true
    error.value = null

    try {
      const response = await client.models.Profile.list(filter)
      return response as AmplifyListResponse<ProfileData>
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to list profiles'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteProfile(id: string): Promise<AmplifyResponse<ProfileData>> {
    if (!id) throw new Error('Profile ID is required')

    loading.value = true
    error.value = null

    try {
      const response = await client.models.Profile.delete({ id })
      if (!response.data) throw new Error('Profile deletion failed')
      profile.value = null
      return response as AmplifyResponse<ProfileData>
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete profile'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    profile: computed(() => profile.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    getOrCreateProfile,
    createProfile,
    updateProfile,
    listProfiles,
    deleteProfile
  }
}