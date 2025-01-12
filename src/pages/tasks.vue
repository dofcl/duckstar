<template>
    <div>
        <DuckLoader v-if="loading" />

        <div v-else>
            <div class="my-4">
                <h2>Tasks ({{ myTasks.length }})</h2>
                <div v-if="myTasks.length === 0">
                    No tasks yet.
                </div>
                <ul v-else>
                    <li v-for="task in myTasks" :key="task" class="mb-2">
                        <div class="flex items-center justify-between">
                            <div>{{ task.id }}</div>
                            <div>
                                {{ task.taskDescription }}
                                <span :class="getStatusClass(task.status)">{{ task.status }}</span>
                            </div>
                            <div v-if="task.ref1">
                                <el-button @click="() => playAudio(task.ref1)" size="small">
                                    Play Audio 1
                                </el-button>
                                <el-button v-if="task.ref2" @click="() => playAudio(task.ref2)" size="small">
                                    Play Audio 2
                                </el-button>
                            </div>
                        </div>
                        <div class="text-sm text-gray-500">
                            Created: {{ formatDate(task.createdAt) }}
                            <span v-if="task.finishedAt">
                                | Finished: {{ formatDate(task.finishedAt) }} {{ task.failed ? 'Failed' : '' }}
                            </span>
                            {{ task.taskId }}
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getCurrentUser } from 'aws-amplify/auth';
import DuckLoader from '@/components/DuckLoader.vue';
import { useTasks } from '@/composables/useTasks';

interface Task {
    id: string;
    taskId: string;
    status: string;
    failed: boolean;
    failedReason?: string;
    finished: boolean;
    finishedAt?: string;
    createdAt?: string;
    taskDescription?: string;
    ref1?: string;
    ref2?: string;
}

const { fetchTasksForUser } = useTasks();
const loading = ref<boolean>(true);
const myTasks = ref<Task[]>([]);

const formatDate = (dateString?: string): string => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString();
};

const getStatusClass = (status: string): string => {
    const baseClasses = 'ml-2 px-2 py-1 rounded text-sm';
    switch (status) {
        case 'TEXT':
            return `${baseClasses} bg-blue-100 text-blue-800`;
        case 'COMPLETED':
            return `${baseClasses} bg-green-100 text-green-800`;
        case 'FAILED':
            return `${baseClasses} bg-red-100 text-red-800`;
        default:
            return `${baseClasses} bg-gray-100 text-gray-800`;
    }
};

const playAudio = (ref: string) => {
    const audioUrl = `https://mfile.erweima.ai/${ref}`;
    const audio = new Audio(audioUrl);
    audio.play();
};

onMounted(async () => {
    try {
        const user = await getCurrentUser();
        if (!user) {
            loading.value = false;
            return;
        }

        const tasks = await fetchTasksForUser(user.userId);
        myTasks.value = tasks.data || [];
    } catch (error) {
        console.error('Error loading tasks:', error);
    } finally {
        loading.value = false;
    }
});
</script>

<style scoped>
.flex {
    display: flex;
}

.items-center {
    align-items: center;
}

.justify-between {
    justify-content: space-between;
}

.mb-2 {
    margin-bottom: 0.5rem;
}

.text-sm {
    font-size: 0.875rem;
}

.text-gray-500 {
    color: #6b7280;
}
</style>