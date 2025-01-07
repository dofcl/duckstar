<template>
    <div class="box">
        <!-- Record players (drop zones) -->
        <div class="box1">
            <div class="record-grid">
                <div v-for="group in groupsConfig" :key="`record-${group.id}`"
                    :class="['record-player', `group-${group.id}`, { 'spinning': group.isSpinning }]"
                    @dragover.prevent @drop.prevent="(e) => handleDrop(e, group)">
                    <div :class="`color-indicator group-${group.id}-color`"></div>
                </div>
            </div>
        </div>

        <!-- Volume sliders -->
        <div class="box2">
            <div class="slider-grid">
                <div v-for="group in groupsConfig" :key="`range-${group.id}`" class="volume-range">
                    <input type="range" min="0" max="100" step="1" @change="e => setVolume(group.id, e.target.value)" />
                </div>
            </div>
        </div>

        <!-- Draggable discs -->
        <div class="box3">
            <div class="disc-grid">
                <div v-for="disc in discs" :key="`disc-${disc.id}`" :class="['mini-disc', `group-${disc.group}-disc`]"
                    draggable="true" @dragstart="(e) => handleDragStart(e, disc)" @drag="() => handleDrag(disc)"
                    v-show="!disc.hidden">
                </div>
            </div>
        </div>

        <div class="box5">
            <div class="instructions">DRAG MINI RECORDS UP TO MATCHING COLOR</div>
            <div class="controls">
                <button @click="addVocals" class="vocal-button">Add Vocal</button>
                <div class="instrument-selector">
                    <select v-model="selectedInstrument" class="instrument-select">
                        <option value="">Add Instrument...</option>
                        <option v-for="inst in availableInstrumentsFiltered" :key="inst.id" :value="inst.id">
                            {{ inst.label }}
                        </option>
                    </select>
                    <button @click="addInstrument" class="add-instrument-button" :disabled="!selectedInstrument">
                        Add
                    </button>
                </div>
            </div>
        </div>

        <audio id="vocal1" src="../src/assets/music/Vocal1.mp3"></audio>
    </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { fadeOutAndStop, initAudio } from '@/utils/fadeout'

