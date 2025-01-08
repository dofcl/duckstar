<template>
    <div class="dj-app p-4">
        <div v-for="group in groups" :key="group.id" class="grid grid-cols-3 gap-4 items-center mb-4">
            <!-- Record Player (Drop Zone) -->
            <div :class="['record-player', `group-${group.id}`, { 'spinning': group.isSpinning }]" @dragover.prevent
                @drop.prevent="(e) => handleDrop(e, group)">
                <div :class="`color-indicator group-${group.id}-color`"></div>
            </div>

            <!-- Draggable Discs -->
            <div class="flex gap-2">
                <div v-for="disc in getGroupDiscs(group.id)" :key="disc.id"
                    :class="['mini-disc', `group-${disc.group}-disc`]" draggable="true"
                    @dragstart="(e) => startDrag(e, disc)" v-show="!disc.hidden">
                    V{{ disc.id }}
                </div>
            </div>

            <!-- Volume Control -->
            <div class="flex flex-col items-center">
                <input type="range" min="0" max="120" step="10" @change="(e) => setVolume(group.id, e.target.value)"
                    class="volume-slider-vertical" />
                <span>{{ group.label }}</span>
            </div>
        </div>

        <!-- Controls -->
        <div class="controls space-y-4">
            <select v-model="currentMix" @change="changeMix">
                <option value="mix1">Mix 1</option>
                <option value="mix2">Mix 2</option>
            </select>

            <div class="instrument-selector">
                <select v-model="currentInstrument">
                    <option value="">Add Instrument...</option>
                    <option v-for="inst in availableInstruments" :key="inst.id" :value="inst.id">
                        {{ inst.label }}
                    </option>
                </select>
                <button @click="addInstrument" :disabled="!currentInstrument" class="add-instrument-button">
                    Add
                </button>
            </div>

            <div class="action-buttons">
                <el-button @click="toggleBackingVocals"
                    :class="['backing-vocal-button', { 'active': backingVocalEnabled }]">
                    {{ backingVocalEnabled ? 'Remove' : 'Add' }} Vocals
                </el-button>

                <button @click="toggleMainBackingTrack"
                    :class="['main-backing-track-button', { 'active': mainBackingTrackEnabled }]">
                    {{ mainBackingTrackEnabled ? 'Disable' : 'Enable' }} Main Backing Track
                </button>

                <el-button @click="restartAudio">Restart</el-button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { fadeOutAndStop } from '@/utils/fadeout';

// Audio Context Setup
const audioContext = new (window.AudioContext || window.webkitAudioContext)()

// State Management
const currentMix = ref('mix1')
const currentInstrument = ref('')
const currentDraggedDisc = ref(null)
const audioBuffers = ref({}) // Store decoded audio buffers
const activeSources = ref({}) // Track active audio sources
const backingVocalEnabled = ref(false)
const backingVocalSource = ref(null)
const mainBackingTrackEnabled = ref(false)
const mainBackingTrackSource = ref(null)
const mainTrack = 'main1.mp3'

// Configuration
const instrumentConfig = [
    { id: 1, color: '#11b011', audioPrefix: 'Drums', label: 'Drums' },
    { id: 2, color: '#1c0eb7', audioPrefix: 'Bass', label: 'Bass' },
    { id: 3, color: '#9932CC', audioPrefix: 'Piano', label: 'Piano' },
    { id: 4, color: '#b01111', audioPrefix: 'Cello', label: 'Cello' },
    { id: 5, color: '#FFA500', audioPrefix: 'Perc', label: 'Perc' },
    { id: 6, color: '#FF1493', audioPrefix: 'Top', label: 'Top' },
    { id: 7, color: '#00CED1', audioPrefix: 'Violin', label: 'Violin' },
    { id: 8, color: '#FFD700', audioPrefix: 'Vocal', label: 'Vocal' }
]

