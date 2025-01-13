<template>
    <div v-if="loading">
        <DuckLoader />
        <h4 class="text-center">Warming up the music machine...</h4>
    </div>
    <div v-else>
        <h1 class="pa-0 ma-0 mt-2 text-white">Music Machine</h1>
        <div id="instructions" class="ma-0 pa-0">

            <p class="text-white text-sm text-center mt-0 pt-0">Drag the records
                onto the record player.<br>
                <img src="@/assets/images/arrow-drop.png" class="arrow-drop mx-auto text-center" />
            </p>
        </div>


        <div class="dj-app px-2 mt-0 mt-0">
            <div v-for="group in groups" :key="group.id" class="instrument-group my-2">

                <div class="flex justify-center mt-0 pt-0 mb-0 relative">



                    <input type="range" min="0" max="120" step="10" @change="(e) => setVolume(group.id, e.target.value)"
                        class="volume-slider-horizontal mt-2" />


                    <span class="text-white slider-title coiny">{{ group.label }}<span vif="group.currentDiscId">:
                            v{{ group.currentDiscId?.slice(2) }}</span></span>

                    <el-button v-if="groups.length > 1" @click="removeInstrument(group.id)"
                        class="remove-instrument-btn" size="small" circle>
                        <el-icon>
                            <Delete />
                        </el-icon>
                    </el-button>
                </div>
                <div class="grid grid-cols-3  items-center mt-0 pt-0 mt-5 pt-4">
                    <!-- Record Player (Drop Zone) -->
                    <div :class="['record-player', `group-${group.id}`, { 'spinning': group.isSpinning }]"
                        @dragover.prevent @drop.prevent="(e) => handleDrop(e, group)">
                        <div :class="`color-indicator group-${group.id}-color`"><img class="center-duck"
                                src="@/assets/images/records/little-duck.png" /></div>

                    </div>

                    <!-- Draggable Discs -->
                    <div class="flex gap-2 disc-wrapper">

                        <!-- Update the draggable discs section -->
                        <div v-for="disc in getGroupDiscs(group.id)" :key="disc.id"
                            :class="['mini-disc', `group-${disc.group}-disc`]" draggable="true"
                            @dragstart="(e) => startDrag(e, disc, `group-${disc.group}-disc`)"
                            @touchstart.prevent="(e) => startDrag(e, disc, `group-${disc.group}-disc`)"
                            @touchmove.prevent="handleTouchMove" @touchend.prevent="(e) => handleDrop(e, group)"
                            v-show="!disc.hidden">
                            <div class="flex items-center justify-center h-full">
                                <span class="text-white text-center disc-version">{{ disc.index + 1 }}</span>
                            </div>

                        </div>
                    </div>


                </div>

            </div>

            <div class="text-center mt-4 relative">
                <p class="text-white sync-load blink hide-sync">Syncronizing...</p>
                <el-button v-if="!isPlaying" @click="syncAllAudio" type="info" size="large"><el-icon>
                        <VideoPlay />
                    </el-icon></el-button>
                <el-button v-else @click="pausePlay" type="info" size="large" class="play-all-button">
                    <el-icon>
                        <VideoPause />
                    </el-icon>
                </el-button>

            </div>
            <hr>
            <!-- Controls -->
            <div class="grid grid-cols-2 gap-2">
                <div class="text-white text-center ma-0 pa-0 mt-4">Add instrument:</div>
                <div class="controls ma-0 pa-0">

                    <el-select v-if="enableChangeMix" v-model="currentMix" @change="changeMix" placeholder="Select Mix"
                        class="mt-0 pt-0">
                        <el-option label="Mix 1" value="mix1"></el-option>
                        <el-option label="Mix 2" value="mix2"></el-option>
                    </el-select>

                    <div class="instrument-selector  mb-2 mt-2 pt-0">

                        <el-select v-model="currentInstrument" size="large" class="w-full instrument-selecta"
                            @change="addInstrument">
                            <el-option v-for="inst in availableInstruments" :key="inst.id" :label="inst.label"
                                :value="inst.id"></el-option>
                        </el-select>

                    </div>
                    <br>
                </div>
            </div>
        </div>

        <hr>
        <div class="action-buttons mx-auto text-center mt-0 pt-0">

            <p class="text-white text-center ma-0 pa-0 ma-0 pa-0 mb-1"
                v-if="instrumentsSelected < 3 && !hasFinishedTasks">
                Add at least {{ 3 - instrumentsSelected }} layers to sent to producer<br>
            </p>
            <el-button v-if="!produced" @click="openProducerDialog" size="large" class="mt-2"
                :type="instrumentsSelected < 3 && !hasFinishedTasks ? 'default' : 'primary'"
                :disabled="instrumentsSelected < 3 && !hasFinishedTasks">
                <span v-if="hasFinishedTasks">
                    Producer's Tracks
                </span>
                <span v-else>
                    Send to Producer
                </span>
            </el-button>

            <div v-if="produced">
                <p class="text-white mb-0 pb-2">Producer's effects:</p>
                <span class="text-white mr-5 mt-0 pt-0">Style:</span> <el-select placeholder="Lyrics" v-model="lyrics"
                    @change="changeLyrics" class="change-lyrics" size="large">
                    <el-option v-for="item in lyricStyles" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
                <div class="grid grid-cols-2 gap-4 mt-4">
                    <div>
                        <el-button @click="toggleBackingVocals"
                            :class="['backing-vocal-button', { 'active': backingVocalEnabled }]"
                            :disabled="instrumentsSelected < 3" size="large">
                            {{ backingVocalEnabled ? 'Remove' : 'Add' }} Vocals
                        </el-button>

                        <el-slider v-model="trackVolumes.vocals" @input="setVocalVolume" :min="0" :max="200" />
                    </div>
                    <div>
                        <el-button @click="toggleMainBackingTrack"
                            :class="['main-backing-track-button', { 'active': mainBackingTrackEnabled }]"
                            :disabled="instrumentsSelected < 3" size="large">
                            {{ mainBackingTrackEnabled ? 'Remove' : 'Add' }} Effects
                        </el-button>
                        <el-slider v-model="trackVolumes.master" @input="setMasterVolume" :min="0" :max="200" />
                    </div>
                </div>
            </div>

        </div>

        <hr class="mt-4">
        <div class="recording-controls mx-auto pt-4 text-center">
            <el-button @click="editLyrics" size="large">Edit Lyrics</el-button>
            <el-button @click="recordLyrics" size="large" type="info">Sing</el-button>
            <el-button @click="isRecording ? stopRecording() : startRecording()"
                :class="['record-button', { 'recording': isRecording }]" size="large"
                :type="isRecording ? 'danger' : 'primary'">
                {{ isRecording ? 'Stop Recording' : 'Record' }}
            </el-button>
        </div>
    </div>
    <br>
    <br>
    <el-dialog title="Producer" v-model="showProducerDialog" width="80%" class="produced-dialog"
        :before-close="handleCloseProducer">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-2 mt-0 pt-0">
            <video v-if="!tasks || tasks.length < 2" id="producer-vid1" class="video-producer mx-auto mt-0 pt-0 "
                :poster="`${publicStatic}/images/producers/tom/tom-256.png`"
                :src="`${publicStatic}/videos/producers/tom/create-song/tom-create-v1.mp4`" autoplay
                @click="playProducer" playsinline></video>
            <div class="mx-auto text-left mt-0 pt-0">

                <p class="ma-0 pa-0" v-if="!tasks || tasks.length < 2">Great start!</p>
                <p class="ma-0 pa-0">I started working on some version for you.</p>
                <p v-if="hasFinishedTasks" class="ma-0 pa-0 mb-3">Let me know if you like any of them?</p>
                <div v-if="hasFinishedTasks" class="track-previews-wrapper mt-4 pt-0">
                    <div v-for="(task, index) in tasks" class="track-previews mx-auto text-center ma-0 pa-0">
                        <div v-if="task?.ref1" class="relative track-preview-single">
                            <audio v-if="task?.ref1" :src="getAudioSrc(task, task.ref1)" controls></audio>
                            <p class="absolute right-2 ma-0 pa-0 "><el-button @click=confirmVersion(task)
                                    type="info">This version</el-button></p>
                            <p class="ma-0 pa-0 text-left">v{{ index + 1 }}-a</p>

                        </div>
                        <div v-if="task?.ref2" class="relative mt-2 track-preview-single">
                            <audio v-if="task.ref2" :src="getAudioSrc(task, task.ref2)" controls
                                class="ma-0 pa-0"></audio>
                            <p class="absolute right-2 ma-0 pa-0 "><el-button @click=confirmVersion(task)
                                    type="info">This version</el-button></p>
                            <p class="ma-0 pa-0 text-left">v{{ index + 1 }}-b</p>


                        </div>

                    </div>
                    <p class="text-center mt-2 pt-0">
                    <div v-if="!tasks || loading">
                        Producing more songs...
                        <DuckLoader />

                    </div>
                    <el-button v-if="!loading" @click="makeMore" link class="mt-4">Make more</el-button>
                    </p>
                </div>
                <div v-else class="text-center mt-2 pt-0">
                    Producing song...
                    <DuckLoader />

                </div>


            </div>
        </div>
        <div class="mx-auto text-center ma-2">
            <hr class="ma-4">
            <span slot="footer" class="dialog-footer mt-8">
                <el-button @click="showProducerDialog = false">Close</el-button>
                <el-button type="primary" @click="handleConfirmProducer">Continue!</el-button>
            </span>
        </div>

    </el-dialog>

