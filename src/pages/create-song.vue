<template>
    <div class="box">
        <div class="box1">
            <div v-for="(record, i) in records" :key="i"
                :class="[`record${record.group}${record.suffix}`, { 'record1spin': record.isSpinning && record.group === 1, 'record2spin': record.isSpinning && record.group === 2, 'record3spin': record.isSpinning && record.group === 3 }]"
                @dragover.prevent @drop.prevent="(e) => handleDrop(e, record)">
                <div :class="`record${record.group}color`"></div>
            </div>
        </div>

        <div class="box2">
            <div v-for="(range, i) in ranges" :key="i" :class="`range${i + 1}`">
                <input type="range" min="0" max="100" step="1" @change="e => setVolume(i + 1, e.target.value)" />
            </div>
        </div>

        <div class="box3">
            <template v-for="n in 15" :key="n">
                <div :class="`disc${n}`" draggable="true" @dragstart="(e) => handleDragStart(e, n)"
                    @drag="() => handleDrag(n)" :style="{ display: discStates[n - 1].hidden ? 'none' : 'block' }"></div>
            </template>
        </div>

        <div class="cat1"></div>
        <div class="cat2"></div>
        <div class="box5">DRAG MINI RECORDS UP TO MATCHING COLOR
            <el-button @click="addVocals">Add Vocal</el-button>
        </div>


        <audio id="vocal1" src="../src/assets/music/Vocal3.mp3"></audio>
    </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { fadeOutAndStop, initAudio } from '@/utils/fadeout'
