import { ref, computed } from 'vue';
import { generateClient } from 'aws-amplify/api';
import type { Schema } from '../../amplify/data/resource';

const client = generateClient<Schema>();

// Define proper Amplify response types
type AmplifyData = {
    [key: string]: any; // Allow other properties
};

type AmplifyResponse<T = AmplifyData> = {
    data: T | null;
    errors?: Array<{ message: string }>;
};

interface AiCompanion {
    id?: string;
    ownerId: string;
    name: string;
    imageURL: string;
    bio: string;
    country: string;
    createdAt?: string;
    updatedAt?: string;
}

function transformAmplifyResponse(data: AmplifyData): AiCompanion {
    return {
        ...data,
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt || new Date().toISOString(),
    } as AiCompanion;
}

export function useAiCompanions() {
    const loading = ref(false);
    const error = ref<string | null>(null);
    const aiCompanions = ref<AiCompanion[]>([]);

    async function getAiCompanions(ownerId: string): Promise<AiCompanion[]> {
        if (!ownerId) throw new Error('Owner ID is required');
        loading.value = true;

        try {
            const response = await client.models.AiCompanionData.list({
                filter: { owner: { eq: ownerId } }
            }) as unknown as AmplifyResponse<AmplifyData[]>;

            if (!response.data?.length) return [];

            return response.data.map(transformAmplifyResponse);
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Failed to fetch AI companions';
            throw err;
        } finally {
            loading.value = false;
        }
    }

    async function createAiCompanion(input: Omit<AiCompanion, 'id' | 'createdAt' | 'updatedAt'>): Promise<AiCompanion> {
        const now = new Date().toISOString();
        const newAiCompanion = {
            ...input,
            createdAt: now,
            updatedAt: now,
        };

        try {
            const response = await client.models.AiCompanionData.create(newAiCompanion) as unknown as AmplifyResponse<AmplifyData>;
            if (!response.data) {
                throw new Error('Failed to create AI companion');
            }

            const createdAiCompanion = transformAmplifyResponse(response.data);
            aiCompanions.value.push(createdAiCompanion);
            return createdAiCompanion;
        } catch (err) {
            console.error('Failed to create AI companion:', err);
            throw err instanceof Error ? err : new Error('Failed to create AI companion');
        }
    }

    async function updateAiCompanionFields(
        id: string, 
        fields: Partial<Omit<AiCompanion, 'id' | 'createdAt' | 'updatedAt'>>
    ): Promise<AiCompanion> {
        if (!id) throw new Error('AI Companion ID is required');
        if (!fields || Object.keys(fields).length === 0) {
            throw new Error('No fields provided for update');
        }

        const updateData = {
            id,
            ...fields,
            updatedAt: new Date().toISOString(),
        };

        try {
            const response = await client.models.AiCompanionData.update(updateData) as unknown as AmplifyResponse<AmplifyData>;
            if (!response.data) {
                throw new Error('Update failed');
            }

            const updatedAiCompanion = transformAmplifyResponse(response.data);

            const index = aiCompanions.value.findIndex(companion => companion.id === id);
            if (index !== -1) {
                aiCompanions.value[index] = updatedAiCompanion;
            }

            return updatedAiCompanion;
        } catch (err) {
            console.error('Update failed:', err);
            throw err instanceof Error ? err : new Error('Update failed');
        }
    }

    return {
        aiCompanions: computed(() => aiCompanions.value),
        loading: computed(() => loading.value),
        error: computed(() => error.value),
        getAiCompanions,
        createAiCompanion,
        updateAiCompanionFields,
    };
}