</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, onBeforeUnmount } from 'vue'
import { useRouter, useRoute, onBeforeRouteLeave } from 'vue-router'
import { fadeOutAndStop } from '@/utils/fadeout';
import { useSongs } from '@/composables/useSongs';
import { useTasks } from '@/composables/useTasks';
import DuckLoader from '@/components/DuckLoader.vue';
const { getSong } = useSongs();
const { createTask, fetchTasksForSong } = useTasks();
const router = useRouter()
const route = useRoute()
const publicStatic = import.meta.env.VITE_APP_PUBLIC_STATIC
const mainMusicAiGenEndpoint = import.meta.env.VITE_APP_MUSIC_GEN_ENDPOINT
const mainMusicAiGenCallback = import.meta.env.VITE_APP_MUSIC_GEN_CALLBACK

// Audio Context Setup
const audioContext = new (window.AudioContext || window.webkitAudioContext)()


// State Management
const loading = ref(true)
const enableChangeMix = ref(false)
const currentMix = ref('mix1')
const currentInstrument = ref('')
const currentDraggedDisc = ref(null)
const audioSourceMap = ref(new Map()) // Tracks all active audio sources
const activeSources = ref({}) // Track active audio sources
const backingVocalEnabled = ref(false)
const backingVocalSource = ref(null)
const mainBackingTrackEnabled = ref(false)
const mainBackingTrackSource = ref(null)
const mainTrack = 'main-1-pop.mp3'
const instrumentsSelected = ref(1)
const isPlaying = ref(false)
const isDragging = ref(false)
const touchStartPos = ref({ x: 0, y: 0 })
const dragClone = ref(null)
const showProducerDialog = ref(false)
const produced = ref(false)
const songData = ref([])
const tasks = ref([])
const hasFinishedTasks = ref(false)
const lyrics = ref('')
const lyricStyles = ref([
    { label: 'Pop', value: 'pop' },
    { label: 'Pop Rock', value: 'pop-rock' },
    { label: 'Rap', value: 'rap' },
    { label: 'Hip-hop', value: 'hip-hop' }
])
const trackVolumes = ref({
    vocals: 70,
    master: 70
})
const getAudioSrc = (task, ref) => {
    return task.status === 'COMPLETE' ? `https://producer.duckstar.app/model-a2/${ref}.mp3` : `https://producer.duckstar.app/model-a1/${ref}`;
};

const createAiGenMusic = ref(true)
let pollingTimeout = null;

// Configuration
const instrumentConfig = [
    { id: 1, color: '#11b011', audioPrefix: 'Drums', label: 'Drums' },
    { id: 2, color: '#1c0eb7', audioPrefix: 'Bass', label: 'Bass' },
    { id: 3, color: '#9932CC', audioPrefix: 'Piano', label: 'Piano' },
    { id: 4, color: '#b01111', audioPrefix: 'Cello', label: 'Cello' },
    { id: 5, color: '#FFA500', audioPrefix: 'Perc', label: 'Percussion' },
    { id: 6, color: '#FF1493', audioPrefix: 'Top', label: 'Top Hat' },
    { id: 7, color: '#00CED1', audioPrefix: 'Violin', label: 'Violin' },
]

function saveSong() {
    startRecording()
    console.log('save song and tracks')
}

function recordLyrics() {
    saveSong()
    router.push('/record-lyrics?songId=' + songData.value.id)
}

function editLyrics() {
    saveSong()
    router.push('/edit-lyrics?songId=' + songData.value.id)
}
// Utility Functions
function generateInitialDiscs(group) {
    return Array.from({ length: 4 }, (_, i) => ({
        id: `${group.id}-${i + 1}`, // Unique ID combining group and local index
        group: group.id,
        index: i,
        hidden: false,
        audioIndex: i + 1, // Reset to 1-4 for each group
        audioPrefix: group.audioPrefix
    }))
}

// Reactive State
const groups = ref([
    {
        id: 1,
        color: '#11b011',
        audioPrefix: 'Drums',
        label: 'Drums',
        isSpinning: false,
        currentDiscId: null,
        source: null,
        gainNode: null
    }
])


const discs = ref(generateInitialDiscs(groups.value[0]))
const audioElements = ref({})

// Helper function to stop and cleanup an audio source
function cleanupAudioSource(source, gainNode) {
    if (source) {
        try {
            source.stop()
            source.disconnect()
        } catch (error) {
            console.warn('Error stopping source:', error)
        }
    }
    if (gainNode) {
        try {
            gainNode.disconnect()
        } catch (error) {
            console.warn('Error disconnecting gain node:', error)
        }
    }
}

// Function to load audio buffer
async function loadAudioBuffer(url, retryCount = 3) {
    for (let i = 0; i < retryCount; i++) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const arrayBuffer = await response.arrayBuffer();

            // Add a small delay before decoding on Android
            if (/Android/.test(navigator.userAgent)) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            return await audioContext.decodeAudioData(arrayBuffer);
        } catch (error) {
            console.warn(`Attempt ${i + 1} failed to load audio:`, error);
            if (i === retryCount - 1) throw error;
            // Add exponential backoff delay between retries
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
        }
    }
}

// Watcher to reload audio buffers when currentMix changes
watch(currentMix, async (newMix) => {
    // Reload all audio buffers with the new mix
    for (const disc of discs.value) {
        const audioUrl = `${publicStatic}/music/${newMix}/${disc.audioPrefix}${disc.audioIndex}.mp3`
        const audioBuffer = await loadAudioBuffer(audioUrl)
        audioElements.value[`audio${disc.id}`] = audioBuffer
    }

    // Restart all audio to ensure sync with the new mix
    restartAllAudioInSync()
})
// Audio Playback Function
async function playGroupAudio(group) {
    if (!group.currentDiscId) return;

    try {
        // Resume audio context if suspended
        if (audioContext.state === 'suspended') {
            await audioContext.resume();
        }

        const audioUrl = getAudioUrl(group);
        const audioBuffer = await loadAudioBuffer(audioUrl);

        // Stop any existing source for this group
        stopGroupAudio(group);

        // Create new source and gain node
        const source = audioContext.createBufferSource();
        const gainNode = audioContext.createGain();

        source.buffer = audioBuffer;
        source.loop = true;
        gainNode.gain.value = 0.3;

        source.connect(gainNode);
        gainNode.connect(audioContext.destination);

        source.start();

        // Update group state
        group.source = source;
        group.gainNode = gainNode;
        group.isSpinning = true;
        activeSources.value[group.id] = { source, gainNode };

    } catch (error) {
        console.error('Audio playback failed:', error);
        group.isSpinning = false;
    }
}

