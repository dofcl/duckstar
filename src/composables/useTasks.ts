import { ref } from 'vue';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';

const client = generateClient<Schema>();
type ComputeTaskType = Schema['ComputeTasks']['type'];

interface CreateComputeTaskInput {
    taskOwnerId: string;
    taskId: string;
    songId: string;
    taskDescription?: string;
    status?: string;
}

export function useTasks() {
    const tasks = ref<Array<ComputeTaskType>>([]);
    const error = ref<string | null>(null);
    const loading = ref(false);

    async function fetchTasksForUser(userId: string) {
        try {
            loading.value = true;
            error.value = null;

            const response: Array<ComputeTaskType> = await client.models.ComputeTasks.list({
                index: 'taskOwnerId-index',
                filter: {
                    taskOwnerId: {
                        eq: userId
                    }
                },
                sort: {
                    field: 'createdAt',
                    direction: 'desc'
                }
            });

            return response;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown error';
            console.error('Error fetching tasks:', message);
            error.value = 'Error fetching tasks: ' + message;
            return [];
        } finally {
            loading.value = false;
        }
    }

    async function fetchTasksForSong(songId: string) {
        try {
            loading.value = true;
            error.value = null;

            const response = await client.models.ComputeTasks.list({
                index: 'songId-index',
                filter: {
                    songId: {
                        eq: songId
                    }
                }
            });

            tasks.value = response;
            return response;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown error';
            console.error('Error fetching compute tasks:', message);
            error.value = 'Error fetching compute tasks: ' + message;
            return [];
        } finally {
            loading.value = false;
        }
    }

    async function createTask(input: CreateComputeTaskInput) {
        try {
            loading.value = true;
            error.value = null;

            const response = await client.models.ComputeTasks.create({
                ...input,
                taskType: 'defaultType', // or any appropriate value
                status: input.status || 'STARTED',
                finished: false,
                failed: false
            });

            await fetchTasksForSong(input.songId);
            return response;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown error';
            console.error('Error creating compute task:', message);
            error.value = 'Error creating compute task: ' + message;
            return null;
        } finally {
            loading.value = false;
        }
    }

    async function updateTaskStatus(
        taskId: string,
        status: string,
        finished: boolean = false,
        failed: boolean = false,
        failedReason?: string
    ) {
        try {
            loading.value = true;
            error.value = null;

            const updateData: any = {
                id: taskId,
                status,
                finished,
                failed
            };

            if (finished) {
                updateData.finishedAt = new Date().toISOString();
            }

            if (failedReason) {
                updateData.failedReason = failedReason;
            }

            const response = await client.models.ComputeTasks.update(updateData);
            return response;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown error';
            console.error('Error updating compute task:', message);
            error.value = 'Error updating compute task: ' + message;
            return null;
        } finally {
            loading.value = false;
        }
    }

    async function getTask(taskId: string) {
        try {
            error.value = null;
            const response = await client.models.ComputeTasks.get({ id: taskId });
            return response;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown error';
            console.error('Error getting compute task:', message);
            error.value = 'Error getting compute task: ' + message;
            return null;
        }
    }

    async function deleteTask(taskId: string) {
        try {
            loading.value = true;
            error.value = null;

            const response = await client.models.ComputeTasks.delete({ id: taskId });
            return response;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown error';
            console.error('Error deleting compute task:', message);
            error.value = 'Error deleting compute task: ' + message;
            return null;
        } finally {
            loading.value = false;
        }
    }

    return {
        tasks,
        loading,
        error,
        fetchTasksForUser,
        fetchTasksForSong,
        createTask,
        updateTaskStatus,
        getTask,
        deleteTask
    };
}