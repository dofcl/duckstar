<template>
    <h1 class="pa-0 ma-0 text-white">Create a Song</h1>
    <p class="text-white text-sm text-center mt-0 pt-0">Drag the records onto the record player.</p>
    <div class="dj-app px-2 mt-0 mt-0">
        <div v-for="group in groups" :key="group.id" class="instrument-group my-2">
            <div class="flex justify-center mt-0 pt-0 mb-0 relative">
                <span class="text-white slider-title coiny">{{ group.label }}</span>
                <div>
                    <input type="range" min="0" max="120" step="10" @change="(e) => setVolume(group.id, e.target.value)"
                        class="volume-slider-horizontal" />

                </div>
            </div>
            <div class="grid grid-cols-3 gap-2 items-center mt-0 pt-0">
                <!-- Record Player (Drop Zone) -->
                <div :class="['record-player', `group-${group.id}`, { 'spinning': group.isSpinning }]" @dragover.prevent
                    @drop.prevent="(e) => handleDrop(e, group)">
                    <div :class="`color-indicator group-${group.id}-color`"></div>
                    <p class="text-white disc-center flex items-center justify-center h-full">{{ group.currentDiscId }}
                    </p>

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

        <!-- Controls -->
        <p class="text-white text-center ma-0 pa-0 mt-4">Add another instrument layer</p>
        <div class="controls ma-0 pa-0">

            <el-select v-if="enableChangeMix" v-model="currentMix" @change="changeMix" placeholder="Select Mix"
                class="mt-0 pt-0">
                <el-option label="Mix 1" value="mix1"></el-option>
                <el-option label="Mix 2" value="mix2"></el-option>
            </el-select>

            <div class="instrument-selector  mb-4 mt-2 pt-0">

                <el-select v-model="currentInstrument" placeholder="Add Instrument..." size="large"
                    class="w-full instrument-selecta">
                    <el-option v-for="inst in availableInstruments" :key="inst.id" :label="inst.label"
                        :value="inst.id"></el-option>
                </el-select>
                <el-button @click="addInstrument" :disabled="!currentInstrument" type="primary"
                    class="add-instrument-button" size="large">
                    Add
                </el-button>
            </div>
            <br>
        </div>
    </div>

    <div class="action-buttons mx-auto text-center mt-0 pt-0">
        <p class="text-white ma-0 pa-0 mb-1" v-if="instrumentsSelected < 4">Add {{ 3 - instrumentsSelected }} more layers
            to sent to producer: </p>
        <p class="text-white ma-0 pa-0 mb-1" v-else>Add sent to producer: </p>
        <el-button @click="toggleBackingVocals" :class="['backing-vocal-button', { 'active': backingVocalEnabled }]"
            :disabled="instrumentsSelected < 3" size="large">
            {{ backingVocalEnabled ? 'Remove' : 'Add' }} Vocals
        </el-button>

        <el-button @click="toggleMainBackingTrack"
            :class="['main-backing-track-button', { 'active': mainBackingTrackEnabled }]"
            :disabled="instrumentsSelected < 3" size="large">
            {{ mainBackingTrackEnabled ? 'Remove' : 'Add' }} Polish
        </el-button>

    </div>
    <hr class="mt-8">
    <div class="text-center mt-4">
        <el-button @click="restartAudio" size="large">Replay</el-button>
        <el-button @click="pausePlay" size="large" class="play-all-button"><el-icon>
                <VideoPlay />
            </el-icon></el-button>
    </div>
    <div class="recording-controls mx-auto pa-4 text-center">




        <el-button @click="isRecording ? stopRecording() : startRecording()"
            :class="['record-button', { 'recording': isRecording }]" size="large" type="primary">
            {{ isRecording ? 'Stop Saving' : 'Save' }}
        </el-button>
    </div>

    <br>

</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { fadeOutAndStop } from '@/utils/fadeout';

// Audio Context Setup
const audioContext = new (window.AudioContext || window.webkitAudioContext)()

// State Management
const enableChangeMix = ref(false)
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
const instrumentsSelected = ref(1)
const isPlaying = ref(false)
const isDragging = ref(false)
const touchStartPos = ref({ x: 0, y: 0 })
const dragClone = ref(null)

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

// Function to load audio buffer
const loadAudioBuffer = async (url) => {
    const response = await fetch(url)
    const arrayBuffer = await response.arrayBuffer()
    return await audioContext.decodeAudioData(arrayBuffer)
}

// Watcher to reload audio buffers when currentMix changes
watch(currentMix, async (newMix) => {
    // Reload all audio buffers with the new mix
    for (const disc of discs.value) {
        const audioUrl = rl = new URL(`../assets/music/${newMix}/${disc.audioPrefix}${disc.audioIndex}.mp3`, import.meta.url).href
        const audioBuffer = await loadAudioBuffer(audioUrl)
        audioElements.value[`audio${disc.id}`] = audioBuffer
    }

    // Restart all audio to ensure sync with the new mix
    restartAllAudioInSync()
})
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
    const url = new URL(`../assets/music/${currentMix.value}/${group.audioPrefix}${disc?.audioIndex || 1}.mp3`, import.meta.url).href


    return url
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