// Stop Audio for a Specific Group
function stopGroupAudio(group) {
    if (group.source) {
        try {
            group.source.stop()
            group.source.disconnect()
        } catch (error) {
            console.warn('Error stopping source:', error)
        }
        group.source = null
    }

    if (group.gainNode) {
        try {
            group.gainNode.disconnect()
        } catch (error) {
            console.warn('Error disconnecting gain node:', error)
        }
        group.gainNode = null
    }

    // Remove from active sources
    delete activeSources.value[group.id]
}

// Helper function to generate audio URL
function getAudioUrl(group) {
    // Adjust to use the audio index for the specific group
    const disc = discs.value.find(d =>
        d.group === group.id && d.id === group.currentDiscId
    )
    const url = `${publicStatic}/music/${currentMix.value}/${group.audioPrefix}${disc?.audioIndex || 1}.mp3`


    return url
}

// Get Discs for a Specific Group
function getGroupDiscs(groupId) {
    return discs.value.filter(d => d.group === groupId)
}

// Computed Properties

// Update the computed property to properly track used instruments
const availableInstruments = computed(() => {
    const usedIds = new Set(groups.value.map(g => g.id))
    return instrumentConfig.filter(inst => !usedIds.has(inst.id))
})

// Modified addInstrument function
function addInstrument() {
    if (!currentInstrument.value) return

    const instrumentId = parseInt(currentInstrument.value)
    const instrument = instrumentConfig.find(inst => inst.id === instrumentId)

    if (!instrument || groups.value.some(g => g.id === instrumentId)) {
        console.warn('Invalid instrument selection or already added')
        return
    }

    instrumentsSelected.value += 1

    // Find and reset any previously dropped discs
    const previousGroupDiscs = discs.value.filter(d => d.group === instrumentId && d.hidden)
    previousGroupDiscs.forEach(disc => disc.hidden = false)

    // Create new discs if needed
    if (previousGroupDiscs.length === 0) {
        const newDiscs = generateInitialDiscs({
            ...instrument,
            id: instrumentId  // Use the original instrument ID
        })
        discs.value.push(...newDiscs)
    }

    // Create new group with original instrument ID
    const newGroup = {
        ...instrument,
        id: instrumentId,  // Keep original ID
        isSpinning: false,
        currentDiscId: null,
        source: null,
        gainNode: null
    }
    groups.value.push(newGroup)

    // Reset selection
    currentInstrument.value = ''
}

// Add this to your script section
async function removeInstrument(groupId) {
    try {
        // Find the group
        const group = groups.value.find(g => g.id === groupId);
        if (!group) return;

        // Stop and cleanup audio
        if (group.source) {
            cleanupAudioSource(group.source, group.gainNode);
            group.source = null;
            group.gainNode = null;
        }

        // Remove from audioSourceMap if present
        audioSourceMap.value.delete(groupId);

        // Reset discs for this group
        discs.value.forEach(disc => {
            if (disc.group === groupId) {
                disc.hidden = false;
            }
        });

        // Remove the group from groups array
        groups.value = groups.value.filter(g => g.id !== groupId);

        // Update instrument count
        instrumentsSelected.value = Math.max(1, instrumentsSelected.value - 1);

        // If we're below 3 instruments now, disable vocals and polish if they're enabled
        if (instrumentsSelected.value < 3) {
            if (backingVocalEnabled.value) {
                await toggleBackingVocals();
            }
            if (mainBackingTrackEnabled.value) {
                await toggleMainBackingTrack();
            }
            produced.value = false;
        }

        // Resync remaining audio to ensure everything is playing correctly
        if (isPlaying.value) {
            await syncAllAudio();
        }
    } catch (error) {
        console.error('Error removing instrument:', error);
    }
}


// Mix Change Handler
function changeMix(event) {
    currentMix.value = event.target.value
    // Stop all current audio sources
    groups.value.forEach(group => {
        stopGroupAudio(group)
        group.isSpinning = false
        group.currentDiscId = null
    })

    // Reset disc visibility
    discs.value.forEach(disc => disc.hidden = false)
}


// Volume control functions for all track types
function setVolume(groupId, value) {
    const group = groups.value.find(g => g.id === groupId)
    if (group?.gainNode) {
        const normalizedValue = (value !== undefined ? value : 50) / 100
        group.gainNode.gain.value = normalizedValue
        // Store the volume level with the group
        group.volume = value
    }
}

function setVocalVolume(value) {
    trackVolumes.value.vocals = value
    // Get the current audio source from the map
    const vocalSource = audioSourceMap.value.get('backingVocal')
    if (vocalSource?.gainNode) {
        vocalSource.gainNode.gain.value = value / 100
    }
    // Also update the backing vocal source if it exists
    if (backingVocalSource.value?.gainNode) {
        backingVocalSource.value.gainNode.gain.value = value / 100
    }
}

function setMasterVolume(value) {
    trackVolumes.value.master = value
    // Get the current audio source from the map
    const masterSource = audioSourceMap.value.get('mainTrack')
    if (masterSource?.gainNode) {
        masterSource.gainNode.gain.value = value / 100
    }
    // Also update the main backing track source if it exists
    if (mainBackingTrackSource.value?.gainNode) {
        mainBackingTrackSource.value.gainNode.gain.value = value / 100
    }
}

async function toggleBackingVocals() {
    try {
        if (backingVocalEnabled.value) {
            if (backingVocalSource.value) {
                cleanupAudioSource(backingVocalSource.value, backingVocalSource.value.gainNode)
                backingVocalSource.value = null
            }
            backingVocalEnabled.value = false
            audioSourceMap.value.delete('backingVocal')
            return
        }

        const audioUrl = `${publicStatic}/music/${currentMix.value}/vocal-1-${lyrics.value || 'pop'}.mp3`
        const audioBuffer = await loadAudioBuffer(audioUrl)

        const source = audioContext.createBufferSource()
        const gainNode = audioContext.createGain()

        source.buffer = audioBuffer
        source.loop = true
        // Use stored volume setting
        gainNode.gain.value = trackVolumes.value.vocals / 100

        source.connect(gainNode)
        gainNode.connect(audioContext.destination)

        source.start()

        // Store both source and gainNode
        backingVocalSource.value = source
        backingVocalSource.value.gainNode = gainNode
        backingVocalEnabled.value = true

        // Store in audio source map
        audioSourceMap.value.set('backingVocal', { source, gainNode })
    } catch (error) {
        console.error('Backing vocal playback failed:', error)
        backingVocalEnabled.value = false
    }
}

