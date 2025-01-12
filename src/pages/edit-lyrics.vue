<template>
    <DuckLoader v-if="loading" />
    <div v-else class="mt-6">
        <LyricsEditPlay :title="songTitle" :lyricsText="lyrics" :songData="songData"
            @update:lyricsText="updateLyrics" />
    </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useSongs } from '@/composables/useSongs';
import LyricsEditPlay from '@/components/LyricsEditPlay.vue';
import DuckLoader from '@/components/DuckLoader.vue';
const { getSong } = useSongs();
import { useRoute } from 'vue-router';
import { fadeOutAndStop } from '@/utils/fadeout';


const route = useRoute();
const songTitle = ref('');
const lyrics = ref('');
const songData = ref({});
const loading = ref(true)

const updateLyrics = (newLyrics: string) => {
    lyrics.value = newLyrics;
};

onMounted(async () => {
    await fadeOutAndStop(2000)
    const songId = Array.isArray(route.query.songId) ? route.query.songId[0] : route.query.songId || '';
    console.log('songId', songId)
    await getSong(songId).then((resp) => {
        if (resp) {
            console.log('songData', resp)
            console.log('songData title', resp.title)
            songTitle.value = resp.title || "";
            songData.value = resp;
            lyrics.value = resp.lyrics || "";
        } else {
            console.error('Failed to fetch song data');
        }
        loading.value = false
    });

});


</script>