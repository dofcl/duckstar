import { ref } from 'vue';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';

const client = generateClient<Schema>();
type CompanionType = Schema['AiCompanionData']['type'];

// Core interfaces
interface AiCompanionDataItem extends Pick<CompanionType, 'id' | 'name' | 'aiOwnerId' | 'seedId' | 'imageURL'> {}

interface ErrorResponse {
  message: string;
}

// Simplified input type
type CreateCompanionInput = Pick<AiCompanionDataItem, 'aiOwnerId' | 'seedId' | 'imageURL'>;

// Fields that can be updated
type UpdateableCompanionFields = Partial<Omit<CompanionType, 'id' | 'createdAt' | 'updatedAt'>>;

export function useAiCompanions() {
    const companions = ref<CompanionType[]>([]);
    const error = ref<string | null>(null);
    const loading = ref(false);

    // Helper function to handle errors consistently
    const handleError = (err: unknown, context: string): null => {
        const message = err instanceof Error ? err.message : 'Unknown error';
        const errorMessage = `Error ${context}: ${message}`;
        console.error(errorMessage);
        error.value = errorMessage;
        return null;
    };

    // Helper function to handle API responses
    const handleResponse = <T>(
        response: { data?: T; errors?: ErrorResponse[] },
        context: string
    ): T | null => {
        if (response.errors) {
            const errorMessage = response.errors?.map(e => e.message).join(', ') || 'Unknown error';
            return handleError(new Error(errorMessage), context);
        }
        return response.data || null;
    };

    // Main functions with simplified error handling
    async function fetchCompanions() {
        try {
            loading.value = true;
            error.value = null;
            
            const response = await client.models.AiCompanionData.list();
            const items = handleResponse(response, 'fetching companions');
            
            if (items) {
                companions.value = items.filter(item => item.name !== null) as CompanionType[];
                return items;
            }
            return [];
        } catch (err) {
            return handleError(err, 'fetching companions');
        } finally {
            loading.value = false;
        }
    }

    async function getCompanion(id: string) {
        try {
            error.value = null;
            const response = await client.models.AiCompanionData.get({ id });
            return handleResponse(response, 'getting companion');
        } catch (err) {
            return handleError(err, 'getting companion');
        }
    }

    async function createCompanion(input: CreateCompanionInput) {
        try {
            error.value = null;
            const response = await client.models.AiCompanionData.create(input);
            return handleResponse(response, 'creating companion');
        } catch (err) {
            return handleError(err, 'creating companion');
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
            
            const response = await client.models.AiCompanionData.update({
                id,
                [field]: value
            });
            
            return handleResponse(response, 'updating companion');
        } catch (err) {
            return handleError(err, 'updating companion');
        } finally {
            loading.value = false;
        }
    }

    async function getOrCreateCompanion(input: CreateCompanionInput) {
        try {
            error.value = null;
            loading.value = true;

            const existingCompanions = await fetchCompanions();
            const companion = existingCompanions?.find(
                c => c.aiOwnerId === input.aiOwnerId && c.seedId === input.seedId
            );

            return companion || await createCompanion(input);
        } catch (err) {
            return handleError(err, 'get/create companion');
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