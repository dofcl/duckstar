<template>
    <div v-if="loading" class="mt-12">
        <DuckLoader />
    </div>
    <div>
        <el-button v-if="!props.hideButtons" class="float-right" type="info" @click="toggleEdit">{{ isEditing ? 'Save' :
            'Edit'
            }}</el-button>

        <div v-if="!isEditing">
            <h3 class="ml-4 pt-0 mt-2">{{ editableSongText }}</h3>
            <div class="text-left ma-4 mt-2" v-html="formattedLyricsText"></div>
        </div>

        <div v-else class="mt-4 pt-4"><br>
            <el-input v-model="editableSongText"></el-input>
            <el-input v-model="editableLyricsText" type="textarea" autosize :maxlength="wordLimit" show-word-limit
                class="text-left mx-4 my-4" style="max-width: 95%;" />
        </div>
        <div class="text-right">
            <el-button v-if="!props.hideButtons" class="mb-2" type="info" @click="toggleEdit">{{ isEditing ? 'Save' :
                'Edit'
                }}</el-button>
        </div>

        <div v-if="!props.hideButtons" class="text-center">
            <hr>
            <el-button class="mt-2" @click="inspireModal = true" size="large">Create New Lyrics</el-button>
            <el-button class="mt-2" @click="gotoMusic" type="primary" size="large">Add Music</el-button>
            <br>
            <br>
        </div>
    </div>
    <el-dialog v-model="inspireModal" :title="modalTitle" width="80%" class="produced-dialog"
        :before-close="handleClose">
        <div v-if="loading">
            <DuckLoader />
            <div v-if="failed" class="text-orange ma-4 text-center">
                <p>Something went wrong :-( we may be too busy, if trying again doesn't work give us about 1 minute.</p>
                <el-button type="info" @click="aiGenAll">Try again</el-button>
            </div>
            <el-progress v-if="!failed" class="mt-2" :percentage="progress" :stroke-width="10" striped />
        </div>
        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-2 mt-0 pt-0">

            <p>What style of song do you want </p>
            <el-select placeholder="Lyrics" v-model="selectedGenre">
                <el-option v-for="item in genres" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
            <p>What do you want the song to be about?<br>
                <small>(If you leave blank I'll think of something)</small>
            </p>
            <el-input v-model="songDescription"></el-input><br>

        </div>
        <div v-if="!loading" class="mx-auto text-center">
            <el-button type="info" @click="aiGenAll" size="large">Create me a song</el-button>
        </div>
        <br>
    </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, defineEmits, watch } from 'vue';
import { useSongs } from '@/composables/useSongs';
import DuckLoader from '@/components/DuckLoader.vue';
const { updateSongField, createLyrics } = useSongs();
import { genres } from '@/utils/musicGenres';


interface SongData {
    id: string;
    lyrics: string;
    title: string;
    music: string;
    createdAt: string;
    updatedAt: string;
}

const props = defineProps<{
    lyricsText: string;
    title: string;
    songData: SongData;
    hideButtons: boolean;
}>();

const emit = defineEmits(['update:lyricsText']);
const loading = ref(false)
const isEditing = ref(false);
const wordLimit = 1000;
const editableLyricsText = ref(props.lyricsText);
const editableSongText = ref(props.title);
const failed = ref(false)
const task = ref()
const inspireModal = ref(true)
const modalTitle = ref("Let's work on some new lyrics")
const songDescription = ref()
const songTitle = ref()
const gotLyrics = ref()
const selectedGenre = ref()
const progress = ref(0)
const intervalId = ref()

const handleClose = () => {
    inspireModal.value = false;

}


const saveSong = async (): Promise<void> => {
    console.log('saveSong', props.songData)
    console.log(props.songData.id, 'lyrics', editableLyricsText.value)
    await updateSongField(props.songData.id, 'lyrics', editableLyricsText.value)
    await updateSongField(props.songData.id, 'title', editableSongText.value)
    if (!props.songData.title) {
        await updateSongField(props.songData.id, 'title', props.title)
    }
    loading.value = false
    emit('update:lyricsText', editableLyricsText.value);
}

const aiGenAll = async () => {
    modalTitle.value = "On moment working on some new lyrics..."
    failed.value = false;
    loading.value = true;
    startProgress()
    inspireModal.value = true;
    let description = `Write Lyrics for a song`;
    if (songDescription.value && selectedGenre.value) {
        description = `Write lyrics for a ${selectedGenre.value} song about ${songDescription.value}`;
    } else if (songTitle.value && selectedGenre.value) {
        description = `Write lyrics for a ${selectedGenre.value} song titled "${songTitle.value}"`;
    } else if (selectedGenre.value) {
        description = `Write lyrics for a ${selectedGenre.value} style song`;
    } else if (songDescription.value) {
        description = `Write lyrics for a song about ${songDescription.value}`;
    } else if (songTitle.value) {
        description = `Write lyrics for a song titled "${songTitle.value}"`;
    }

    console.log('Creating lyrics:', description);
    await createLyrics(description + ". This song should be a maximum of 100 words").then(async (data) => {
        console.log('Lyrics created', data);
        console.log('song title', data?.name)
        if (data?.name) {
            editableSongText.value = data.name
        }


        editableLyricsText.value = data?.lyrics
        console.log('lyrics', editableLyricsText?.value)

        inspireModal.value = false;
        if (editableLyricsText?.value) {
            inspireModal.value = false;
            gotLyrics.value = true;
            if (editableLyricsText.value?.length > 0) {
                // Limit to max of 1000 characters
                editableLyricsText.value = editableLyricsText.value.substring(0, 1000);
                console.log('success');
                inspireModal.value = false;
                failed.value = false;
            } else {
                console.log('failed');
                failed.value = true;
                loading.value = false
                inspireModal.value = true;
            }
            console.log('Saving song', songTitle.value);
            editableSongText.value = data.name
            failed.value = false;

            saveSong();
        } else {
            console.log('failed');
            progress.value = 0
            loading.value = true;
            failed.value = true;
            inspireModal.value = true;
        }
    });
}

const startProgress = () => {
    progress.value = 0;
    const duration = 30000; // 40 seconds
    const increment = 100 / (duration / 1000); // Increment per second

    intervalId.value = setInterval(() => {
        if (progress.value > 100) {
            progress.value = 100
        }
        if (progress.value < 100) {
            progress.value += parseFloat(increment.toFixed(0))
        } else {
            clearInterval(intervalId.value);
        }
    }, 1000);
};


const toggleEdit = () => {
    const words = props.lyricsText.trim().split(/\s+/).length;
    if (words > 200) {
        // Split text into words and take first 200
        const limitedWords = props.lyricsText.trim().split(/\s+/).slice(0, 200);
        editableLyricsText.value = limitedWords.join(' ');
    } else {
        // Emit the updated lyrics to the parent component
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