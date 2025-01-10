import { ref } from 'vue';
import { generateClient } from 'aws-amplify/api';
import type { Schema } from '../../amplify/data/resource';
import type { AiCompanionData } from '../types/schema';

const client = generateClient<Schema>();

export function useAiCompanions() {
    const companions = ref<AiCompanionData[]>([]);
    const isLoading = ref<boolean>(false);
    const error = ref<string | null>(null);

    type AmplifyData = {
        [key: string]: any; // Allow other properties
    };

    type AmplifyResponse<T = AmplifyData> = {
        data: T | null;
        errors?: Array<{ message: string }>;
    };

    const fetchCompanions = async (ownerId: string): Promise<AiCompanionData[]> => {
        isLoading.value = true;
        error.value = null;

        try {
            const filter = { aiOwnerId: { eq: ownerId } };
            const result = await client.models.AiCompanionData.list({ filter }) as { data: AiCompanionData[] };

            companions.value = result?.data.map(companion => ({
                ...companion,
                createdAt: companion.createdAt ?? '',
                updatedAt: companion.updatedAt ?? ''
            })) ?? []; // Use nullish coalescing to set a default empty array
            return companions.value;
        } catch (err: unknown) {
            // Type narrowing for error handling
            error.value = err instanceof Error ? err.message : 'Failed to fetch AI companions';
            companions.value = [];
            throw err; // rethrow error
        } finally {
            isLoading.value = false;
        }
    };

    const createCompanion = async (input: Omit<AiCompanionData, 'id' | 'createdAt' | 'updatedAt'>): Promise<AiCompanionData> => {
        try {
            const result = await client.models.AiCompanionData.create({
                ...input,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });

            const newCompanion = result?.data as AiCompanionData | undefined; // Type cast with undefined fallback
            if (newCompanion) {
                companions.value.push(newCompanion);
                return newCompanion;
            }

            throw new Error('Failed to create AI companion');
        } catch (err: unknown) {
            error.value = err instanceof Error ? err.message : 'Failed to create AI companion';
            throw err;
        }
    };

    const updateCompanion = async (
        id: string, 
        updates: Partial<Omit<AiCompanionData, 'id' | 'createdAt' | 'updatedAt'>>
    ): Promise<AiCompanionData> => {
        try {
            const result = await client.models.AiCompanionData.update({
                id,
                ...updates,
                updatedAt: new Date().toISOString()
            });

            const updatedCompanion = result?.data as AiCompanionData | undefined;
            if (updatedCompanion) {
                const index = companions.value.findIndex(c => c.id === id);
                if (index !== -1) {
                    companions.value[index] = updatedCompanion;
                }
                return updatedCompanion;
            }

            throw new Error('Failed to update AI companion');
        } catch (err: unknown) {
            error.value = err instanceof Error ? err.message : 'Failed to update AI companion';
            throw err;
        }
    };

    const updateAiPopStarFields = async (
        id: string, 
        fields: Partial<Omit<AiCompanionData, 'id' | 'createdAt' | 'updatedAt'>>
    ): Promise<AiCompanionData> => {
        if (!fields || Object.keys(fields).length === 0) {
            throw new Error('No fields provided for update');
        }

        const updateData = {
            id,
            ...fields,
            updatedAt: new Date().toISOString(),
        };

        try {
            const response = await client.models.AiCompanionData.update(updateData) as AmplifyResponse<AiCompanionData>;
            if (!response.data) {
                throw new Error('Update failed');
            }

            const updatedCompanion = response.data;

            const index = companions.value.findIndex(companion => companion.id === id);
            if (index !== -1) {
                companions.value[index] = updatedCompanion;
            }

            return updatedCompanion;
        } catch (err) {
            console.error('Update failed:', err);
            throw err instanceof Error ? err : new Error('Update failed');
        }
    };

    const deleteCompanion = async (id: string): Promise<void> => {
        try {
            await client.models.AiCompanionData.delete({ id });
            companions.value = companions.value.filter(c => c.id !== id);
        } catch (err: unknown) {
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
        updateAiPopStarFields,
        deleteCompanion
    };
}