// Add Instrument Function
function addInstrument() {
    instrumentsSelected.value += 1
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
        const audioUrl = new URL(`../assets/music/${currentMix.value}/main-vocal1.mp3`, import.meta.url).href
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
        const audioUrl = new URL(`../assets/music/${currentMix.value}/${mainTrack}`, import.meta.url).href
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


// Add these to your existing state management
const isRecording = ref(false)
const mediaRecorder = ref(null)
const audioChunks = ref([])

// Function to start recording
function startRecording() {
    restartAudio()
    try {
        // Create a MediaStream from the audio context
        const destination = audioContext.createMediaStreamDestination()

        // Connect all active sources to the destination
        // Group tracks
        groups.value.forEach(group => {
            if (group.source && group.gainNode) {
                group.gainNode.connect(destination)
            }
        })

        // Backing vocals
        if (backingVocalSource.value) {
            const backingVocalGainNode = audioContext.createGain()
            backingVocalSource.value.connect(backingVocalGainNode)
            backingVocalGainNode.connect(destination)
        }

        // Main backing track
        if (mainBackingTrackSource.value) {
            const mainTrackGainNode = audioContext.createGain()
            mainBackingTrackSource.value.connect(mainTrackGainNode)
            mainTrackGainNode.connect(destination)
        }

        // Create MediaRecorder
        mediaRecorder.value = new MediaRecorder(destination.stream)

        // Event handlers for recording
        mediaRecorder.value.ondataavailable = (event) => {
            audioChunks.value.push(event.data)
        }

        mediaRecorder.value.onstop = () => {
            const audioBlob = new Blob(audioChunks.value, { type: 'audio/mpeg' })
            const audioUrl = URL.createObjectURL(audioBlob)

            // Create a download link
            const downloadLink = document.createElement('a')
            downloadLink.href = audioUrl
            downloadLink.download = `DuckStar_mix_${currentMix}${new Date().toISOString().replace(/[:.]/g, '-')}.mp4`

            // Trigger download
            document.body.appendChild(downloadLink)
            downloadLink.click()
            document.body.removeChild(downloadLink)

            // Clean up
            audioChunks.value = []
            URL.revokeObjectURL(audioUrl)
        }

        // Start recording
        mediaRecorder.value.start()
        isRecording.value = true
    } catch (error) {
        console.error('Recording setup failed:', error)
    }
}

// Function to stop recording
function stopRecording() {
    if (mediaRecorder.value && isRecording.value) {
        mediaRecorder.value.stop()
        isRecording.value = false

        // Disconnect gain nodes
        groups.value.forEach(group => {
            if (group.gainNode) {
                group.gainNode.disconnect()
            }
        })

        if (backingVocalSource.value) {
            backingVocalSource.value.disconnect()
        }

        if (mainBackingTrackSource.value) {
            mainBackingTrackSource.value.disconnect()
        }
    }
}

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

// Update handleDrop to include smoother cleanup
async function handleDrop(e, group) {
    if (!currentDraggedDisc.value) return

    let discId

    if (e.type === 'touchend') {
        const touch = e.changedTouches[0]
        const dropTarget = document.elementFromPoint(touch.clientX, touch.clientY)

        if (!dropTarget?.closest('.record-player')) {
            // Animate clone back to original position or fade out
            if (dragClone.value) {
                dragClone.value.style.transition = 'all 0.3s'
                dragClone.value.style.opacity = '0'
                setTimeout(() => {
                    if (dragClone.value) {
                        dragClone.value.remove()
                        dragClone.value = null
                    }
                }, 300)
            }
            isDragging.value = false
            currentDraggedDisc.value = null
            return
        }

        discId = currentDraggedDisc.value.id

        // Animate clone to final position
        if (dragClone.value) {
            const playerRect = dropTarget.closest('.record-player').getBoundingClientRect()
            dragClone.value.style.transition = 'all 0.3s'
            dragClone.value.style.left = `${playerRect.left}px`
            dragClone.value.style.top = `${playerRect.top}px`
            dragClone.value.style.opacity = '0'

            setTimeout(() => {
                if (dragClone.value) {
                    dragClone.value.remove()
                    dragClone.value = null
                }
            }, 300)
        }
    } else {
        discId = e.dataTransfer.getData('text/plain')
    }

    // Rest of your existing handleDrop code...
    const disc = discs.value.find(d => d.id === discId)
    if (!disc || disc.group !== group.id) return

    const previouslyDroppedDisc = discs.value.find(
        d => d.group === group.id && d.id === group.currentDiscId
    )
    if (previouslyDroppedDisc) {
        previouslyDroppedDisc.hidden = false
    }

    disc.hidden = true
    group.currentDiscId = disc.id
    group.isSpinning = true
    isDragging.value = false

    await playGroupAudio(group)
    currentDraggedDisc.value = null
}


// Pause/Play Toggle Function
function pausePlay() {
    if (isPlaying.value) {
        // Pause all currently playing audio
        Object.values(activeSources.value).forEach(({ source }) => {
            source.stop()
        })
        isPlaying.value = false
    } else {
        // Play all audio from the current state
        Object.keys(audioElements.value).forEach(key => {
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
}

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
.el-select.el-select--large.w-full.instrument-selecta {
    width: 200px;
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
    overflow: hidden;
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
    top: 32%;
    right: 32%;
    left: 32%;
    bottom: 32%;
    border: 1px solid #ffffff;
    border-radius: 50%;
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
</style>