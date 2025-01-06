<template>
    <div>
        <h1 class="text-white ma-0 pa-0">Choose your persona</h1>
        <p class="text-white mx-auto text-center mt-0 mt-0 ">How do you want to look?</p>
        <Personas />
        

    </div>
</template>

<script setup lang="ts">
import Personas from '@/components/Personas.vue';
import { onMounted } from 'vue';
const bgAudio = document.getElementById('bg-audio')

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