export default {
    name: 'DjApp',
    setup() {
        const audioElements = ref({})
        const discStates = ref(Array(15).fill().map(() => ({ hidden: false })))
        const ranges = ref([1, 2, 3])
        const currentDraggedDisc = ref(null)

        const records = ref([
            { group: 1, suffix: '', acceptDisc: 1, isSpinning: false },
            { group: 1, suffix: 'a', acceptDisc: 2, isSpinning: false },
            { group: 1, suffix: 'b', acceptDisc: 3, isSpinning: false },
            { group: 1, suffix: 'c', acceptDisc: 4, isSpinning: false },
            { group: 1, suffix: 'd', acceptDisc: 5, isSpinning: false },
            { group: 2, suffix: '', acceptDisc: 6, isSpinning: false },
            { group: 2, suffix: 'a', acceptDisc: 7, isSpinning: false },
            { group: 2, suffix: 'b', acceptDisc: 8, isSpinning: false },
            { group: 2, suffix: 'c', acceptDisc: 9, isSpinning: false },
            { group: 2, suffix: 'd', acceptDisc: 10, isSpinning: false },
            { group: 3, suffix: '', acceptDisc: 11, isSpinning: false },
            { group: 3, suffix: 'a', acceptDisc: 12, isSpinning: false },
            { group: 3, suffix: 'b', acceptDisc: 13, isSpinning: false },
            { group: 3, suffix: 'c', acceptDisc: 14, isSpinning: false },
            { group: 3, suffix: 'd', acceptDisc: 15, isSpinning: false }
        ])

        const handleTransition = async () => {
            await fadeOutAndStop(2000); // Fade out over 2 seconds
        }

        onMounted(() => {
            initAudio();
            handleTransition();
            // Initialize looping audio elements
            for (let i = 1; i <= 5; i++) {
                audioElements.value[`audio${i}`] = new Audio(`../src/assets/music/bass${i}.mp3`)
                console.log(audioElements.value[`audio${i}`])

            }
            for (let i = 6; i <= 10; i++) {
                audioElements.value[`audio${i}`] = new Audio(`../src/assets/music/cello${i-5}.mp3`)
                audioElements.value[`audio${i}`].loop = true
            }
            for (let i = 11; i <= 15; i++) {
                audioElements.value[`audio${i}`] = new Audio(`../src/assets/music/drums-${i-11}.mp3`)
                audioElements.value[`audio${i}`].loop = true
            }

        })

        const handleDrag = (discNum) => {
            records.value.forEach((record, i) => {
                if (record.acceptDisc === discNum) {
                    const recordDiv = document.querySelector(`.record${record.group}${record.suffix}`)
                    if (recordDiv) {
                        recordDiv.style.zIndex = '999'
                    }
                } else {
                    const recordDiv = document.querySelector(`.record${record.group}${record.suffix}`)
                    if (recordDiv) {
                        recordDiv.style.zIndex = '888'
                    }
                }
            })
        }

        const handleDragStart = (e, discNum) => {
            currentDraggedDisc.value = discNum
            handleDrag(discNum)

            const disc = document.querySelector(`.disc${discNum}`)
            if (disc) {
                disc.style.zIndex = '9999'
            }
        }

        const handleDrop = async (e, record) => {
            e.preventDefault()
            if (!currentDraggedDisc.value) return

            const discNum = currentDraggedDisc.value
            if (discNum !== record.acceptDisc) return

            // Hide the dragged disc
            discStates.value[discNum - 1] = { hidden: true }

            // Find record index and update spinning state
            const recordIndex = records.value.findIndex(r =>
                r.group === record.group && r.suffix === record.suffix
            )

            if (recordIndex !== -1) {
                // Stop spinning and audio for all records in the same group
                records.value.forEach((r, i) => {
                    if (r.group === record.group) {
                        records.value[i] = { ...r, isSpinning: false }
                    }
                })

                // Update the dropped record to spin
                records.value[recordIndex] = {
                    ...records.value[recordIndex],
                    isSpinning: true
                }

                try {
                    // Stop all audio in the group
                    const groupStart = (record.group - 1) * 5 + 1
                    for (let i = groupStart; i < groupStart + 5; i++) {
                        if (audioElements.value[`audio${i}`]) {
                            audioElements.value[`audio${i}`].pause()
                            audioElements.value[`audio${i}`].currentTime = 0
                        }
                    }

                    // Play the new audio
                    const audio = audioElements.value[`audio${discNum}`]
                    console.log(audio)
                    if (audio) {
                        audio.currentTime = 0
                        audio.volume = 0.5
                        await audio.play()
                    }
                } catch (error) {
                    console.error('Audio playback failed:', error)
                }
            }

            currentDraggedDisc.value = null
        }

        const setVolume = (group, value) => {
            const volumeLevel = value / 100
            const start = (group - 1) * 5 + 1
            for (let i = start; i < start + 5; i++) {
                if (audioElements.value[`audio${i}`]) {
                    audioElements.value[`audio${i}`].volume = volumeLevel
                }
            }
        }

        const addVocals = () => {
            console.log('Add vocals');
            const vocal = document.getElementById('vocal1');
            if (vocal) {
                vocal.play();
            }

            console.log('sync', records.value)
            Object.values(records.value).forEach(record => {
                if (record.isSpinning) {
                    const audio = audioElements.value[`audio${record.acceptDisc}`];
                    if (audio) {
                        console.log(audio);
                        audio.pause();
                        audio.currentTime = 0;  
                        audio.play();
                    }
                }
            });
            if (vocal) {
                vocal.currentTime = 0;
                vocal.play();
            }

            handleTransition();
        };


        const playAudio = (n) => {
            const audio = audioElements.value[`audioz${n}`]
            if (audio.paused) {
                audio.play()
            } else {
                audio.pause()
                audio.currentTime = 0
                audio.play()
            }
        }

        return {
            records,
            ranges,
            discStates,
            handleDrag,
            handleDragStart,
            handleDrop,
            setVolume,
            playAudio,
            addVocals
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
}

.box1 {
    position: absolute;
    top: 0;
    left: 0;
    width: 640px;
    height: 220px;
}

.record1,
.record1a,
.record1b,
.record1c,
.record1d {
    position: absolute;
    top: 10px;
    left: 10px;
    width: 200px;
    bottom: 10px;
    border-radius: 50%;
    background-color: #000000;
}

.record1spin {
    position: absolute;
    top: 10px;
    left: 10px;
    width: 200px;
    bottom: 10px;
    border-radius: 50%;
    background-color: #000000;
    animation: tim1 5s linear infinite;
    background-image: url(@/assets/images/records/record1.png);
    background-size: 100% 100%;
}

@keyframes tim1 {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}

.record2spin {
    position: absolute;
    top: 10px;
    left: 220px;
    width: 200px;
    bottom: 10px;
    border-radius: 50%;
    background-color: #000000;
    animation: tim2 5s linear infinite;
    background-image: url(@/assets/images/records/record2.png);
    background-size: 100% 100%;
}

@keyframes tim2 {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}

.record2,
.record2a,
.record2b,
.record2c,
.record2d {
    position: absolute;
    top: 10px;
    left: 220px;
    width: 200px;
    bottom: 10px;
    border-radius: 50%;
    background-color: #000000;
}

.record3,
.record3a,
.record3b,
.record3c,
.record3d {
    position: absolute;
    top: 10px;
    left: 430px;
    width: 200px;
    bottom: 10px;
    border-radius: 50%;
    background-color: #000000;
}

.record3spin {
    position: absolute;
    top: 10px;
    left: 430px;
    width: 200px;
    bottom: 10px;
    border-radius: 50%;
    background-color: #000000;
    animation: tim3 5s linear infinite;
    background-image: url(@/assets/images/records/record3.png);
    background-size: 100% 100%;
}

@keyframes tim3 {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}

.box2 {
    position: absolute;
    top: 220px;
    left: 0;
    width: 640px;
    height: 50px;
}

.range1 {
    position: absolute;
    top: 0;
    left: 0;
    width: 213px;
    bottom: 0;
    display: flex;
    justify-content: center;
    align-items: center;
}

.range2 {
    position: absolute;
    top: 0;
    left: 213px;
    width: 213px;
    bottom: 0;
    display: flex;
    justify-content: center;
    align-items: center;
}

.range3 {
    position: absolute;
    top: 0;
    left: 426px;
    right: 0;
    bottom: 0;
    display: flex;
    justify-content: center;
    align-items: center;
}

.box3 {
    position: absolute;
    top: 270px;
    left: 0;
    width: 640px;
    height: 120px;
}

.disc1,
.disc2,
.disc3,
.disc4,
.disc5 {
    position: absolute;
    width: 50px;
    height: 50px;
    background-image: url(@/assets/images/records/record1.png);
    background-size: 100% 100%;
    cursor: pointer;
}

.disc1 {
    top: 10px;
    left: 10px;
}

.disc2 {
    top: 10px;
    left: 80px;
}

.disc3 {
    top: 10px;
    left: 150px;
}

.disc4 {
    top: 60px;
    left: 40px;
}

.disc5 {
    top: 60px;
    left: 115px;
}

.disc6,
.disc7,
.disc8,
.disc9,
.disc10 {
    position: absolute;
    width: 50px;
    height: 50px;
    background-image: url(@/assets/images/records/record2.png);
    background-size: 100% 100%;
    cursor: pointer;
}

.disc6 {
    top: 10px;
    left: 230px;
}

.disc7 {
    top: 10px;
    left: 300px;
}

.disc8 {
    top: 10px;
    left: 370px;
}

.disc9 {
    top: 60px;
    left: 260px;
}

.disc10 {
    top: 60px;
    left: 335px;
}

.disc11,
.disc12,
.disc13,
.disc14,
.disc15 {
    position: absolute;
    width: 50px;
    height: 50px;
    background-image: url(@/assets/images/records/record3.png);
    background-size: 100% 100%;
    cursor: pointer;
}

.disc11 {
    top: 10px;
    left: 440px;
}

.disc12 {
    top: 10px;
    left: 510px;
}

.disc13 {
    top: 10px;
    left: 580px;
}

.disc14 {
    top: 60px;
    left: 470px;
}

.disc15 {
    top: 60px;
    left: 545px;
}

.record1color {
    position: absolute;
    top: 40%;
    right: 40%;
    left: 40%;
    bottom: 40%;
    background-color: #1c0eb7;
    border: 3px solid #ffffff;
    border-radius: 50%;
}

.record2color {
    position: absolute;
    top: 40%;
    right: 40%;
    left: 40%;
    bottom: 40%;
    background-color: #b01111;
    border: 3px solid #ffffff;
    border-radius: 50%;
}

.record3color {
    position: absolute;
    top: 40%;
    right: 40%;
    left: 40%;
    bottom: 40%;
    background-color: #11b011;
    border: 3px solid #ffffff;
    border-radius: 50%;
}

.box4 {
    position: absolute;
    top: 0;
    width: 40px;
    left: 640px;
    height: 450px;
    text-align: center;
    border-bottom: double 5px #000000;
    border-right: double 5px #000000;
}

.box5 {
    position: absolute;
    top: 390px;
    left: 0;
    width: 640px;
    height: 60px;
    border-bottom: double 5px #000000;
    display: flex;
    justify-content: center;
    align-items: center;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    font-weight: bold;
}
</style>