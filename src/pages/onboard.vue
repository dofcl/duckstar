<template>
    <div>
        <div v-if="stage == 0" class="text-center">
            <h1 class="text-white ma-0 pa-0">Choose your persona</h1>
            <p class="text-white mx-auto text-center mt-0 mt-0 ">How do you want to look?</p>
            <div v-if="!myPersona">
                <Personas @persona-selected="handleSelectedPersona" />
                <p class="text-white mx-auto text-center text-sm">Click to select</p>
            </div>

            <div class="mx-auto text-center">
                <img v-if="myPersona" :src="myPersona" alt="myPersona" class="persona-image rd-full" /><br>
                <el-button v-if="myPersona" @click="change" class="ma-2">Change</el-button>
                <el-button v-if="myPersona" @click="next()" type="primary" class="ma-2">Next</el-button>
            </div>
        </div>
        <div v-else-if="stage == 1" class="text-center">
            <h1 class="text-white ma-0 pa-0">Choose music genre</h1>
            <MusicGenre />
        </div>
    </div>
</template>

<script setup lang="ts">
import MusicGenre from '@/components/MusicGenre.vue';
import Personas from '@/components/Personas.vue';
import { onMounted, ref } from 'vue';
const bgAudio = document.getElementById('bg-audio')
const myPersona = ref(null)
const stage = ref(0)

function handleSelectedPersona(persona) {
    myPersona.value = persona
    console.log('Selected persona:', persona);
}

function change() {
    myPersona.value = null

}
function next() {
    stage.value += 1
    console.log("trigger welcome TTS")

}

onMounted(() => {
    console.log('Onboard page mounted');

    // Check if audio is not playing
    if (bgAudio && bgAudio.paused) {
        bgAudio.play()
            .catch(error => {
                console.error('Error playing audio:', error);
                // Handle the error appropriately
            });
    }
});

</script>
<style>
.persona-image {
    width: 150px;
    height: 150px;
    border-radius: 100%;
    margin: 0 auto;
    aspect-ratio: 1/1;
    border: 4px solid var(--el-color-primary) !important;
    border-radius: 100%;
    box-shadow: 0 0 10px #000;
}
</style>