<template>
    <div>
        <DuckLoader v-if="loading" />

        <div v-else>
            <div class="float-right">
                <el-button @click="createSong" type="primary" size="large">Create Song</el-button>
            </div>

            <div class="my-4">
                <h2>My Songs ({{ mySongs.length }})</h2>
                <div v-if="mySongs.length === 0">
                    No songs yet. Create your first song!
                    <el-button @click="createSong">Create Song</el-button>
                </div>
                <ul v-else>
                    <li v-for="song in mySongs" :key="song.id">
                        {{ song.title }}
                        <el-button @click="() => editLyrics(song.id)">Edit Lyrics</el-button>
                        <el-button @click="() => editMusic(song.id)">Edit Music</el-button>
                        <el-button>Edit Video</el-button>
                    </li>
                </ul>
            </div>

            <div class="my-4">
                <h2>Create Songs</h2>
                <ul>
                    <li>Music</li>
                    <li>Lyrics</li>
                    <li>Video</li>
                </ul>
            </div>

            <div class="my-4">
                <h2>Explore</h2>
            </div>

            <div class="my-4">
                <h2>Charts</h2>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getCurrentUser } from 'aws-amplify/auth';
import DuckLoader from '@/components/DuckLoader.vue';
import { useSongs } from '@/composables/useSongs';
import { fadeOutAndStop } from '@/utils/fadeout';

interface Song {
    id: string;
    title?: string;
    // Add other song properties as needed
}

interface User {
    userId: string;
    username: string;
}

const { fetchSongs } = useSongs();
const router = useRouter();

const loading = ref<boolean>(true);
const userId = ref<string | null>(null);
const mySongs = ref<Song[]>([]);

const editMusic = (id: string): void => {
    console.log('editMusic');
    router.push(`/create-music?songId=${id}`);
};

const editLyrics = (id: string): void => {
    console.log('editLyrics');
    router.push(`/edit-lyrics?songId=${id}`);
};

const createSong = (): void => {
    router.push("/create-song");
};

const getUser = async (): Promise<User | null> => {
    try {
        const { userId, username } = await getCurrentUser();
        return { userId, username };
    } catch (err) {
        console.error('Not signed in');
        return null;
    }
};

onMounted(async () => {
    void fadeOutAndStop(2000);
    
    try {
        const user = await getUser();
        if (!user) {
            loading.value = false;
            return;
        }

        userId.value = user.userId;
        const songs = await fetchSongs(user.userId);
        mySongs.value = (songs || []).map(song => ({
            id: song.id,
            title: song.title ?? undefined,
        }));
    } catch (error) {
        console.error('Error loading songs:', error);
    } finally {
        loading.value = false;
    }
});
</script>