async function toggleMainBackingTrack() {
    console.log('toggleMainBackingTrack')
    try {
        if (mainBackingTrackEnabled.value) {
            if (mainBackingTrackSource.value) {
                cleanupAudioSource(mainBackingTrackSource.value, mainBackingTrackSource.value.gainNode)
                mainBackingTrackSource.value = null
            }
            mainBackingTrackEnabled.value = false
            audioSourceMap.value.delete('mainTrack')
            return
        }
        const audioUrl = `${publicStatic}/music/${currentMix.value}/main-1-${lyrics.value || 'pop'}.mp3`
        console.log('Main track URL:', audioUrl)
        const audioBuffer = await loadAudioBuffer(audioUrl)

        const source = audioContext.createBufferSource()
        const gainNode = audioContext.createGain()

        source.buffer = audioBuffer
        source.loop = true
        // Use stored volume setting
        gainNode.gain.value = trackVolumes.value.master / 100

        source.connect(gainNode)
        gainNode.connect(audioContext.destination)

        source.start()

        // Store both source and gainNode
        mainBackingTrackSource.value = source
        mainBackingTrackSource.value.gainNode = gainNode
        mainBackingTrackEnabled.value = true

        // Store in audio source map
        audioSourceMap.value.set('mainTrack', { source, gainNode })
    } catch (error) {
        console.error('Main backing track playback failed:', error)
        mainBackingTrackEnabled.value = false
    }
}

// Stop all current audio sources
groups.value.forEach(group => {
    stopGroupAudio(group)
    group.isSpinning = false
    group.currentDiscId = null
})

// Reset disc visibility
discs.value.forEach(disc => disc.hidden = false)

// Stop backing vocals if they're playing
if (backingVocalSource.value) {
    try {
        backingVocalSource.value.stop()
        backingVocalSource.value.disconnect()
    } catch (error) {
        console.warn('Error stopping backing vocal source:', error)
    }
    backingVocalSource.value = null
    backingVocalEnabled.value = false
}

// Calculate a common start time
const commonStartTime = audioContext.currentTime + 0.1


// Add these to your existing state management
const isRecording = ref(false)
const mediaRecorder = ref(null)
const audioChunks = ref([])

// Utility function to perform fade on a gain node
function fadeGainNode(gainNode, fromValue, toValue, duration) {
    if (!gainNode) return;

    const currentTime = audioContext.currentTime;
    gainNode.gain.setValueAtTime(fromValue, currentTime);
    gainNode.gain.exponentialRampToValueAtTime(Math.max(toValue, 0.0001), currentTime + duration);
}

// Function to fade in all tracks
async function fadeInAllTracks(duration = 1) {
    // Fade in group tracks
    groups.value.forEach(group => {
        if (group.gainNode) {
            const targetVolume = (group.volume || 50) / 100;
            fadeGainNode(group.gainNode, 0.0001, targetVolume, duration);
        }
    });

    // Fade in backing vocal if active
    const vocalSource = audioSourceMap.value.get('backingVocal');
    if (vocalSource?.gainNode) {
        const targetVolume = trackVolumes.value.vocals / 100;
        fadeGainNode(vocalSource.gainNode, 0.0001, targetVolume, duration);
    }

    // Fade in main track if active
    const masterSource = audioSourceMap.value.get('mainTrack');
    if (masterSource?.gainNode) {
        const targetVolume = trackVolumes.value.master / 100;
        fadeGainNode(masterSource.gainNode, 0.0001, targetVolume, duration);
    }
}

// Function to fade out all tracks and return a promise that resolves when fade is complete
function fadeOutAllTracks(duration = 1) {
    return new Promise(resolve => {
        // Store current volumes for restoration
        const groupVolumes = groups.value.map(group => ({
            id: group.id,
            volume: group.gainNode?.gain.value || 0
        }));

        // Fade out group tracks
        groups.value.forEach(group => {
            if (group.gainNode) {
                fadeGainNode(group.gainNode, group.gainNode.gain.value, 0.0001, duration);
            }
        });

        // Fade out backing vocal if active
        const vocalSource = audioSourceMap.value.get('backingVocal');
        if (vocalSource?.gainNode) {
            fadeGainNode(vocalSource.gainNode, vocalSource.gainNode.gain.value, 0.0001, duration);
        }

        // Fade out main track if active
        const masterSource = audioSourceMap.value.get('mainTrack');
        if (masterSource?.gainNode) {
            fadeGainNode(masterSource.gainNode, masterSource.gainNode.gain.value, 0.0001, duration);
        }

        // Wait for fade to complete before resolving
        setTimeout(resolve, duration * 1000);
    });
}

// Updated recording functions
async function startRecording() {
    let destination;

    try {
        // Check supported formats first
        const formats = [
            'audio/webm;codecs=opus',
            'audio/webm',
            'audio/mp3',
            'audio/mpeg',
            'audio/wav'
        ];

        const supportedFormats = formats.filter(format => {
            try {
                return MediaRecorder.isTypeSupported(format);
            } catch {
                return false;
            }
        });

        console.log('Supported formats:', supportedFormats);

        if (supportedFormats.length === 0) {
            throw new Error('No supported audio formats found');
        }

        await syncAllAudio();

        destination = audioContext.createMediaStreamDestination();

        // Connect all tracks to destination
        groups.value.forEach(group => {
            if (group.source && group.gainNode) {
                group.gainNode.gain.setValueAtTime(0.0001, audioContext.currentTime);
                group.gainNode.connect(destination);
            }
        });

        if (backingVocalSource.value?.gainNode) {
            backingVocalSource.value.gainNode.gain.setValueAtTime(0.0001, audioContext.currentTime);
            backingVocalSource.value.gainNode.connect(destination);
        }

        if (mainBackingTrackSource.value?.gainNode) {
            mainBackingTrackSource.value.gainNode.gain.setValueAtTime(0.0001, audioContext.currentTime);
            mainBackingTrackSource.value.gainNode.connect(destination);
        }

        // Use the first supported format
        const options = {
            mimeType: supportedFormats[0],
            bitsPerSecond: 256000
        };

        mediaRecorder.value = new MediaRecorder(destination.stream, options);

        mediaRecorder.value.ondataavailable = (event) => {
            audioChunks.value.push(event.data);
        };

        mediaRecorder.value.onstop = () => {
            const audioBlob = new Blob(audioChunks.value, { type: supportedFormats[0] });
            const audioUrl = URL.createObjectURL(audioBlob);

            const downloadLink = document.createElement('a');
            downloadLink.href = audioUrl;
            // Use the appropriate extension based on the format
            const extension = supportedFormats[0].includes('webm') ? 'webm' :
                supportedFormats[0].includes('mpeg') ? 'mp3' :
                    supportedFormats[0].includes('wav') ? 'wav' : 'mp3';

            downloadLink.download = `DuckStar_${currentMix.value}-${new Date().toLocaleDateString("en-CA").replace(/[:.]/g, '-')}.${extension}`;

            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);

            audioChunks.value = [];
            URL.revokeObjectURL(audioUrl);
        };

        mediaRecorder.value.start();
        isRecording.value = true;

        await fadeInAllTracks(1.0);

    } catch (error) {
        console.error('Recording setup failed:', error);
        isRecording.value = false;

        // If everything fails, try basic WebM without options
        if (destination) {
            try {
                mediaRecorder.value = new MediaRecorder(destination.stream);
                mediaRecorder.value.start();
                isRecording.value = true;
                await fadeInAllTracks(1.0);
            } catch (fallbackError) {
                console.error('Basic recording fallback failed:', fallbackError);
                isRecording.value = false;
            }
        }
    }
}

async function stopRecording() {
    if (mediaRecorder.value && isRecording.value) {
        try {
            await fadeOutAllTracks(1.0);
            mediaRecorder.value.stop();
            isRecording.value = false;
        } catch (error) {
            console.error('Error stopping recording:', error);
        }
    }
}


