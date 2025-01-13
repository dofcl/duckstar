<script setup lang="ts">
import { ref } from "vue"
import BeatDetector from '@/components/BeatDetector.vue'

const audioUrl = ref('https://producer.duckstar.app/model-a2/ODQzODk0ZmEtZmI2NS00OWU0LWFkNGItYTU0MzdmN2U4ODlk.mp3')
</script>

<template>
  <BeatDetector :audioURL="audioUrl" />
</template>