export default {
    name: 'DjApp',
    setup() {
        // Initial configuration with just drums
        const initialConfig = [
            { 
                id: 3, 
                color: '#11b011', 
                audioPrefix: 'drums', 
                recordsPerGroup: 3,  // This now only affects number of draggable discs
                label: 'Drums',
                isSpinning: false,
                currentDiscId: null
            }
        ]

        // Available instruments that can be added
        const availableInstruments = [
            { id: 1, color: '#1c0eb7', audioPrefix: 'Bass', recordsPerGroup: 3, label: 'Bass' },
            { id: 2, color: '#b01111', audioPrefix: 'Cello', recordsPerGroup: 3, label: 'Cello' },
            { id: 3, color: '#9932CC', audioPrefix: 'Piano', recordsPerGroup: 3, label: 'Piano' },
            { id: 4, color: '#FFA500', audioPrefix: 'Perc', recordsPerGroup: 3, label: 'Perc' },
            { id: 5, color: '#FF1493', audioPrefix: 'Top', recordsPerGroup: 3, label: 'Top' },
            { id: 6, color: '#00CED1', audioPrefix: 'Violin', recordsPerGroup: 3, label: 'Violin' },
            { id: 7, color: '#FFD700', audioPrefix: 'Vocal', recordsPerGroup: 3, label: 'Vocal' }
        ]

        const groupsConfig = ref(initialConfig)
        const audioElements = ref({})
        const currentDraggedDisc = ref(null)
        const trackStartTime = ref(null)  // Track when the first audio started
        const isPlaying = ref(false)      // Global playing state

        // Generate initial discs for a group
        const generateInitialDiscs = (group, startId = 1) => {
            const discsList = []
            for (let i = 0; i < group.recordsPerGroup; i++) {
                discsList.push({
                    id: startId + i,
                    group: group.id,
                    index: i,
                    hidden: false,
                    audioIndex: i + 1
                })
            }
            return discsList
        }

        const discs = ref(generateInitialDiscs(initialConfig[0]))

        // Event handlers
        const handleDrag = (disc) => {
            const recordDiv = document.querySelector(`.group-${disc.group}`)
            if (recordDiv) recordDiv.style.zIndex = '999'
        }

        const handleDragStart = (e, disc) => {
            currentDraggedDisc.value = disc
            handleDrag(disc)
        }

        const handleDrop = async (e, group) => {
            if (!currentDraggedDisc.value || currentDraggedDisc.value.group !== group.id) return

            // If there was a previous disc, unhide it
            if (group.currentDiscId) {
                const previousDiscIndex = discs.value.findIndex(d => d.id === group.currentDiscId)
                if (previousDiscIndex !== -1) {
                    discs.value[previousDiscIndex].hidden = false
                }
            }

            // Hide the newly dropped disc
            const discIndex = discs.value.findIndex(d => d.id === currentDraggedDisc.value.id)
            discs.value[discIndex].hidden = true

            // Stop currently playing audio for this group if any
            if (group.currentDiscId) {
                const audio = audioElements.value[`audio${group.currentDiscId}`]
                if (audio) {
                    audio.pause()
                    audio.currentTime = 0
                }
            }

            // Update group state
            group.isSpinning = true
            group.currentDiscId = currentDraggedDisc.value.id

            // Play new audio in sync
            try {
                const audioId = `audio${currentDraggedDisc.value.id}`
                const audio = audioElements.value[audioId]
                if (audio) {
                    if (!isPlaying.value) {
                        // First audio to play
                        trackStartTime.value = Date.now()
                        isPlaying.value = true
                        audio.currentTime = 0
                    } else {
                        // Sync with existing audio
                        const elapsed = (Date.now() - trackStartTime.value) / 1000
                        const duration = audio.duration
                        audio.currentTime = elapsed % duration
                    }
                    audio.volume = 0.5
                    await audio.play()
                }
            } catch (error) {
                console.error('Audio playback failed:', error)
            }

            currentDraggedDisc.value = null
        }

        const setVolume = (groupId, value) => {
            const group = groupsConfig.value.find(g => g.id === groupId)
            if (group && group.currentDiscId) {
                const audio = audioElements.value[`audio${group.currentDiscId}`]
                if (audio) audio.volume = value / 100
            }
        }

        // Initialize audio elements
        onMounted(() => {
            initAudio()
            handleTransition()

            discs.value.forEach(disc => {
                audioElements.value[`audio${disc.id}`] = new Audio(
                    `../src/assets/music/${groupsConfig.value.find(g => g.id === disc.group).audioPrefix}${disc.audioIndex}.mp3`
                )
                audioElements.value[`audio${disc.id}`].loop = true
            })
        })

        const handleTransition = async () => {
            await fadeOutAndStop(2000)
        }

        const selectedInstrument = ref('')

        const availableInstrumentsFiltered = computed(() => {
            const currentIds = groupsConfig.value.map(g => g.id)
            return availableInstruments.filter(inst => !currentIds.includes(inst.id))
        })

        const addInstrument = () => {
            if (!selectedInstrument.value) return

            const instrument = availableInstruments.find(inst => inst.id === selectedInstrument.value)
            if (instrument) {
                groupsConfig.value = [...groupsConfig.value, {
                    ...instrument,
                    isSpinning: false,
                    currentDiscId: null
                }]
                selectedInstrument.value = ''

                // Generate discs only for the new instrument
                const currentMaxId = Math.max(...discs.value.map(d => d.id), 0)
                const newDiscs = []
                
                for (let i = 0; i < instrument.recordsPerGroup; i++) {
                    newDiscs.push({
                        id: currentMaxId + i + 1,
                        group: instrument.id,
                        index: i,
                        hidden: false,
                        audioIndex: i + 1
                    })
                }
                
                // Add new discs to existing ones
                discs.value = [...discs.value, ...newDiscs]

                // Initialize audio elements for new discs
                newDiscs.forEach(disc => {
                    const audio = new Audio(
                        `../src/assets/music/${groupsConfig.value.find(g => g.id === disc.group).audioPrefix}${disc.audioIndex}.mp3`
                    )
                    audio.loop = true
                    
                    // Add loadedmetadata event listener to handle synchronization after loading
                    audio.addEventListener('loadedmetadata', () => {
                        if (isPlaying.value && trackStartTime.value) {
                            const elapsed = (Date.now() - trackStartTime.value) / 1000
                            audio.currentTime = elapsed % audio.duration
                        }
                    })
                    
                    audioElements.value[`audio${disc.id}`] = audio
                })
            }
        }

        const addVocals = () => {
            const vocal = document.getElementById('vocal1')
            if (vocal) {
                if (!isPlaying.value) {
                    trackStartTime.value = Date.now()
                    isPlaying.value = true
                    vocal.currentTime = 0
                } else {
                    // Sync with existing audio
                    const elapsed = (Date.now() - trackStartTime.value) / 1000
                    vocal.currentTime = elapsed % vocal.duration
                }
                vocal.play()
            }

            // Resync all playing records
            groupsConfig.value.forEach(group => {
                if (group.isSpinning && group.currentDiscId) {
                    const audio = audioElements.value[`audio${group.currentDiscId}`]
                    if (audio) {
                        const elapsed = (Date.now() - trackStartTime.value) / 1000
                        audio.currentTime = elapsed % audio.duration
                        audio.play()
                    }
                }
            })

            handleTransition()
        }

        return {
            groupsConfig,
            discs,
            handleDrag,
            handleDragStart,
            handleDrop,
            setVolume,
            addVocals,
            selectedInstrument,
            availableInstrumentsFiltered,
            addInstrument
        }
    }
}
</script>



<style>
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

.slider-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(3, 1fr);
    gap: 10px;
    max-width: 960px;
    margin: 20px auto;
    padding: 10px;
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