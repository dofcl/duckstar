<template>
    <h1 class="pa-0 ma-0 text-white">Create a Song</h1>
    <p class="text-white text-sm text-center mt-0 pt-0">Drag the records onto the record player.</p>
    <div class="dj-app px-2 mt-0 mt-0">
        <div v-for="group in groups" :key="group.id" class="instrument-group my-2">

            <div class="flex justify-center mt-0 pt-0 mb-0 relative">
                <el-button v-if="groups.length > 1" @click="removeInstrument(group.id)" class="remove-instrument-btn"
                    size="small" type="danger" circle>
                    <el-icon>
                        <Delete />
                    </el-icon>
                </el-button>

                <input type="range" min="0" max="120" step="10" @change="(e) => setVolume(group.id, e.target.value)"
                    class="volume-slider-horizontal mt-2" />


                <span class="text-white slider-title coiny">{{ group.label }}<span vif="group.currentDiscId">:
                        v{{ group.currentDiscId?.slice(2) }}</span></span>
            </div>
            <div class="grid grid-cols-3  items-center mt-0 pt-0 mt-5 pt-5">
                <!-- Record Player (Drop Zone) -->
                <div :class="['record-player', `group-${group.id}`, { 'spinning': group.isSpinning }]" @dragover.prevent
                    @drop.prevent="(e) => handleDrop(e, group)">
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

        <div class="text-center mt-4">
            <el-button v-if="!isPlaying" @click="restartAudio" size="large"><el-icon>
                    <VideoPlay />
                </el-icon></el-button>
            <el-button v-else @click="pausePlay" size="large" class="play-all-button">
                <el-icon>
                    <VideoPause />
                </el-icon>
            </el-button>
        </div>

        <!-- Controls -->
        <p class="text-white text-center ma-0 pa-0 mt-4">Add instrument layer</p>
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

    <hr>
    <div class="action-buttons mx-auto text-center mt-0 pt-0">
        <p class="text-white text-center ma-0 pa-0 ma-0 pa-0 mb-1" v-if="instrumentsSelected < 3">
            Add at least {{ 3 - instrumentsSelected }} layers to sent to producer<br>
        </p>
        <el-button v-if="!produced" @click="showProducerDialog = true" size="large" class="mt-2"
            :type="instrumentsSelected < 3 ? 'default' : 'primary'" :disabled="instrumentsSelected < 3">
            Send to Producer
        </el-button>



        <div v-if="produced">
            <p class="text-white">Producers added effects:</p>
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

    </div>
    <hr class="mt-8">
    <div class="recording-controls mx-auto pa-4 text-center">




        <el-button @click="isRecording ? stopRecording() : startRecording()"
            :class="['record-button', { 'recording': isRecording }]" size="large" type="primary">
            {{ isRecording ? 'Stop Saving' : 'Save' }}
        </el-button>
    </div>

    <br>
    <el-dialog title="Producer" v-model="showProducerDialog" width="80%" :before-close="handleCloseProducer">
        <div class="mx-auto text-center">
            <p>Great start!</p>

            <p>Let me add some post polish and give you and example vocal track to help you get started.</p>
            <p>Do whay lyrics do you want?</p>
            <el-input placeholder="Lyrics" v-model="lyrics"></el-input>
            <hr>
            <span slot="footer" class="dialog-footer mt-8">
                <el-button @click="showProducerDialog = false">Not yet</el-button>
                <el-button type="primary" @click="handleConfirmProducer">Do your thing!</el-button>
            </span>
        </div>
    </el-dialog>

</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { fadeOutAndStop } from '@/utils/fadeout';
import { tr } from 'element-plus/es/locale/index.mjs';

// Audio Context Setup
const audioContext = new (window.AudioContext || window.webkitAudioContext)()

// State Management
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
const mainTrack = 'main1.mp3'
const instrumentsSelected = ref(1)
const isPlaying = ref(false)
const isDragging = ref(false)
const touchStartPos = ref({ x: 0, y: 0 })
const dragClone = ref(null)
const showProducerDialog = ref(true)
const produced = ref(false)
const lyrics = ref('')

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
        const audioUrl = rl = new URL(`../assets/music/${newMix}/${disc.audioPrefix}${disc.audioIndex}.mp3`, import.meta.url).href
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
        gainNode.gain.value = 0.5;

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