function startDrag(e, disc, discClass) {
    currentDraggedDisc.value = disc
    isDragging.value = true

    if (e.type === 'touchstart') {
        const touch = e.touches[0]
        const rect = e.target.getBoundingClientRect()

        touchStartPos.value = {
            x: touch.clientX - rect.left,
            y: touch.clientY - rect.top
        }

        // Create visual clone with proper styling
        const clone = document.createElement('div')
        clone.style.position = 'fixed'
        clone.style.zIndex = '1000'
        clone.style.opacity = '0.8'
        clone.style.width = `${rect.width}px`
        clone.style.height = `${rect.height}px`
        clone.style.borderRadius = '50%'
        clone.style.pointerEvents = 'none'
        clone.style.left = `${touch.clientX - touchStartPos.value.x}px`
        clone.style.top = `${touch.clientY - touchStartPos.value.y}px`

        // Add the record styling
        clone.style.backgroundImage = `url(${new URL('@/assets/images/records/record1.png', import.meta.url).href})`
        clone.style.backgroundSize = 'cover'
        clone.style.backgroundColor = '#000000'
        clone.style.border = `2px solid ${getDiscColor(disc.group)}`

        // Add disc number
        const numberDiv = document.createElement('div')
        numberDiv.style.width = '100%'
        numberDiv.style.height = '100%'
        numberDiv.style.display = 'flex'
        numberDiv.style.alignItems = 'center'
        numberDiv.style.justifyContent = 'center'
        numberDiv.style.color = 'white'
        numberDiv.textContent = disc.index + 1
        clone.appendChild(numberDiv)

        document.body.appendChild(clone)
        dragClone.value = clone
    } else {
        e.dataTransfer.effectAllowed = 'move'
        e.dataTransfer.setData('text/plain', disc.id)
    }
}

// Add helper function to get disc color
function getDiscColor(groupId) {
    const colorMap = {
        1: '#1c0eb7',
        2: '#b01111',
        3: '#11b011',
        4: '#9932CC',
        5: '#FFA500',
        6: '#FF1493',
        7: '#00CED1',
        8: '#FFD700',
        9: '#8B4513'
    }
    return colorMap[groupId] || '#000000'
}

// Update handleTouchMove for smoother movement
function handleTouchMove(e) {
    if (!currentDraggedDisc.value || !dragClone.value) return

    const touch = e.touches[0]

    // Add smooth transition
    dragClone.value.style.transition = 'all 0.1s'
    dragClone.value.style.left = `${touch.clientX - touchStartPos.value.x}px`
    dragClone.value.style.top = `${touch.clientY - touchStartPos.value.y}px`
}


function changeLyrics(value) {
    lyrics.value = value

    toggleBackingVocals()
    toggleMainBackingTrack()


}

function makeMore() {
    loading.value = true
    aiGenMusic(true)
}


async function pollTaskStatus(interval = 1000, taskId = null) {
  let previousStatus = null;
  loading.value = true;
  console.log('start polling', taskId);

  return new Promise((resolve, reject) => {
    const poll = async () => {
      try {
        const tasksData = await fetchTasksForSong(songData.value.id);

        if (tasksData && tasksData.data.length > 0) {
          console.log('has tasks', tasks);

          // If taskId is provided, only check that specific task
          if (taskId) {
            console.log('polling for', taskId);
            const targetTask = tasksData.data.find(task => task.taskId === taskId);
            console.log(targetTask);
            if (targetTask) {
              console.log('check status', targetTask.status);
              if (targetTask.ref1) {
                tasks.value.push(targetTask);
                hasFinishedTasks.value = true;
                clearTimeout(pollingTimeout);
                loading.value = false;
                resolve([targetTask]);
                return;
              }
            }
          } else {
            console.log('polling any task');
            // Original behavior for all tasks
            hasFinishedTasks.value = tasksData.data.some(task => {
              console.log('check status', task.status);
              if (task.ref1 || task.status === "COMPLETE") {
                console.log('ot ref1', task.ref1);
                console.log('comp',tasksData.data)
                tasks.value = tasksData.data;
                loading.value = false;
                clearTimeout(pollingTimeout);
                resolve(tasksData.data);
                return true;
              }
              return false;
            });
          }
        }
        pollingTimeout = setTimeout(poll, interval);

      } catch (error) {
        console.error('Polling error:', error);
        clearTimeout(pollingTimeout);
        loading.value = false;
        reject(error);
      }
    };

    // Start polling
    poll();
  });
}

async function syncAllAudio() {
    try {
        // Show sync loading indicator
        document.querySelectorAll('.sync-load').forEach(item => {
            item.classList.remove('hide-sync')
            item.classList.add('blink')
        })

        // Store current states AND volumes
        const wasVocalEnabled = backingVocalEnabled.value
        const wasMainTrackEnabled = mainBackingTrackEnabled.value

        // Store current volumes for each group
        const groupVolumes = {}
        groups.value.forEach(group => {
            groupVolumes[group.id] = group.gainNode?.gain.value * 100 || group.volume || 50
        })

        // Temporarily set flags to false while we restart everything
        backingVocalEnabled.value = false
        mainBackingTrackEnabled.value = false

        // Stop all current audio
        groups.value.forEach(group => {
            cleanupAudioSource(group.source, group.gainNode)
            group.source = null
            group.gainNode = null
            group.isSpinning = false
        })

        // Clean up backing tracks
        if (backingVocalSource.value) {
            cleanupAudioSource(backingVocalSource.value, backingVocalSource.value.gainNode)
            backingVocalSource.value = null
        }
        if (mainBackingTrackSource.value) {
            cleanupAudioSource(mainBackingTrackSource.value, mainBackingTrackSource.value.gainNode)
            mainBackingTrackSource.value = null
        }

        // Clear audio sources map
        audioSourceMap.value.clear()

        // Resume audioContext if needed
        if (audioContext.state === 'suspended') {
            await audioContext.resume()
        }

        // Calculate common start time with buffer
        const commonStartTime = audioContext.currentTime + 0.2

        // Start all active instrument tracks simultaneously
        await Promise.all(groups.value.map(async (group) => {
            if (!group.currentDiscId) return

            try {
                const audioUrl = getAudioUrl(group)
                const audioBuffer = await loadAudioBuffer(audioUrl)

                const source = audioContext.createBufferSource()
                const gainNode = audioContext.createGain()

                source.buffer = audioBuffer
                source.loop = true

                // Restore the previous volume
                const previousVolume = groupVolumes[group.id]
                gainNode.gain.value = previousVolume / 100
                group.volume = previousVolume // Store the volume with the group

                source.connect(gainNode)
                gainNode.connect(audioContext.destination)

                source.start(commonStartTime)

                group.source = source
                group.gainNode = gainNode
                group.isSpinning = true
                audioSourceMap.value.set(group.id, { source, gainNode })
            } catch (error) {
                console.error(`Failed to start audio for group ${group.id}:`, error)
            }
        }))

        // Restore backing tracks with their volumes
        const restoreBackingTracks = async () => {
            try {
                if (wasVocalEnabled) {
                    backingVocalEnabled.value = true
                    const audioUrl = `${publicStatic}/music/${currentMix.value}/vocal-1-${lyrics.value || 'pop'}.mp3`
                    const audioBuffer = await loadAudioBuffer(audioUrl)

                    const source = audioContext.createBufferSource()
                    const gainNode = audioContext.createGain()

                    source.buffer = audioBuffer
                    source.loop = true
                    gainNode.gain.value = trackVolumes.value.vocals / 100

                    source.connect(gainNode)
                    gainNode.connect(audioContext.destination)

                    source.start(audioContext.currentTime)

                    backingVocalSource.value = source
                    backingVocalSource.value.gainNode = gainNode
                    audioSourceMap.value.set('backingVocal', { source, gainNode })
                }

                if (wasMainTrackEnabled) {
                    mainBackingTrackEnabled.value = true
                    const audioUrl = `${publicStatic}/music/${currentMix.value}/main-1-${lyrics.value || 'pop'}.mp3`
                    const audioBuffer = await loadAudioBuffer(audioUrl)

                    const source = audioContext.createBufferSource()
                    const gainNode = audioContext.createGain()

                    source.buffer = audioBuffer
                    source.loop = true
                    gainNode.gain.value = trackVolumes.value.master / 100

                    source.connect(gainNode)
                    gainNode.connect(audioContext.destination)

                    source.start(audioContext.currentTime)

                    mainBackingTrackSource.value = source
                    mainBackingTrackSource.value.gainNode = gainNode
                    audioSourceMap.value.set('mainTrack', { source, gainNode })
                }
            } catch (error) {
                console.error('Error restoring backing tracks:', error)
            }
        }

        // Use a short timeout to ensure main tracks are playing first
        await new Promise(resolve => setTimeout(resolve, 50))
        await restoreBackingTracks()

        // Update UI state
        isPlaying.value = true

        // Hide sync loading indicator after everything is done
        setTimeout(() => {
            document.querySelectorAll('.sync-load').forEach(item => {
                item.classList.remove('blink')
                item.classList.add('hide-sync')
            })
        }, 1000)

    } catch (error) {
        console.error('Error in syncAllAudio:', error)
        isPlaying.value = false

        // Ensure sync indicator is hidden even if there's an error
        document.querySelectorAll('.sync-load').forEach(item => {
            item.classList.remove('blink')
            item.classList.add('hide-sync')
        })
    }
}

