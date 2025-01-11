<template>
    <h1 class="mb-0 pb-0">Create Song</h1>

    <div class="mx-auto max-w-md mt-0 pt-0">
        <p>Song Title</p>
        <el-input v-model="songTitle" placeholder="Name your song" size="large" class="mt-0 pt-0" />
        <p class="mb-0 pb-0">Song Style</p>
        <MusicGenre :userId="userId" :saveInComponent="false" @genres-selected="handleGenre" />

        <div class="mx-auto text-center mt-4">
            <el-button type="primary" @click="goToCreateMusic" size="large">Create Music</el-button>
            <el-button type="primary" @click="goToCreateLyrics" size="large">Create Lyrics</el-button>
        </div>

    </div>

</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue';
import MusicGenre from '@/components/MusicGenre.vue';
import { getCurrentUser } from 'aws-amplify/auth';
import { useRouter } from 'vue-router';

import { useSongs } from '../composables/useSongs';

const { createLyrics } = useSongs();
const router = useRouter();

const songTitle = ref('');
const songDescription = ref('Creating Music and writing songs');
const userId = ref('');

const saveSongdraft = () => {
    console.log('Saving song draft');
}

const goToCreateMusic = async () => {
    console.log('Creating song', songTitle.value);
    await saveSongdraft();
    router.push('/create-music');
}
const goToCreateLyrics = async () => {
    await saveSongdraft();
    console.log('Creating lyrics');
}

const handleGenre = async (genres: string[]) => {
    console.log('Selected genres', genres);
    const description = `A ${genres.join(', ')} about ${songDescription.value}`;

    await createLyrics(description).then((data) => {
        console.log('Lyrics created', data);
    });

}

onMounted(() => {
    getCurrentUser().then((user) => {
        userId.value = user.userId;
    });
});
</script>
