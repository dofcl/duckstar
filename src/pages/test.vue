<template>
  <div>
    <karaoke-player @recording-complete="handleRecording" />
  </div>
</template>

<script>
import KaraokePlayer from '@/components/KaraokePlayer.vue'

export default {
  components: {
    KaraokePlayer
  },
  methods: {
    handleRecording(audioUrl) {
      // Handle the recorded audio
      console.log('Recording completed:', audioUrl)
    }
  }
}
</script>