// Add this to your script section
function removeInstrument(groupId) {
    // Stop audio for the group
    const group = groups.value.find(g => g.id === groupId)
    if (group) {
        stopGroupAudio(group)
    }

    // Remove the group
    groups.value = groups.value.filter(g => g.id !== groupId)

    // Reset discs for this group to visible
    discs.value.forEach(disc => {
        if (disc.group === groupId) {
            disc.hidden = false
        }
    })

    // Update instrument count
    instrumentsSelected.value = Math.max(1, instrumentsSelected.value - 1)

    // If we're below 3 instruments now, disable vocals and polish if they're enabled
    if (instrumentsSelected.value < 3) {
        if (backingVocalEnabled.value) {
            toggleBackingVocals()
        }
        if (mainBackingTrackEnabled.value) {
            toggleMainBackingTrack()
        }
        produced.value = false
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

// Update the restartAudio function
async function restartAudio() {
    try {
        isPlaying.value = true;

        // Store current states
        const wasVocalEnabled = backingVocalEnabled.value;
        const wasMainTrackEnabled = mainBackingTrackEnabled.value;

        // Stop everything first
        groups.value.forEach(group => {
            if (group.source) {
                group.source.stop();
                group.source.disconnect();
            }
            if (group.gainNode) {
                group.gainNode.disconnect();
            }
            group.source = null;
            group.gainNode = null;
            group.isSpinning = false;
        });

        // Resume audioContext if suspended
        if (audioContext.state === 'suspended') {
            await audioContext.resume();
        }

        // Calculate a common start time
        const commonStartTime = audioContext.currentTime + 0.1;

        // Start all active tracks
        for (const group of groups.value) {
            if (group.currentDiscId) {
                const audioUrl = getAudioUrl(group);
                const audioBuffer = await loadAudioBuffer(audioUrl);

                const source = audioContext.createBufferSource();
                const gainNode = audioContext.createGain();

                source.buffer = audioBuffer;
                source.loop = true;
                gainNode.gain.value = 0.5;

                source.connect(gainNode);
                gainNode.connect(audioContext.destination);

                source.start(commonStartTime);

                group.source = source;
                group.gainNode = gainNode;
                group.isSpinning = true;
            }
        }

        // Restore backing tracks if they were enabled
        if (wasVocalEnabled) {
            setTimeout(() => toggleBackingVocals(), 100);
        }
        if (wasMainTrackEnabled) {
            setTimeout(() => toggleMainBackingTrack(), 100);
        }

    } catch (error) {
        console.error('Error in restartAudio:', error);
        isPlaying.value = false;
    }
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
        if (backingVocalEnabled.value) {
            if (backingVocalSource.value) {
                cleanupAudioSource(backingVocalSource.value, backingVocalSource.value.gainNode)
                backingVocalSource.value = null
            }
            backingVocalEnabled.value = false
            audioSourceMap.value.delete('backingVocal')
            return
        }

        const audioUrl = new URL(`../assets/music/${currentMix.value}/main-vocal1.mp3`, import.meta.url).href
        const audioBuffer = await loadAudioBuffer(audioUrl)

        const source = audioContext.createBufferSource()
        const gainNode = audioContext.createGain()

        source.buffer = audioBuffer
        source.loop = true
        gainNode.gain.value = 1.0

        source.connect(gainNode)
        gainNode.connect(audioContext.destination)

        source.start()

        backingVocalSource.value = source
        backingVocalEnabled.value = true

        // Track the source
        audioSourceMap.value.set('backingVocal', { source, gainNode })
    } catch (error) {
        console.error('Backing vocal playback failed:', error)
        backingVocalEnabled.value = false
    }
}

// Updated toggleMainBackingTrack function
async function toggleMainBackingTrack() {
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

        const audioUrl = new URL(`../assets/music/${currentMix.value}/${mainTrack}`, import.meta.url).href
        const audioBuffer = await loadAudioBuffer(audioUrl)

        const source = audioContext.createBufferSource()
        const gainNode = audioContext.createGain()

        source.buffer = audioBuffer
        source.loop = true
        gainNode.gain.value = 0.5

        source.connect(gainNode)
        gainNode.connect(audioContext.destination)

        source.start()

        mainBackingTrackSource.value = source
        mainBackingTrackEnabled.value = true

        // Track the source
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

async function handleDrop(e, group) {
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

    // Play the audio
    await playGroupAudio(group);

    isPlaying.value = true;
    isDragging.value = false;
    currentDraggedDisc.value = null;

    // Clean up clone if it exists
    if (dragClone.value) {
        dragClone.value.remove();
        dragClone.value = null;
    }
}

// Pause/Play Toggle Function
async function pausePlay() {
    try {
        if (isPlaying.value) {
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
        } else {
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
                gainNode.gain.value = 0.5
                
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

function handleCloseProducer() {
    showProducerDialog.value = false
}

function handleConfirmProducer() {
    toggleBackingVocals()
    toggleMainBackingTrack()
    produced.value = true
    showProducerDialog.value = false

}


// Initial Audio Loading
onMounted(async () => {
    await fadeOutAndStop(2000)
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
    right: 16px;
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