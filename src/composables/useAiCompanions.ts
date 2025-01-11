import { ref } from 'vue';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';

const client = generateClient<Schema>();
type CompanionType = Schema['AiCompanionData']['type'];
type UpdateableCompanionFields = Partial<Omit<CompanionType, 'id' | 'createdAt' | 'updatedAt'>>;

interface CreateCompanionInput {
    aiOwnerId: string;
    seedId: string;
    imageURL: string;
}

export function useAiCompanions() {
    const companions = ref<Array<CompanionType>>([]);
    const error = ref<string | null>(null);
    const loading = ref(false);

    async function fetchCompanions() {
        try {
            loading.value = true;
            error.value = null;
            const { data: items, errors } = await client.models.AiCompanionData.list();

            if (errors) {
                const errorMessage = errors.map(e => e.message).join(', ');
                console.error('Failed to fetch companions:', errorMessage);
                error.value = 'Failed to fetch companions: ' + errorMessage;
                return [];
            }

            companions.value = items;
            return items;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown error';
            console.error('Error fetching companions:', message);
            error.value = 'Error fetching companions: ' + message;
            return [];
        } finally {
            loading.value = false;
        }
    }

    async function getCompanion(id: string) {
        try {
            error.value = null;
            const { data, errors } = await client.models.AiCompanionData.get({ id });

            if (errors) {
                const errorMessage = errors.map(e => e.message).join(', ');
                console.error('Failed to get companion:', errorMessage);
                error.value = 'Failed to get companion: ' + errorMessage;
                return null;
            }

            return data;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown error';
            console.error('Error getting companion:', message);
            error.value = 'Error getting companion: ' + message;
            return null;
        }
    }

    async function createCompanion(input: CreateCompanionInput) {
        try {
            error.value = null;
            const { data, errors } = await client.models.AiCompanionData.create(input);

            if (errors) {
                const errorMessage = errors.map(e => e.message).join(', ');
                console.error('Failed to create companion:', errorMessage);
                error.value = 'Failed to create companion: ' + errorMessage;
                return null;
            }
            return data;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown error';
            console.error('Error creating companion:', message);
            error.value = 'Error creating companion: ' + message;
            return null;
        }
    }

    async function updateCompanionField<K extends keyof UpdateableCompanionFields>(
        id: string,
        field: K,
        value: UpdateableCompanionFields[K]
    ) {
        try {
            error.value = null;
            loading.value = true;

            const { data, errors } = await client.models.AiCompanionData.update({
                id,
                [field]: value
            });

            if (errors) {
                const errorMessage = errors.map(e => e.message).join(', ');
                console.error('Failed to update companion:', errorMessage);
                error.value = 'Failed to update companion: ' + errorMessage;
                return null;
            }
            return data;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown error';
            console.error('Error updating companion:', message);
            error.value = 'Error updating companion: ' + message;
            return null;
        } finally {
            loading.value = false;
        }
    }

    async function getOrCreateCompanion(input: CreateCompanionInput) {
        try {
            error.value = null;
            loading.value = true;

            // First try to get the companion by owner and seed ID
            const existingCompanions = await fetchCompanions();
            const companion = existingCompanions.find(
                c => c.aiOwnerId === input.aiOwnerId && c.seedId === input.seedId
            );

            // If companion doesn't exist, create it
            if (!companion) {
                return await createCompanion(input);
            }

            return companion;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown error';
            console.error('Error in getOrCreate companion:', message);
            error.value = 'Error in getOrCreate companion: ' + message;
            return null;
        } finally {
            loading.value = false;
        }
    }

    return {
        companions,
        fetchCompanions,
        getCompanion,
        createCompanion,
        getOrCreateCompanion,
        updateCompanionField,
        error,
        loading
    };
}