import { ref } from 'vue';
import { generateClient } from 'aws-amplify/api';
import type { Schema } from '../../amplify/data/resource';
import type { AiCompanionData } from '../types/schema';

const client = generateClient<Schema>();

type CreateInput = Omit<AiCompanionData, 'id' | 'createdAt' | 'updatedAt'>;
type UpdateInput = Partial<Omit<AiCompanionData, 'id' | 'createdAt' | 'updatedAt'>>;

export function useAiCompanions() {
    const companions = ref<AiCompanionData[]>([]);
    const isLoading = ref<boolean>(false);
    const error = ref<string | null>(null);

    const fetchCompanions = async (ownerId: string): Promise<AiCompanionData[]> => {
        isLoading.value = true;
        error.value = null;

        try {
            // ignore the union to complicated error
            // @ts-ignore 
            const response = await client.models.AiCompanionData.list({
                filter: { aiOwnerId: { eq: ownerId } }
            }) as unknown as { data: AiCompanionData[] | null };

            if (!response?.data) {
                throw new Error('No data received from API');
            }

            companions.value = response.data;
            return companions.value;
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Failed to fetch AI companions';
            throw err;
        } finally {
            isLoading.value = false;
        }
    };

    const createCompanion = async (input: CreateInput): Promise<AiCompanionData> => {
        try {
            const response = await client.models.AiCompanionData.create(input) as { data: AiCompanionData | null };
            
            if (!response?.data) {
                throw new Error('Failed to create AI companion');
            }
            
            const newCompanion = response.data;
            companions.value = [...companions.value, newCompanion];
            return newCompanion;
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Failed to create AI companion';
            throw err;
        }
    };

    const updateCompanion = async (
        id: string, 
        updates: UpdateInput
    ): Promise<AiCompanionData> => {
        try {
            const response = await client.models.AiCompanionData.update({
                id,
                ...updates
            }) as { data: AiCompanionData | null };
            
            if (!response?.data) {
                throw new Error('Failed to update AI companion');
            }

            const updatedCompanion = response.data;
            companions.value = companions.value.map(companion => 
                companion.id === id ? updatedCompanion : companion
            );

            return updatedCompanion;
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Failed to update AI companion';
            throw err;
        }
    };

    const deleteCompanion = async (id: string): Promise<void> => {
        try {
            const response = await client.models.AiCompanionData.delete({ id }) as { data: AiCompanionData | null };
            
            if (!response?.data) {
                throw new Error('Failed to delete AI companion');
            }

            companions.value = companions.value.filter(companion => companion.id !== id);
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Failed to delete AI companion';
            throw err;
        }
    };

    return {
        companions,
        isLoading,
        error,
        fetchCompanions,
        createCompanion,
        updateCompanion,
        deleteCompanion
    } as const;
}