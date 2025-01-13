<template>
  <div class="min-h-screen p-4">
    <div class="max-w-md mx-auto rounded-lg shadow-lg">
      <DuckLoader v-if="loading" />
      <template v-else>
        <!-- Lyrics Display Section -->
        <LyricsEditPlay :title="songTitle" :lyricsText="lyrics" :songData="songData" @update:lyricsText="updateLyrics"
          :hideButtons="true" style="max-height: 65vh; overflow-y: auto;" />
        <hr>
        <!-- Countdown Section -->
        <div class="p-0 m-0 mt-1 text-center">
          <p class="text-lg font-bold m-0 p-0">{{ isRecording ? 'Recording' : 'Ready to Record' }}</p>
          <div v-if="showCountdown" class="text-6xl font-bold text-blue-600">
            {{ countdownValue }}
          </div>
          <button @click="startRecording" :disabled="isRecording"
            class="mt-2 px-6 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 disabled:bg-gray-400">
            {{ isRecording ? 'Recording...' : 'Start Recording' }}
          </button>
          <button v-if="isRecording" @click="stopRecording"
            class="mt-4 ml-2 px-6 py-2 bg-gray-500 text-white rounded-full hover:bg-gray-600">
            Stop
          </button>
        </div>

        <!-- Recording Controls -->
        <div class="p-1 border-t">
          <div v-if="recordedAudio" class="mt-4">
            <audio :src="recordedAudio" controls class="w-full"></audio>
            <button @click="downloadRecording"
              class="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
              Download Recording
            </button>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useSongs } from '@/composables/useSongs';
import LyricsEditPlay from '@/components/LyricsEditPlay.vue';
import DuckLoader from '@/components/DuckLoader.vue';
import { useRoute } from 'vue-router';
import { fadeOutAndStop } from '@/utils/fadeout';

// Route and song data
const route = useRoute();
const { getSong } = useSongs();
const songTitle = ref('');
const lyrics = ref('');
const songData = ref({});
const loading = ref(true);

// Recording state
const isRecording = ref(false);
const showCountdown = ref(false);
const countdownValue = ref(3);
const mediaRecorder = ref<MediaRecorder | null>(null);
const audioChunks = ref<Blob[]>([]);
const recordedAudio = ref<string | null>(null);
const currentLineIndex = ref(0);

const updateLyrics = (newLyrics: string) => {
  lyrics.value = newLyrics;
};

const startRecording = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder.value = new MediaRecorder(stream);
    audioChunks.value = [];

    mediaRecorder.value.ondataavailable = (event) => {
      audioChunks.value.push(event.data);
    };

    mediaRecorder.value.onstop = () => {
      const audioBlob = new Blob(audioChunks.value, { type: 'audio/mp3' });
      recordedAudio.value = URL.createObjectURL(audioBlob);
    };

    // Start countdown
    showCountdown.value = true;
    countdownValue.value = 3;

    const countdownInterval = setInterval(() => {
      countdownValue.value--;
      if (countdownValue.value === 0) {
        clearInterval(countdownInterval);
        showCountdown.value = false;
        isRecording.value = true;
        mediaRecorder.value?.start();
        startLyricsProgress();
      }
    }, 1000);
  } catch (error) {
    console.error('Error accessing microphone:', error);
    alert('Unable to access microphone. Please check permissions.');
  }
};

const stopRecording = () => {
  if (mediaRecorder.value && mediaRecorder.value.state !== 'inactive') {
    mediaRecorder.value.stop();
    isRecording.value = false;
    currentLineIndex.value = 0;

    // Stop all tracks in the stream
    if (mediaRecorder.value.stream) {
      mediaRecorder.value.stream.getTracks().forEach(track => track.stop());
    }
  }
};

const startLyricsProgress = () => {
  // Move through lyrics every 3 seconds
  const lyricsInterval = setInterval(() => {
    if (!isRecording.value) {
      clearInterval(lyricsInterval);
      return;
    }
    if (lyrics.value) {
      currentLineIndex.value = (currentLineIndex.value + 1) % lyrics.value.split('\n').length;
    }
  }, 3000);
};

const downloadRecording = () => {
  if (recordedAudio.value) {
    const a = document.createElement('a');
    a.href = recordedAudio.value;
    a.download = `${songTitle.value || 'recording'}.mp3`;
    a.click();
  }
};

onMounted(async () => {
  await fadeOutAndStop(2000);
  const songId = Array.isArray(route.query.songId)
    ? route.query.songId[0]
    : route.query.songId || '';

  console.log('songId', songId);
  await getSong(songId).then((resp) => {
    if (resp) {
      console.log('songData', resp);
      console.log('songData title', resp.title);
      songTitle.value = resp.title || "";
      songData.value = resp;
      lyrics.value = resp.lyrics || "";
    } else {
      console.error('Failed to fetch song data');
    }
    loading.value = false;
  });
});
</script>
<style>
hr {

  border: 0.11px solid #444;
}
</style>