async function handleDrop(e, group) {
    const instructons = document.getElementById('instructions')
    instructions.classList.add('hide-sync')
    document.querySelectorAll('.sync-load').forEach(item => {
        item.classList.remove('hide-sync')
        item.classList.add('blink')


    })
    if (!currentDraggedDisc.value) return;

    let discId;

    if (e.type === 'touchend') {
        const touch = e.changedTouches[0];
        const dropTarget = document.elementFromPoint(touch.clientX, touch.clientY);

        if (!dropTarget?.closest('.record-player')) {
            if (dragClone.value) {
                dragClone.value.style.transition = 'all 0.3s';
                dragClone.value.style.opacity = '0';
                setTimeout(() => {
                    if (dragClone.value) {
                        dragClone.value.remove();
                        dragClone.value = null;
                    }
                }, 300);
            }
            isDragging.value = false;
            currentDraggedDisc.value = null;
            return;
        }

        discId = currentDraggedDisc.value.id;
    } else {
        discId = e.dataTransfer.getData('text/plain');
    }

    const disc = discs.value.find(d => d.id === discId);
    if (!disc || disc.group !== group.id) return;

    // Find if the group already has a current disc
    const previouslyDroppedDisc = discs.value.find(
        d => d.group === group.id && d.id === group.currentDiscId
    );

    // If there was a previous disc, unhide it
    if (previouslyDroppedDisc) {
        previouslyDroppedDisc.hidden = false;
    }

    // Hide the newly dropped disc
    disc.hidden = true;
    group.currentDiscId = disc.id;

    // Resume audio context if suspended
    if (audioContext.state === 'suspended') {
        await audioContext.resume();
    }

    // Sync all audio sources instead of just playing the new one
    await syncAllAudio();

    document.querySelectorAll('.sync-load').forEach(item => {
        item.classList.remove('blink')
    })
    setTimeout(() => {
        document.querySelectorAll('.sync-load').forEach(item => {
            item.classList.add('hide-sync')
        })
    }, 1000)

    isPlaying.value = true;
    isDragging.value = false;
    currentDraggedDisc.value = null;

    // Clean up clone if it exists
    if (dragClone.value) {
        dragClone.value.remove();
        dragClone.value = null;
    }
    instructions.style.display = "none"
}

// Pause/Play Toggle Function
async function pausePlay(forceStop = false) {
    try {
        if (isPlaying.value || forceStop) {
            // Store the state of backing tracks
            const wasVocalEnabled = backingVocalEnabled.value
            const wasMainTrackEnabled = mainBackingTrackEnabled.value

            // Stop all instrument tracks
            groups.value.forEach(group => {
                if (group.source) {
                    cleanupAudioSource(group.source, group.gainNode)
                    group.source = null
                    group.gainNode = null
                    group.isSpinning = false
                }
            })

            // Stop backing vocal track
            if (backingVocalSource.value) {
                cleanupAudioSource(backingVocalSource.value, backingVocalSource.value.gainNode)
                backingVocalSource.value = null
            }

            // Stop main backing track
            if (mainBackingTrackSource.value) {
                cleanupAudioSource(mainBackingTrackSource.value, mainBackingTrackSource.value.gainNode)
                mainBackingTrackSource.value = null
            }

            // Clear source map but maintain enabled states
            audioSourceMap.value.clear()

            // Update UI
            document.querySelectorAll('.spinning').forEach(item => {
                item.classList.add('stop')
            })

            isPlaying.value = false

            // Preserve the enabled states
            backingVocalEnabled.value = wasVocalEnabled
            mainBackingTrackEnabled.value = wasMainTrackEnabled
        } else if (!forceStop) {
            // Resume playback with existing backing track states
            await restartAllAudioInSync(false) // Pass false to maintain backing track states
            isPlaying.value = true
        }
    } catch (error) {
        console.error('Error in pausePlay:', error)
        isPlaying.value = false
    }
}
async function restartAllAudioInSync(resetBackingTracks = true) {
    try {
        // Stop all current audio and clear sources
        groups.value.forEach(group => {
            cleanupAudioSource(group.source, group.gainNode)
            group.source = null
            group.gainNode = null
            group.isSpinning = false
        })

        // Store the state of backing tracks before clearing them
        const wasVocalEnabled = backingVocalEnabled.value
        const wasMainTrackEnabled = mainBackingTrackEnabled.value

        // Clear existing audio sources
        audioSourceMap.value.clear()

        // Only reset backing track states if requested
        if (resetBackingTracks) {
            if (backingVocalSource.value) {
                cleanupAudioSource(backingVocalSource.value, backingVocalSource.value.gainNode)
                backingVocalSource.value = null
                backingVocalEnabled.value = false
            }

            if (mainBackingTrackSource.value) {
                cleanupAudioSource(mainBackingTrackSource.value, mainBackingTrackSource.value.gainNode)
                mainBackingTrackSource.value = null
                mainBackingTrackEnabled.value = false
            }
        } else {
            // Clean up the audio sources without resetting their enabled state
            if (backingVocalSource.value) {
                cleanupAudioSource(backingVocalSource.value, backingVocalSource.value.gainNode)
                backingVocalSource.value = null
            }

            if (mainBackingTrackSource.value) {
                cleanupAudioSource(mainBackingTrackSource.value, mainBackingTrackSource.value.gainNode)
                mainBackingTrackSource.value = null
            }
        }

        // Resume audioContext if needed
        if (audioContext.state === 'suspended') {
            await audioContext.resume()
        }

        // Calculate common start time
        const commonStartTime = audioContext.currentTime + 0.1

        // Start all active tracks
        await Promise.all(groups.value.map(async (group) => {
            if (!group.currentDiscId) return

            try {
                const audioUrl = getAudioUrl(group)
                const audioBuffer = await loadAudioBuffer(audioUrl)

                const source = audioContext.createBufferSource()
                const gainNode = audioContext.createGain()

                source.buffer = audioBuffer
                source.loop = true
                gainNode.gain.value = 0.3

                source.connect(gainNode)
                gainNode.connect(audioContext.destination)

                source.start(commonStartTime)

                group.source = source
                group.gainNode = gainNode
                group.isSpinning = true

                // Track the source
                audioSourceMap.value.set(group.id, { source, gainNode })
            } catch (error) {
                console.error(`Failed to start audio for group ${group.id}:`, error)
            }
        }))

        // Restore backing tracks if they were enabled
        if (!resetBackingTracks) {
            // Use setTimeout to ensure tracks start in sync
            const restoreBackingTracks = async () => {
                if (wasVocalEnabled) {
                    await toggleBackingVocals()
                }
                if (wasMainTrackEnabled) {
                    await toggleMainBackingTrack()
                }
            }
            setTimeout(restoreBackingTracks, 50)
        }

        // Update UI state
        isPlaying.value = true
        document.querySelectorAll('.spinning.stop').forEach(item => {
            item.classList.remove('stop')
        })
    } catch (error) {
        console.error('Error in restartAllAudioInSync:', error)
        isPlaying.value = false
    }
}
function playAllAudio() {
    console.log('Playing all audio', audioElements.value)
    // Play all audio from the current state
    Object.keys(audioElements.value).forEach(key => {
        console.log(audioElements.value)
        const audioData = audioElements.value[key]
        if (audioData?.buffer) {
            const source = audioContext.createBufferSource()
            source.buffer = audioData.buffer
            source.loop = true

            const gainNode = audioContext.createGain()
            gainNode.gain.value = 1.0
            gainNodes.value[key] = gainNode

            source.connect(gainNode)
            gainNode.connect(audioContext.destination)

            source.start()
            audioElements.value[key] = { buffer: audioData.buffer, source, gainNode }
            activeSources.value[key] = { source, gainNode }
        }
    })

    isPlaying.value = true
}

