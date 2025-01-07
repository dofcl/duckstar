<template>
    <h1 class="text-white text-center mx-auto ma-0 pa-0">Lip Sync Battle</h1>
    <div class="container mx-auto p-4">
        <div class="grid grid-cols-2 gap-4">
            <div class="video-container">
                <video id="preview-video" class="preview-video" :src="videoUrl" type="video/mp4"></video>
            </div>
            <div class="video-container">
                <video id="preview-video-dubbed" class="preview-video" :src="videoUrlDubbed" type="video/mp4"></video>
            </div>
        </div>
    </div>
    <div class="video-controls mx-auto  text-center ma-5 mb-6">
        <el-button @click="play" type="primary" size="large" class="button">
            <el-icon class="large-icon">
                <VideoPlay v-if="!playing" />
                <VideoPause v-else />
            </el-icon>
        </el-button>
    </div>
    <div class="mx-auto text-center text-white">
        <p>
            <i>
                Step into the spotlight, feel the groove,
                Where ducks and stars make the ultimate move.
                From indie vibes to rock 'n' roll,
                Duckstar’s the place to find your soul.
            </i>
        </p>
        <p>
            <i>
                Duckstar, where the fun begins,
                A marketplace of legends, where everyone wins.
                Shine like a star, wherever you are,
                There’s nothing like the magic of Duckstar.
            </i>
        </p>
    </div>
</template>
<script setup lang="ts">
import { VideoPause, VideoPlay } from '@element-plus/icons-vue';
import { onMounted, ref } from 'vue';
let bgAudio: HTMLAudioElement | null = null;
const videoUrl = new URL('/videos/demo1.mp4', import.meta.url).href;
const videoUrlDubbed = new URL('/videos/dan-dub.mp4', import.meta.url).href;
const playing = ref(false);


function play() {
    const previewVideo = document.getElementById('preview-video') as HTMLVideoElement;
    const previewVideoDubbed = document.getElementById('preview-video-dubbed') as HTMLVideoElement;
    if (previewVideo) {
        if (previewVideo.paused) {
            previewVideo.play();
            playing.value = true;
            previewVideoDubbed.play();
        } else {
            previewVideo.pause();
            previewVideoDubbed.pause();
            playing.value = false;
        }
    }
    previewVideo.addEventListener('ended', () => {
        playing.value = false;
    });
}


const initAudio = () => {
    if (bgAudio) {
        bgAudio.volume = 0.6; // Set initial volume
        bgAudio.play();
    }
}

const fadeOutAndStop = (duration: number = 1000): Promise<void> => {
    return new Promise((resolve) => {
        if (!bgAudio) {
            resolve();
            return;
        }

        const startVolume = bgAudio.volume;
        const steps = 20; // Number of steps in the fade
        const volumeStep = startVolume / steps;
        const intervalTime = duration / steps;

        const fadeInterval = setInterval(() => {
            if (bgAudio) {
                if (bgAudio.volume > volumeStep) {
                    bgAudio.volume -= volumeStep;
                } else {
                    bgAudio.volume = 0;
                    bgAudio.pause();
                    clearInterval(fadeInterval);
                    resolve();
                }
            }
        }, intervalTime);
    });
}

// Usage example:
const handleTransition = async () => {
    await fadeOutAndStop(2000); // Fade out over 2 seconds
}

onMounted(() => {
    console.log('Onboard page mounted');
    bgAudio = document.getElementById('bg-audio') as HTMLAudioElement;
    initAudio();
    handleTransition();
});

</script>
<style>
.video-container {
    position: relative;
    width: 100%;
    aspect-ratio: 1 / 1;
    /* Square aspect ratio */
    overflow: hidden;
}

.preview-video {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
}
</style>