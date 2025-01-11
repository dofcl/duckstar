import { ref } from 'vue';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';

const client = generateClient<Schema>();
type SongType = Schema['Songs']['type'];
type UpdateableSongFields = Partial<Omit<SongType, 'id' | 'songOwnerId' | 'createdAt' | 'updatedAt'>>;

interface SongUpdateResponse {
    data?: {
        id: string;
        [key: string]: any;
    };
    errors?: string[];
}

interface SongResponse {
    data?: SongType;
    errors?: { message: string }[];
}

interface CreateSongInput {
    id: string;
    songOwnerId: string;
    // Optional fields with defaults from schema
    status?: string; // defaults to 'DRAFT'
    isExplicit?: boolean; // defaults to false
    likesCount?: number; // defaults to 0
    playCount?: number; // defaults to 0
    royalties?: number; // defaults to 0
    shares?: number; // defaults to 0
    trendingScore?: number; // defaults to 0
    viewsLast24h?: number; // defaults to 0
    // Optional fields without defaults
    aICollabId?: string;
    audioUrl?: string;
    description?: string;
    genre?: string;
    imageURL?: string;
    lyrics?: string;
    songProducerId?: string;
    title?: string;
    trackId?: string;
    totalDuration?: number;
}

export function useSongs() {
    const songs = ref<Array<SongType>>([]);
    const error = ref<string | null>(null);
    const loading = ref(false);

    async function fetchSongs(ownerId: string) {
        try {
            loading.value = true;
            error.value = null;

            const response: { data: SongType[], errors?: string[] } = await client.models.Songs.list({
                filter: {
                    songOwnerId: {
                        eq: ownerId
                    }
                }
            });

            const { data: items, errors } = response;

            if (errors) {
                const errorMessage = errors.join(', ');
                console.error('Failed to fetch songs:', errorMessage);
                error.value = 'Failed to fetch songs: ' + errorMessage;
                return [];
            }

            songs.value = items;
            return items;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown error';
            console.error('Error fetching songs:', message);
            error.value = 'Error fetching songs: ' + message;
            return [];
        } finally {
            loading.value = false;
        }
    }

    async function getSong(id: string) {
        try {
            error.value = null;
            const { data, errors } = await client.models.Songs.get({ id }) as SongResponse;

            if (errors) {
                const errorMessage = errors.map(e => e.message).join(', ');
                console.error('Failed to get song:', errorMessage);
                error.value = 'Failed to get song: ' + errorMessage;
                return null;
            }

            return data;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown error';
            console.error('Error getting song:', message);
            error.value = 'Error getting song: ' + message;
            return null;
        }
    }

    async function createSong(
        id: string,
        songOwnerId: string,
        initialData: Partial<Omit<CreateSongInput, 'id' | 'songOwnerId'>> = {}
    ) {
        try {
            error.value = null;

            const createInput: CreateSongInput = {
                id,
                songOwnerId,
                ...initialData
            };

            const { data, errors }: SongUpdateResponse = await client.models.Songs.update(createInput);

            if (errors) {
                const errorMessage = errors.join(', ');
                console.error('Failed to create song:', errorMessage);
                error.value = 'Failed to create song: ' + errorMessage;
                return null;
            }

            await fetchSongs(songOwnerId); // Refresh the list
            return data;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown error';
            console.error('Error creating song:', message);
            error.value = 'Error creating song: ' + message;
            return null;
        }
    }

    async function getOrCreateSong(
        id: string,
        songOwnerId: string,
        initialData: Partial<Omit<CreateSongInput, 'id' | 'songOwnerId'>> = {}
    ) {
        try {
            error.value = null;
            loading.value = true;

            let song = await getSong(id);

            if (!song) {
                song = await createSong(id, songOwnerId, initialData);
            }

            return song;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown error';
            console.error('Error in getOrCreate song:', message);
            error.value = 'Error in getOrCreate song: ' + message;
            return null;
        } finally {
            loading.value = false;
        }
    }

    async function updateSongField<K extends keyof UpdateableSongFields>(
        id: string,
        field: K,
        value: UpdateableSongFields[K]
    ) {
        try {
            error.value = null;
            loading.value = true;

            const payload = { id, [field]: value };
            const { data, errors } = await client.models.Songs.update(payload);

            if (errors) {
                const errorMessage = errors.map(e => e.message).join(', ');
                console.error('Failed to update song:', errorMessage);
                error.value = 'Failed to update song: ' + errorMessage;
                return null;
            }
            return data;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown error';
            console.error('Error updating song:', message);
            error.value = 'Error updating song: ' + message;
            return null;
        } finally {
            loading.value = false;
        }
    }

    async function deleteSong(id: string) {
        try {
            error.value = null;
            loading.value = true;

            const { data, errors } = await client.models.Songs.delete({ id });

            if (errors) {
                const errorMessage = errors.map(e => e.message).join(', ');
                console.error('Failed to delete song:', errorMessage);
                error.value = 'Failed to delete song: ' + errorMessage;
                return null;
            }
            return data;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown error';
            console.error('Error deleting song:', message);
            error.value = 'Error deleting song: ' + message;
            return null;
        } finally {
            loading.value = false;
        }
    }

    async function createLyrics() {

        const { data: conversation } = await client.conversations.chat.create();

        // Assistant messages come back as websocket events
        // over a subscription
        conversation.onStreamEvent({
            next: (event) => {
                console.log(event);
            },
            error: (error) => {
                console.log(error);
            }
        });

        // When sending user messages you only need to send
        // the latest message, the conversation history
        // is stored in DynamoDB and retrieved in Lambda
        conversation.sendMessage({
            content: [{ text: "hello" }],
        })

        const { data } = await client.generations.generateRecipe({
            description: 'A gluten free chocolate cake'
        });
        console.log('Generated recipe:', data);
        try {
            console.log('Generating lyrics...');
            const { data } = await client.generations.generateSong({
                description: 'Song about cake'
            });
            console.log('Generated lyrics:', data);
            return data;
        } catch (error) {
            console.error('Error generating lyrics:', error);
            throw error;
        }
    }

    return {
        songs,
        fetchSongs,
        getSong,
        createSong,
        getOrCreateSong,
        updateSongField,
        deleteSong,
        error,
        loading, createLyrics
    };
}