async function openProducerDialog() {
    pausePlay(true)
    showProducerDialog.value = true
    const producerVid = document.getElementById('producer-vid1');
    console.log("a",tasks)
    tasks.value = await fetchTasksForSong(songData.value.id)
    console.log("b",tasks)

    if (producerVid) {
        producerVid.play();
    }
    if (tasks) {
        pollTaskStatus()
    }


}
function handleCloseProducer() {
    showProducerDialog.value = false
    const producerVid = document.getElementById('producer-vid1');
    if (producerVid) {
        producerVid.pause();
    }
}

function handleConfirmProducer() {
    produced.value = true
    showProducerDialog.value = false
    syncAllAudio()
    toggleBackingVocals()
    toggleMainBackingTrack()

}

function playProducer() {
    document.getElementById('producer-vid1').play()
}

function aiGenMusic(poll = false) {
    console.log('start ai gen que')
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
        "prompt": songData.value.lyrics,
        "style": songData.value.genre,
        "title": songData.value.title,
        "callBackUrl": mainMusicAiGenCallback
    });

    const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow"
    };
    console.log(raw)

    fetch(mainMusicAiGenEndpoint, requestOptions)
        .then((response) => response.json())
        .then(async (result) => {
            console.log(result)
            console.log("taskId", result.data.data.taskId)
            console.log("onwer", songData.value.songOwnerId)
            console.log("song id", songData.value.id)
            console.log("lyrics", songData.value.lyrics.substring(0, 50))
            const newTask = await createTask({
                taskOwnerId: songData.value.songOwnerId,
                taskId: result.data.data.taskId,
                songId: songData.value.id,
                taskDescription: `Generating music from prompt: ${songData.value.lyrics.substring(0, 50)}...`
            });
            console.log('newTask', newTask)
            tasks.value.push(newTask);
            console.log(tasks.value)
            if (poll) {
                console.log('poll more', newTask.data.taskId)
                pollTaskStatus(1000, newTask.data.taskId)
            }

        })
        .catch((error) => console.error('Error:', error));

}

// Cancel polling on component unmount
onBeforeUnmount(() => {
    if (pollingTimeout) {
        clearTimeout(pollingTimeout);
    }
});

// Cancel polling on route leave
onBeforeRouteLeave((to, from, next) => {
    if (pollingTimeout) {
        clearTimeout(pollingTimeout);
    }
    next();
});

// Initial Audio Loading
onMounted(async () => {
    await fadeOutAndStop(2000);
    const songId = Array.isArray(route.query.songId) ? route.query.songId[0] : route.query.songId || '';
    console.log('songId', songId);
    await getSong(songId).then((resp) => {
        if (resp) {
            console.log('songData', resp);
            console.log('songData title', resp.title);
            songData.value = resp;
            console.log('check if has task');
            fetchTasksForSong(songData.value.id).then((tasksData) => {
                console.log('tasks', tasksData);
                if (tasksData && tasksData.data && tasksData.data.length > 0) {
                    console.log('has tasks only make new if requested', tasksData);
                    hasFinishedTasks.value = tasksData.data.some(task => task.status === 'COMPLETE');
                } else {
                    if (createAiGenMusic.value && songData.value.lyrics) {
                        console.log('generating new task');
                        aiGenMusic();
                    }
                }
            });
        } else {
            console.error('Error fetching song data');
        }
    }).catch((error) => {
        console.error('Error:', error);
    });



    if (!window.AudioContext && !window.webkitAudioContext) {
        alert('Web Audio API not supported in this browser.');
        throw new Error('Web Audio API not supported');
    }

    try {
        // Preload audio for initial group
        for (const disc of discs.value) {
            const group = groups.value.find(g => g.id === disc.group)
            const audioUrl = getAudioUrl(group)

            await loadAudioBuffer(audioUrl).catch(error => {
                console.warn(`Could not preload audio for disc ${disc.id}:`, error)
            })
        }
    } catch (error) {
        console.error('Audio initialization failed:', error)
    }

    loading.value = false
})

function confirmVersion(task) {
    console.log('save this version', task)
    console.log('save original to song')
    console.log('split tracks and save them and link to song')
    console.log('when saved save "song tracks')
    loading.value=false
    showProducerDialog.value = false
}

// Cleanup Function
onUnmounted(() => {
    if (pollingTimeout) {
        clearTimeout(pollingTimeout);
    }
    // Stop and cleanup all audio sources
    audioSourceMap.value.forEach(({ source, gainNode }) => {
        cleanupAudioSource(source, gainNode)
    })
    audioSourceMap.value.clear()

    // Clear all group sources
    groups.value.forEach(group => {
        group.source = null
        group.gainNode = null
        group.isSpinning = false
    })

    // Clear backing track sources
    backingVocalSource.value = null
    mainBackingTrackSource.value = null
})

</script>

<style scoped>
.arrow-drop {
    margin-top: 10px;
    max-width: 60px;
}

.el-select.el-select--large.w-full.instrument-selecta {
    width: 160px;
    margin-left: 20px;
}

.text-black {
    color: #000000;
}



@keyframes pulse {
    from {
        opacity: 0.7;
    }

    to {
        opacity: 1;
    }
}


.dragging {
    opacity: 0.8;
    background: #000;
}

.record-player {
    touch-action: none;
}

.mini-disc {
    touch-action: none;
    -webkit-user-select: none;
    user-select: none;
    transform-origin: center center;
    will-change: transform;
}

[data-dragging="true"] {
    transition: transform 0.1s ease-out;
    background: #000;
}

.disc-wrapper {
    touch-action: none;
}

.disc-center {
    position: relative;
    margin: 0px 2px 9px -5px;
}

.slider-title {
    text-align: left;
    float: right;
    position: absolute;
    left: 11px;
    top: 3px;
}

span.group-title.text-white {
    position: absolute;
    margin-top: -128px;
    margin-left: 4px;
}

.top-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background-color: #2a2a2a;
}

.mix-select {
    padding: 0.5rem;
    border-radius: 0.5rem;
    background-color: #3a3a3a;
    color: white;
    border: none;
}

.vocal-button {
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    background-color: #4CAF50;
    color: white;
    border: none;
}

.content-area {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
}

.records-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    padding: 1rem;
}

.record-player {
    aspect-ratio: 1;
    border-radius: 50%;
    background-color: #000000;
    position: relative;
    padding-left: 5px;
}

.discs-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    padding: 1rem;
}

.mini-disc {
    aspect-ratio: 1;
    border-radius: 50%;
    background-color: #000000;
    cursor: grab;
    box-shadow: 2px 2px 13px #000;
}