// Utility Functions
function generateInitialDiscs(group) {
    return Array.from({ length: 4 }, (_, i) => ({
        id: `${group.id}-${i + 1}`, // Unique ID combining group and local index
        group: group.id,
        index: i,
        hidden: false,
        audioIndex: i + 1 // Reset to 1-4 for each group
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

// Robust Audio Loading Function
async function loadAudioBuffer(url) {
    try {
        // Check if buffer is already cached
        if (audioBuffers.value[url]) {
            return audioBuffers.value[url]
        }

        // Fetch the audio file
        const response = await fetch(url)

        // Check if the fetch was successful
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}, url: ${url}`)
        }

        const arrayBuffer = await response.arrayBuffer()

        // Decode the audio data
        const audioBuffer = await new Promise((resolve, reject) => {
            audioContext.decodeAudioData(
                arrayBuffer,
                (buffer) => resolve(buffer),
                (error) => {
                    console.error(`Decoding error for ${url}:`, error)
                    reject(error)
                }
            )
        })

        // Cache the buffer
        audioBuffers.value[url] = audioBuffer
        return audioBuffer
    } catch (error) {
        console.error(`Audio loading error for ${url}:`, error)
        throw error
    }
}

// Audio Playback Function
async function playGroupAudio(group) {
    if (!group.currentDiscId) return

    try {
        const audioUrl = getAudioUrl(group)
        const audioBuffer = await loadAudioBuffer(audioUrl)

        // Stop any existing source for this group
        stopGroupAudio(group)

        // Create new source and gain node
        const source = audioContext.createBufferSource()
        const gainNode = audioContext.createGain()

        source.buffer = audioBuffer
        source.loop = true
        gainNode.gain.value = 0.5

        source.connect(gainNode)
        gainNode.connect(audioContext.destination)

        // Start the source
        source.start()

        // Update group state
        group.source = source
        group.gainNode = gainNode
        group.isSpinning = true

        // Track the active source
        activeSources.value[group.id] = { source, gainNode }
    } catch (error) {
        console.error('Audio playback failed:', error)
        group.isSpinning = false
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
    return `../src/assets/music/${currentMix.value}/${group.audioPrefix}${disc?.audioIndex || 1}.mp3`
}

// Get Discs for a Specific Group
function getGroupDiscs(groupId) {
    return discs.value.filter(d => d.group === groupId)
}

// Computed Properties

const availableInstruments = computed(() => {
    const currentIds = groups.value.map(g => g.id)
    return instrumentConfig.filter(inst => !currentIds.includes(inst.id))
})

// Drag and Drop Handlers
function startDrag(e, disc) {
    currentDraggedDisc.value = disc
}

async function handleDrop(e, group) {
    const disc = currentDraggedDisc.value
    if (!disc || disc.group !== group.id) return

    // Find if the group already has a current disc
    const previouslyDroppedDisc = discs.value.find(
        d => d.group === group.id && d.id === group.currentDiscId
    )

    // If there was a previously dropped disc, make it visible again
    if (previouslyDroppedDisc) {
        previouslyDroppedDisc.hidden = false
    }

    // Hide current disc and update group state
    disc.hidden = true
    group.currentDiscId = disc.id

    // Play the audio for this group
    await playGroupAudio(group)

    currentDraggedDisc.value = null
}

// Add Instrument Function
// Add Instrument Function
function addInstrument() {
    if (!currentInstrument.value) return

    const instrument = instrumentConfig.find(
        inst => inst.id === parseInt(currentInstrument.value)
    )

    if (instrument) {
        // Find and reset any previously dropped discs from this instrument group
        const previousGroupDiscs = discs.value.filter(d => d.group === instrument.id && d.hidden)
        previousGroupDiscs.forEach(disc => {
            disc.hidden = false
        })

        // If no previously dropped discs exist, create new discs
        if (previousGroupDiscs.length === 0) {
            const currentMaxId = Math.max(...discs.value.map(d => parseInt(d.id.split('-')[1])), 0)
            const newDiscs = generateInitialDiscs({
                ...instrument,
                id: groups.value.length + 1 // Use next available group ID
            }).map(disc => ({
                ...disc,
                id: `${groups.value.length + 1}-${disc.index + 1}`
            }))
            discs.value.push(...newDiscs)
        }

        // Create new group
        const newGroup = {
            ...instrument,
            id: groups.value.length + 1,
            isSpinning: false,
            currentDiscId: null,
            source: null,
            gainNode: null
        }
        groups.value.push(newGroup)

        // Reset current instrument selection
        currentInstrument.value = ''
    }
}


// Mix Change Handler
function changeMix() {
    // Stop all current audio sources
    groups.value.forEach(group => {
        stopGroupAudio(group)
        group.isSpinning = false
        group.currentDiscId = null
    })

    // Reset disc visibility
    discs.value.forEach(disc => disc.hidden = false)
}

// Comprehensive Restart Function
function restartAudio() {
    // Stop all current audio sources
    groups.value.forEach(group => {
        stopGroupAudio(group)
        group.isSpinning = false
        group.currentDiscId = null
    })

    // Reset disc visibility
    discs.value.forEach(disc => disc.hidden = false)

    // Restart all initially active tracks
    groups.value.forEach(async (group) => {
        const initialDisc = discs.value.find(d => d.group === group.id)
        if (initialDisc) {
            initialDisc.hidden = true
            group.currentDiscId = initialDisc.id
            await playGroupAudio(group)
        }
    })
}

// Volume Control
function setVolume(groupId, value) {
    const group = groups.value.find(g => g.id === groupId)
    if (group?.gainNode) {
        group.gainNode.gain.value = (value !== undefined ? value : 50) / 100
    }
}

async function toggleBackingVocals() {
    try {
        // If backing vocals are currently playing, stop them
        if (backingVocalEnabled.value) {
            if (backingVocalSource.value) {
                try {
                    backingVocalSource.value.stop()
                    backingVocalSource.value.disconnect()
                } catch (error) {
                    console.warn('Error stopping backing vocal source:', error)
                }
                backingVocalSource.value = null
            }
            backingVocalEnabled.value = false
            return
        }

        // Restart all audio to ensure sync, but not the backing tracks themselves
        await restartAllAudioInSync(false)

        // Load the backing vocal audio
        const audioUrl = `../src/assets/music/${currentMix.value}/main-vocal1.mp3`
        const audioBuffer = await loadAudioBuffer(audioUrl)

        // Create source and gain node
        const source = audioContext.createBufferSource()
        const gainNode = audioContext.createGain()

        source.buffer = audioBuffer
        source.loop = true
        gainNode.gain.value = 1.0

        source.connect(gainNode)
        gainNode.connect(audioContext.destination)

        // Start the backing vocal
        source.start()

        // Store the source and mark as enabled
        backingVocalSource.value = source
        backingVocalEnabled.value = true
    } catch (error) {
        console.error('Backing vocal playback failed:', error)
        backingVocalEnabled.value = false
    }
}

async function toggleMainBackingTrack() {
    try {
        // If main backing track is currently playing, stop it
        if (mainBackingTrackEnabled.value) {
            if (mainBackingTrackSource.value) {
                try {
                    mainBackingTrackSource.value.stop()
                    mainBackingTrackSource.value.disconnect()
                } catch (error) {
                    console.warn('Error stopping main backing track source:', error)
                }
                mainBackingTrackSource.value = null
            }
            mainBackingTrackEnabled.value = false
            return
        }

        // Restart all audio to ensure sync, but not the backing tracks themselves
        await restartAllAudioInSync(false)

        // Load the main backing track audio
        const audioUrl = `../src/assets/music/${currentMix.value}/${mainTrack}`
        const audioBuffer = await loadAudioBuffer(audioUrl)

        // Create source and gain node
        const source = audioContext.createBufferSource()
        const gainNode = audioContext.createGain()

        source.buffer = audioBuffer
        source.loop = true
        gainNode.gain.value = 0.5

        source.connect(gainNode)
        gainNode.connect(audioContext.destination)

        // Start the main backing track
        source.start()

        // Store the source and mark as enabled
        mainBackingTrackSource.value = source
        mainBackingTrackEnabled.value = true
    } catch (error) {
        console.error('Main backing track playback failed:', error)
        mainBackingTrackEnabled.value = false
    }
}

// Modify restartAllAudioInSync to optionally preserve backing tracks
async function restartAllAudioInSync(resetBackingTracks = true) {
    // Stop all current audio sources
    groups.value.forEach(group => {
        stopGroupAudio(group)
        group.isSpinning = false
        group.currentDiscId = null
    })

    // Reset disc visibility
    discs.value.forEach(disc => disc.hidden = false)

    // Optionally stop backing tracks
    if (resetBackingTracks) {
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

        if (mainBackingTrackSource.value) {
            try {
                mainBackingTrackSource.value.stop()
                mainBackingTrackSource.value.disconnect()
            } catch (error) {
                console.warn('Error stopping main backing track source:', error)
            }
            mainBackingTrackSource.value = null
            mainBackingTrackEnabled.value = false
        }
    }

    // Calculate a common start time
    const commonStartTime = audioContext.currentTime + 0.1

    // Restart all tracks at the same time
    const restartPromises = groups.value.map(async (group) => {
        const initialDisc = discs.value.find(d => d.group === group.id)
        if (initialDisc) {
            initialDisc.hidden = true
            group.currentDiscId = initialDisc.id

            try {
                const audioUrl = getAudioUrl(group)
                const audioBuffer = await loadAudioBuffer(audioUrl)

                const source = audioContext.createBufferSource()
                const gainNode = audioContext.createGain()

                source.buffer = audioBuffer
                source.loop = true
                gainNode.gain.value = 0.5

                source.connect(gainNode)
                gainNode.connect(audioContext.destination)

                source.start(commonStartTime)

                group.source = source
                group.gainNode = gainNode
                group.isSpinning = true

                activeSources.value[group.id] = { source, gainNode }
            } catch (error) {
                console.error(`Failed to restart audio for group ${group.id}:`, error)
                group.isSpinning = false
            }
        }
    })

    await Promise.all(restartPromises)
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


// Cleanup Function
onUnmounted(() => {
    // Stop all audio sources when component is unmounted
    Object.values(activeSources.value).forEach(({ source, gainNode }) => {
        try {
            source.stop()
            source.disconnect()
            gainNode.disconnect()
        } catch (error) {
            console.warn('Error during cleanup:', error)
        }
    })
})

// Initial Audio Loading
onMounted(async () => {
    await fadeOutAndStop(2000)
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
})
</script>

<style scoped>
.text-black {
    color: #000000;
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
    width: 180px;
    height: 180px;
    border-radius: 50%;
    background-color: #000000;
    margin: 0 auto;
    position: relative;
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
    top: 40%;
    right: 40%;
    left: 40%;
    bottom: 40%;
    border: 3px solid #ffffff;
    border-radius: 50%;
}

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

/* Record images */
.group-1.spinning {
    background-image: url(@/assets/images/records/record1.png);
}

.group-2.spinning {
    background-image: url(@/assets/images/records/record2.png);
}

.group-3.spinning {
    background-image: url(@/assets/images/records/record3.png);
}

.group-4.spinning {
    background-image: url(@/assets/images/records/record4.png);
}

.group-5.spinning {
    background-image: url(@/assets/images/records/record5.png);
}

.group-6.spinning {
    background-image: url(@/assets/images/records/record6.png);
}

.group-7.spinning {
    background-image: url(@/assets/images/records/record7.png);
}

.group-8.spinning {
    background-image: url(@/assets/images/records/record8.png);
}

.group-9.spinning {
    background-image: url(@/assets/images/records/record9.png);
}

.volume-slider-vertical {
    writing-mode: bt-lr;
    /* Bottom to top, left to right */
    appearance: slider-vertical;
    -webkit-appearance: slider-vertical;
    width: 8px;
    height: 150px;
    margin: 10px 0;
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
    background-image: url(@/assets/images/records/record2.png);
    border: 2px solid #b01111;
}

.group-3-disc {
    background-image: url(@/assets/images/records/record3.png);
    border: 2px solid #11b011;
}

.group-4-disc {
    background-image: url(@/assets/images/records/record4.png);
    border: 2px solid #9932CC;
}

.group-5-disc {
    background-image: url(@/assets/images/records/record5.png);
    border: 2px solid #FFA500;
}

.group-6-disc {
    background-image: url(@/assets/images/records/record6.png);
    border: 2px solid #FF1493;
}

.group-7-disc {
    background-image: url(@/assets/images/records/record7.png);
    border: 2px solid #00CED1;
}

.group-8-disc {
    background-image: url(@/assets/images/records/record8.png);
    border: 2px solid #FFD700;
}

.group-9-disc {
    background-image: url(@/assets/images/records/record9.png);
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

.add-instrument-button {
    padding: 8px 16px;
    border-radius: 4px;
    background-color: #4CAF50;
    color: white;
    border: none;
    cursor: pointer;
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
</style>