<template>
    <div>
        <el-button class="float-right" @click="toggleEdit">{{ isEditing ? 'Save' : 'Edit' }}</el-button>
        <div v-if="!isEditing">
            <h3 class="ml-4 pt-0 mt-2">{{ title }}</h3>
            <div class="text-left ma-4 mt-2" v-html="formattedLyricsText"></div>
        </div>

        <div v-else>
            <h4 class="text-center ma-0 pa-0">{{ title }}</h4>
            <el-input v-model="editableLyricsText" type="textarea" autosize :maxlength="wordLimit" show-word-limit
                class="text-left mx-4 my-4" style="max-width: 95%;" />
        </div>
        <div class="text-right">
            <el-button class="mb-2" @click="toggleEdit">{{ isEditing ? 'Save' : 'Edit' }}</el-button>
        </div>

        <div class="text-center">
            <hr>
            <el-button class="mt-2" @click="gotoMusic" type="primary" size="large">Add Music</el-button>
        </div>
    </div>
</template>

<script setup lang="ts">
import {ref, computed, defineEmits, watch } from 'vue';
import { useSongs } from '@/composables/useSongs';
const { updateSongField } = useSongs();

interface SongData {
    id: string;
    lyrics: string;
    music: string;
    createdAt: string;
    updatedAt: string;
}

const props = defineProps<{
    lyricsText: string;
    title: string;
    songData: SongData;
}>();

const emit = defineEmits(['update:lyricsText']);

const isEditing = ref(false);
const wordLimit = 1000;
const editableLyricsText = ref(props.lyricsText);

const saveSong = async (): Promise<void> => {
    console.log('saveSong', props.songData)
    console.log(props.songData.id, 'lyrics', editableLyricsText.value)
    await updateSongField(props.songData.id, 'lyrics', editableLyricsText.value)
    if (!props.songData.title) {
        await updateSongField(props.songData.id, 'title', props.title)
    }
}

const toggleEdit = () => {
    const words = props.lyricsText.trim().split(/\s+/).length;
    if (words > 200) {
        // Split text into words and take first 200
        const limitedWords = props.lyricsText.trim().split(/\s+/).slice(0, 200);
        editableLyricsText.value = limitedWords.join(' ');
    } else {
        // Emit the updated lyrics to the parent component
        emit('update:lyricsText', editableLyricsText.value);
        isEditing.value = !isEditing.value;
        saveSong();
    }

};

const formattedLyricsText = computed(() => {
    if (props.lyricsText) {
        return props.lyricsText.replace(/\n/g, '<br>');
    } else {
        return ""
    }
});

// Watch for changes in props.lyricsText and update editableLyricsText accordingly
watch(() => props.lyricsText, (newLyrics) => {
    editableLyricsText.value = newLyrics;
});

import { useRouter } from 'vue-router';
const router = useRouter();

const gotoMusic = () => {
    emit('update:lyricsText', editableLyricsText.value);
    saveSong();
    router.push("/create-music?songId=" + props.songData.id)
}
</script>

<style scoped>
.float-right {
    float: right;
}

.btm-button {
    bottom: 20px !important;
    position: absolute;
    right: 4px;
}
</style>