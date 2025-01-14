<template>
    <div>
        <h1 class="mb-0 pb-0">Create Song</h1>
        <div class="mx-auto max-w-md mt-0 pt-0">

            <p class="ma-1 pa-0">What do yo want your song to be about?</p>
            <el-input v-model="songDescription" size="large"></el-input>
            <div class="text-center mx-auto mt-4">
                <el-button type="info" @click="openInspire" size="large">Get Inspiration</el-button>
            </div>

            <p class="mt-1 pa-0">Song Title</p>
            <el-input v-model="songTitle" placeholder="Name your song" size="large" class="mt-0 pt-0" @input="missing=false" />
            <p class="mb-2 pa-0 mt-4">Song Style</p>
            <MusicGenre :userId="userId" :saveInComponent="false" @genres-selected="handleGenre" :musicGenre="genre" />

            <div class="mx-auto text-center mt-4">
                <div v-if="missing" class="text-orange mb-4 mt-0 pt-0">Please provide a song title and song style</div>
                <el-button type="primary" @click="goToCreateLyrics" size="large">
                    Create Lyrics
                </el-button>
                <p class="ma-1 pa-0 mt-2">or</p>
                <el-button type="" @click="goToCreateMusic" size="large" link>Create music first</el-button>
            </div>
        </div>
    </div>


    <el-dialog v-model="inspireModal" :title="modalTitle" width="80%" class="produced-dialog"
        :before-close="handleClose">
        <div v-if="loading">
            <DuckLoader />
            <div v-if="failed" class="text-orange ma-4 text-center">
                <p>Something went wrong :-( Let's try again.</p>
                <el-button type="info" @click="aiGenAll">Try again</el-button>
            </div>
            <el-progress class="mt-2" :percentage="progress" :stroke-width="10" striped />
        </div>
        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-2 mt-0 pt-0">
            <video id="producer-vid2" class="video-producer mx-auto mt-0 pt-0"
                poster="https://duckstar-public.s3.eu-central-1.amazonaws.com/images/producers/tom/tom-256.png"
                src="https://duckstar-public.s3.eu-central-1.amazonaws.com/videos/producers/tom/create-song/tom-create-v1.mp4"
                autoplay @click="playProducer" playsinline></video>
            <div v-if="!collab" class="mx-auto text-left mt-0 pt-0">
                <p class="mt-0 pt-0 text-center">Got writers block or need some inspiration?<br> Don't worry I've got
                    your back.</p>



                <div class="mx-auto text-center">
                    <el-button type="info" @click="collab = true">Let's collab</el-button>
                </div>
                <div class="mx-auto text-center ma-3">
                    or
                </div>
                <div class="mx-auto text-center">
                    <el-button type="info" @click="aiGenAll">Create me a random song</el-button>
                </div>
            </div>
            <div v-if="collab">
                <p>What style of song do you want?</p>
                <el-select placeholder="Lyrics" v-model="selectedGenre">
                    <el-option v-for="item in genres" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
                <p>What do you want the song to be about?<br>
                    <small>(If you leave blank I'll think of something)</small>
                </p>
                <el-input v-model="songDescription"></el-input>
                <div class="mx-auto text-center ma-4">
                    <el-checkbox-group v-model="checkList">
                        <el-checkbox label="Write the Lyrics" value="lyricsTrue" />
                        <el-checkbox label="Make the music" value="musicTrue" />
                    </el-checkbox-group>
                </div>
                <div v-if="checkList.length > 0" class="mx-auto text-center ma-4">
                    <el-button type="info" @click="aiGenAll" size="large">Create me a song</el-button>
                </div>
                <div v-else class="text-center text-orange">Choose Lyrics, Music or Both</div>
            </div>
        </div>
        <br>
    </el-dialog>

</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue';
import MusicGenre from '@/components/MusicGenre.vue';
import { getCurrentUser } from 'aws-amplify/auth';
import { useRouter } from 'vue-router';
import DuckLoader from '@/components/DuckLoader.vue';
import { fadeOutAndStop } from '@/utils/fadeout';
import { useSongs } from '@/composables/useSongs';

const { createSong } = useSongs();
const selectedGenre = ref();
const genres = [
    {
        value: 'pop',
        label: 'Pop',
    },
    {
        value: 'rock',
        label: 'Rock',
    },
    {
        value: 'punk',
        label: 'Punk',
    },
    {
        value: 'hiphop',
        label: 'Hip Hop',
    },
    {
        value: 'rap',
        label: 'Rap',
    }
]

const loading = ref(false);
const { createLyrics } = useSongs();
const router = useRouter();
const songTitle = ref('');
const checkList = ref(['musicTrue', 'lyricsTrue']);
const songDescription = ref();
const userId = ref('');
const genre = ref<string>('');
const inspireModal = ref(false);
const modalTitle = ref("I'll help you get started");
const gotLyrics = ref(false);
const lyrics = ref()
const failed = ref(false)
const songId = ref('')
const songData = ref({})

const collab = ref(false)
const task = ref('lyrics')
const missing = ref(false)

const Close = () => {
    collab.value = false;
    inspireModal.value = false;
}
const saveSongdraft = async () => {
    // Using the initialData parameter to set additional song properties
    const newSong = await createSong(userId.value, {
        title: songTitle.value || '',
        genre: genre.value || '',
        description: songDescription.value || '',
        lyrics: lyrics.value || '',
    });

    console.log('Saving song draft', newSong);
    if (newSong) {
        songId.value = newSong.id;
        songData.value = newSong;
    } else {
        console.error('Failed to create song draft');
    }
}

const playProducer = () => {
    const producerVid = document.getElementById('producer-vid2') as HTMLVideoElement;
    producerVid.play();
}

const openInspire = () => {
    inspireModal.value = true;
}

const handleClose = () => {
    inspireModal.value = false;
    collab.value = false;
}

const aiGenAll = async () => {
    failed.value = false;
    if (checkList.value.includes('lyricTrue')) {
        task.value = "lyrics"

    } else {
        task.value = "lyrics"
    }
    modalTitle.value = `BRB, in the studio creating ${task.value}...`;
    loading.value = true;
    startProgress()
    inspireModal.value = true;
    console.log('Generating AI music');
    if (!genre.value) {
        let genresChoice = ["pop", "rock", "punk", "hiphop", "rap"]
        genre.value = genresChoice[Math.floor(Math.random() * genresChoice.length)];
    }
    let description = `Write Lyrics for a ${genre.value} song`;


    console.log('if we have user name and bio create song about them')

    if (songDescription.value) {
        description = `Write Lyrics for a ${genre.value} song about ${songDescription.value}`;
    } else if (songTitle.value) {
        description = `Write Lyrics for a ${genre.value} song about ${songTitle.value}`;
    }


    console.log('Creating lyrics:', description);
    await createLyrics(description + ". This song should be a maximum of 100 words").then(async (data) => {
        console.log('Lyrics created', data);
        if (!songTitle.value) {
            songTitle.value = data?.name ?? ''
        }
        console.log('song title', songTitle)

        modalTitle.value = songTitle.value
        lyrics.value = data?.lyrics
        console.log('lyrics', lyrics?.value)

        inspireModal.value = false;
        if (lyrics?.value) {
            inspireModal.value = false;
            gotLyrics.value = true;
            if (lyrics?.value.length > 0) {
                // Limit to max of 1000 characters
                lyrics.value = lyrics.value.substring(0, 1000);
                console.log('success');
                inspireModal.value = false;
                failed.value = false;
            } else {
                console.log('failed');
                failed.value = true;
                inspireModal.value = true;
            }
            console.log('Saving song draft', songTitle.value);
            await saveSongdraft();
            router.push('/edit-lyrics?songId=' + songId.value);


            failed.value = false;
        } else {
            console.log('failed');
            loading.value = true;
            failed.value = true;
            inspireModal.value = true;
        }
    });
}

const progress = ref(10);
let intervalId: ReturnType<typeof setInterval>;

const startProgress = () => {
    progress.value = 0;
    const duration = 30000; // 40 seconds
    const increment = 100 / (duration / 1000); // Increment per second

    intervalId = setInterval(() => {
        if (progress.value > 100) {
            progress.value = 100
        }
        if (progress.value < 100) {
            progress.value += parseFloat(increment.toFixed(0))
        } else {
            clearInterval(intervalId);
        }
    }, 1000);
};


function checkForm() {
    if (!selectedGenre.value) {
        return true
    }

    if (!songTitle.value?.trim() && !songDescription.value?.trim()) {
        return true
    }

    return false
}

const goToCreateMusic = async () => {
    loading.value = true;
    missing.value = await checkForm()
    console.log('Creating song', songTitle.value);
    if (!missing.value) {
        await saveSongdraft();
        router.push('/create-music?songId=' + songId.value);
    }

}
const goToCreateLyrics = async () => {
    loading.value = true;
    missing.value = await checkForm()
    console.log('Creating song', songTitle.value, selectedGenre.value);
    
    if (!missing.value) {
        aiGenAll();
    }

}

const handleGenre = async (genres: string) => {
    genre.value = genres[0];
    console.log('Selected genres', genres[0]);
    selectedGenre.value = genres[0];

}

onMounted(async () => {
    await fadeOutAndStop(2000)
    getCurrentUser().then((user) => {
        userId.value = user.userId;
    });
});
</script>
