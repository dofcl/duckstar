<template>
    <div class="min-h-screen bg-gray-100 p-4">
      <!-- Main Container -->
      <div class="max-w-md mx-auto  rounded-lg shadow-lg">
        <!-- Countdown Section -->
        <div class="p-4 text-center">
          <h2 class="text-2xl font-bold mb-4">{{ isRecording ? 'Recording' : 'Ready to Record' }}</h2>
          <div v-if="showCountdown" class="text-6xl font-bold text-blue-600">
            {{ countdownValue }}
          </div>
          <button 
            @click="startRecording" 
            :disabled="isRecording"
            class="mt-4 px-6 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 disabled:bg-gray-400"
          >
            {{ isRecording ? 'Recording...' : 'Start Recording' }}
          </button>
          <button 
            v-if="isRecording" 
            @click="stopRecording"
            class="mt-4 ml-2 px-6 py-2 bg-gray-500 text-white rounded-full hover:bg-gray-600"
          >
            Stop
          </button>
        </div>
  
        <!-- Lyrics Display Section -->
        <div class="p-4 border-t">
          <h3 class="text-xl font-semibold mb-2">Lyrics</h3>
          <div class="h-64 overflow-y-auto p-4 bg-gray-50 rounded">
            <div 
              v-for="(line, index) in lyrics" 
              :key="index"
              :class="{'font-bold text-blue-600': currentLineIndex === index}"
              class="mb-2"
            >
              {{ line }}
            </div>
          </div>
        </div>
  
        <!-- Recording Controls -->
        <div class="p-4 border-t">
          <div v-if="recordedAudio" class="mt-4">
            <audio :src="recordedAudio" controls class="w-full"></audio>
            <button 
              @click="downloadRecording"
              class="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Download Recording
            </button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        isRecording: false,
        showCountdown: false,
        countdownValue: 3,
        mediaRecorder: null,
        audioChunks: [],
        recordedAudio: null,
        lyrics: [
          "Enter your lyrics here",
          "Line by line",
          "They will be displayed",
          "While recording"
        ],
        currentLineIndex: 0
      }
    },
    methods: {
      async startRecording() {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          this.mediaRecorder = new MediaRecorder(stream);
          this.audioChunks = [];
  
          this.mediaRecorder.ondataavailable = (event) => {
            this.audioChunks.push(event.data);
          };
  
          this.mediaRecorder.onstop = () => {
            const audioBlob = new Blob(this.audioChunks, { type: 'audio/mp3' });
            this.recordedAudio = URL.createObjectURL(audioBlob);
          };
  
          // Start countdown
          this.showCountdown = true;
          this.countdownValue = 3;
          
          const countdownInterval = setInterval(() => {
            this.countdownValue--;
            if (this.countdownValue === 0) {
              clearInterval(countdownInterval);
              this.showCountdown = false;
              this.isRecording = true;
              this.mediaRecorder.start();
              this.startLyricsProgress();
            }
          }, 1000);
        } catch (error) {
          console.error('Error accessing microphone:', error);
          alert('Unable to access microphone. Please check permissions.');
        }
      },
  
      stopRecording() {
        if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
          this.mediaRecorder.stop();
          this.isRecording = false;
          this.currentLineIndex = 0;
        }
      },
  
      startLyricsProgress() {
        // Move through lyrics every 3 seconds
        const lyricsInterval = setInterval(() => {
          if (!this.isRecording) {
            clearInterval(lyricsInterval);
            return;
          }
          this.currentLineIndex = (this.currentLineIndex + 1) % this.lyrics.length;
        }, 3000);
      },
  
      downloadRecording() {
        if (this.recordedAudio) {
          const a = document.createElement('a');
          a.href = this.recordedAudio;
          a.download = 'recording.mp3';
          a.click();
        }
      }
    }
  }
  </script>