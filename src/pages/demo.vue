<template>
    <h1>Demo</h1>
    <div class="relative w-full aspect-video demo1 rd">
        <video id="duckVideo" class="absolute inset-0 w-full h-full object-cover rd" controls>
            <source src="https://d121xaocrccxju.cloudfront.net/demo/duckstar_demo.mp4" type="video/mp4">
        </video>
        <!-- Play Button Overlay -->
        <el-button class="absolute inset-0 m-auto w-16 h-16 flex items-center justify-center
               bg-black/50 hover:bg-black/70 rounded-full transition-all duration-300
               group-hover:scale-110 focus:outline-none" @click="togglePlay" type="button">
            <div class="i-carbon-play-filled text-white text-3xl"></div>
        </el-button>
    </div>
    <div class="text-center mx-auto mt-12">
        <h1 class="ma-0 pa-0">DuckChain Theme Song</h1>
        <small class="ma-0 pa-0">Created with DuckStar</small>
        <div class="ma-0 pa-0 dc-theme pt-4">
            <video id="duckTheme" class="ma-0 pa-0 dc-theme" @play="onPlay" @pause="onPause" poster="/images/duckstar-into-small.jpg">
                <source src="https://d121xaocrccxju.cloudfront.net/demo/duckchain-theme.mp4" type="video/mp4">
            </video>
        </div>
        <el-button @click="togglePlay" size="large" type="primary" class="mt-2"><el-icon v-if="isPlaying"><VideoPause/></el-icon><el-icon v-else><VideoPlay/></el-icon></el-button>
    </div>
</template>

<script>
export default {
    data() {
        return {
            isPlaying: false
        };
    },
    methods: {
        togglePlay() {
            const video = document.getElementById('duckVideo');
            const videoTheme = document.getElementById('duckTheme');
            video.pause()
            if (videoTheme.paused) {
                videoTheme.play();
            } else {
                videoTheme.pause();
            }
        },
        onPlay() {
            this.isPlaying = true
            const videoTheme = document.getElementById('duckTheme');

            videoTheme.classList.add('playing');

        },
        onPause() {
            this.isPlaying =false
            const videoTheme = document.getElementById('duckTheme');

            videoTheme.classList.remove('playing');
        }
    },
}
</script>

<style>
.demo1 {
    max-width: 600px;
    margin: auto;
    border-radius: 5px;
}

.dc-theme video {
    max-width: 200px;
    margin: auto;
    border-radius: 0;
    border: 2px solid #fff;
    border-radius: 10px;
    transition: border-radius 10s ease;
}

.dc-theme.playing {
    border-radius: 100%;
    border: 4px solid var(--el-color-primary);
    box-shadow:  0 0  20px #000;
}
</style>