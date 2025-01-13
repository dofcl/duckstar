<template>
    <div class="p-4 max-w-md mx-auto rounded-lg shadow-md">
        <h2 class="text-2xl font-bold mb-4">BPM Detector</h2>

        <!-- Loading state -->
        <div v-if="loading" class="flex items-center justify-center space-x-2 mb-4">
            <div class="animate-spin h-5 w-5 border-2 rounded-full border-t-transparent"></div>
            <span class="text-gray-600">Analyzing audio...</span>
        </div>

        <!-- Error state -->
        <div v-if="error" class="bg-red-50 text-red-600 p-3 rounded-md mb-4">
            Error: {{ error }}
        </div>

        <!-- Result -->
        <div v-if="bpm" class="text-center">
        
            <div class="text-white">
                Beats Per Minute= {{ bpm }}
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { guess } from 'web-audio-beat-detector'

const props = defineProps({
  audioURL: {
    type: String,
    required: true
  }
})

const bpm = ref(null)
const error = ref(null)
const loading = ref(true)
const audioUrl = props.audioURL

const detectBPM = async () => {
  try {
    loading.value = true
    error.value = null
    
    // Create AudioContext
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    
    // Fetch the audio file
    const response = await fetch(audioUrl)
    const arrayBuffer = await response.arrayBuffer()
    
    // Decode the audio data
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
    
    // Detect BPM
    const tempo = await guess(audioBuffer)
    console.log('Detected tempo:', tempo)
    bpm.value = tempo.bpm
    console.log(bpm.value)
    
    // Cleanup
    audioContext.close()
  } catch (err) {
    console.error('Error detecting BPM:', err)
    error.value = err.message
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  detectBPM()
})
</script>