.mixer-controls {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    padding: 1rem;
}

.volume-control {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.volume-control input[type="range"] {
    width: 100%;
}

.bottom-nav {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    background-color: #2a2a2a;
    padding: 0.5rem;
}

.bottom-nav button {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0.75rem;
    color: #888;
    border: none;
    background: none;
}

.bottom-nav button.active {
    color: #4CAF50;
}

.nav-icon {
    font-size: 1.5rem;
    margin-bottom: 0.25rem;
}

.nav-label {
    font-size: 0.75rem;
}

/* Maintain your existing color classes and animations */
.spinning {
    animation: spin 5s linear infinite;
    box-shadow: 2px 2px 13px #000;
}

.spinning.stop {
    animation: none;
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}


.box {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    overflow: auto;
    padding: 20px;
}

.record-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(3, 1fr);
    gap: 20px;
    max-width: 960px;
    margin: 0 auto;
}

.record-player {
    width: 90px;
    height: 90px;
    border-radius: 50%;
    background-color: #000000;
    margin-left: 6px;
    position: relative;
    margin-bottom: 9px;
    margin-top: -7px;
}

.disc-wrapper {
    overflow-x: scroll;
    min-width: 200px;
    margin-bottom: 16px;
    padding-top: 10px;
    padding-bottom: 10px;
    width: 153%;
    padding-left: 6px;
}

.spinning {
    animation: spin 5s linear infinite;
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}

.color-indicator {
    position: absolute;
    top: 29%;
    right: 29%;
    left: 29%;
    bottom: 29%;
    border: 2px solid var(--el-color-primary);
    border-radius: 50%;

}

img.center-duck {
    margin: 1px 0px 0px 2px;
    height: 30px;
    width: 30px;
}

/* Group colors */
/* Group colors */
.group-1-color {
    background-color: #1c0eb7;
}

.group-2-color {
    background-color: #b01111;
}

.group-3-color {
    background-color: #11b011;
}

.group-4-color {
    background-color: #9932CC;
}

.group-5-color {
    background-color: #FFA500;
}

.group-6-color {
    background-color: #FF1493;
}

.group-7-color {
    background-color: #00CED1;
}

.group-8-color {
    background-color: #FFD700;
}

.group-9-color {
    background-color: #8B4513;
}

/* Record images with matching border colors */
.group-1.spinning {
    background-image: url(@/assets/images/records/record1.png);
    border: 2px solid #1c0eb7;
}

.group-2.spinning {
    background-image: url(@/assets/images/records/record1.png);
    border: 2px solid #b01111;
}

.group-3.spinning {
    background-image: url(@/assets/images/records/record1.png);
    border: 2px solid #11b011;
}

.group-4.spinning {
    background-image: url(@/assets/images/records/record1.png);
    border: 2px solid #9932CC;
}

.group-5.spinning {
    background-image: url(@/assets/images/records/record1.png);
    border: 2px solid #FFA500;
}

.group-6.spinning {
    background-image: url(@/assets/images/records/record1.png);
    border: 2px solid #FF1493;
}

.group-7.spinning {
    background-image: url(@/assets/images/records/record1.png);
    border: 2px solid #00CED1;
}

.group-8.spinning {
    background-image: url(@/assets/images/records/record1.png);
    border: 2px solid #FFD700;
}

.group-9.spinning {
    background-image: url(@/assets/images/records/record1.png);
    border: 2px solid #8B4513;
}


span.text-white.slider {
    float: left;
    position: absolute;
    margin-top: 4px;
    margin-left: -60px
}

.instrument-group {
    border: 2px solid var(--el-color-primary);
    padding: 0;
    border-radius: 12px;
    background: #333;
    box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.2);
}

.volume-slider-horizontal {
    position: absolute;
    right: 40px;
}

circle.remove-instrument-btn {
    position: absolute;
    right: 6px;
    top: 4px;
}

.volume-range {
    display: flex;
    justify-content: center;
    align-items: center;
}

.volume-range input[type="range"] {
    width: 80%;
}

.disc-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(3, 1fr);
    gap: 20px;
    max-width: 960px;
    margin: 20px auto;
    padding: 10px;
    justify-items: center;
    align-items: center;
}

.mini-disc {
    width: 60px;
    height: 60px;
    background-size: cover;
    cursor: grab;
    border-radius: 50%;
    transition: transform 0.2s;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.mini-disc:hover {
    transform: scale(1.1);
    box-shadow: 2px 2px 13px #000;
}

.mini-disc:active {
    cursor: grabbing;
}

/* Mini disc images */
.group-1-disc {
    background-image: url(@/assets/images/records/record1.png);
    border: 2px solid #1c0eb7;
}

.group-2-disc {
    background-image: url(@/assets/images/records/record1.png);
    border: 2px solid #b01111;
}

.group-3-disc {
    background-image: url(@/assets/images/records/record1.png);
    border: 2px solid #11b011;
}

.group-4-disc {
    background-image: url(@/assets/images/records/record1.png);
    border: 2px solid #9932CC;
}

.group-5-disc {
    background-image: url(@/assets/images/records/record1.png);
    border: 2px solid #FFA500;
}

.group-6-disc {
    background-image: url(@/assets/images/records/record1.png);
    border: 2px solid #FF1493;
}

.group-7-disc {
    background-image: url(@/assets/images/records/record1.png);
    border: 2px solid #00CED1;
}

.group-8-disc {
    background-image: url(@/assets/images/records/record1.png);
    border: 2px solid #FFD700;
}

.group-9-disc {
    background-image: url(@/assets/images/records/record1.png);
    border: 2px solid #8B4513;
}

.box5 {
    position: relative;
    width: 100%;
    max-width: 960px;
    margin: 20px auto;
    padding: 20px;
    border-bottom: double 5px #000000;
    display: flex;
    flex-direction: column;
    gap: 20px;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.instructions {
    text-align: center;
    font-weight: bold;
}

.controls {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 20px;
}

.instrument-selector {
    display: flex;
    gap: 10px;
}

.instrument-select {
    padding: 8px;
    border-radius: 4px;
    border: 1px solid #ccc;
}


.add-instrument-button:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
}

.add-instrument-button:hover:not(:disabled) {
    background-color: #45a049;
}

.vocal-button {
    padding: 8px 16px;
    border-radius: 4px;
    background-color: #4CAF50;
    color: white;
    border: none;
    cursor: pointer;
}

.vocal-button:hover {
    background-color: #45a049;
}

.text-small {
    font-size: 12px;
}

.hide-sync {
    animation: blinkThenFade 1s linear forwards;
}

@keyframes blinkThenFade {

    /* First blink */
    0% {
        opacity: 1;
    }

    10% {
        opacity: 0;
    }

    20% {
        opacity: 1;
    }

    /* Second blink */
    30% {
        opacity: 0;
    }

    40% {
        opacity: 1;
    }

    /* Third blink */
    50% {
        opacity: 0;
    }

    60% {
        opacity: 1;
    }

    /* Pause briefly */
    70% {
        opacity: 1;
    }

    /* Final fade out */
    80% {
        opacity: 1;
    }

    100% {
        opacity: 0;
    }
}

.sync-load {
    position: absolute;
    left: 5px;
    top: -22px;
    font-size: 12px;
    color: #ddd;
}

.change-lyrics {
    width: 125px;
}

.remove-instrument-btn {
    position: absolute;
    right: 8px;
    top: 5px;
}

.track-previews-wrapper {
    max-height: 400px;
    overflow: scroll;
}

.track-previews audio {
    max-width: 250px;
}

hr {

    border: 0.11px solid #444;
}

.track-preview-single {
    border: 2px solid #444;
    padding: 10px;
    border-radius: 5px;
    min-height: 115px;
}
</style>