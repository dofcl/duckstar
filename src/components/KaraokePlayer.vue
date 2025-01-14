<!-- KaraokePlayer.vue -->
<template>
    <div class="karaoke-container">
        <ScoreDisplay :currentScore="currentScore" :maxPossibleScore="10000" :combo="combo" :maxCombo="maxCombo"
            :perfectCount="perfectCount" :greatCount="greatCount" :feedback="scoreFeedback"
            :showGrade="isPerformanceComplete" />
        <div class="status-message" v-if="errorMessage">{{ errorMessage }}</div>

        <div class="controls">
            <button @click="togglePlayback" :disabled="!audioLoaded">
                {{ isPlaying ? 'Pause' : 'Play' }}
            </button>
            <button @click="toggleRecording" :class="{ 'recording': isRecording }">
                {{ isRecording ? 'Stop Recording' : 'Start Recording' }}
            </button>
            <div class="time-display">{{ formatTime(currentTime) }}</div>
            <div class="volume-control">
                <label>Volume: </label>
                <input type="range" min="0" max="1" step="0.1" v-model="volume">
            </div>
        </div>

        <div class="lyrics-display">
            <div class="previous-line" v-if="previousLine">{{ previousLine }}</div>
            <div class="current-line">
                <template v-for="(word, index) in currentWords" :key="index">
                    <span :class="{
                        'highlight': isWordActive(word),
                        'passed': isWordPassed(word)
                    }">
                        {{ word.text }}
                    </span>
                </template>
            </div>
            <div class="next-line" v-if="nextLine">{{ nextLine }}</div>
        </div>

        <div class="audio-visualization">
            <canvas ref="visualizer" width="800" height="100"></canvas>
        </div>

        <div v-if="isRecording" class="recording-indicator">
            Recording in progress... Duration: {{ formatTime(recordingDuration) }}
        </div>
    </div>
</template>

<script>
import ScoringSystem from '@/utils/scoringSystem';
import ScoreDisplay from '@/components/ScoreDisplay.vue';

const AUDIO_URL = 'https://producer.duckstar.app/model-a2/YmY2ZjI4YjUtYWIyNy00OTk4LWI1N2QtY2M5MmIyYjlkYzdh.mp3';
const LYRICS_DATA = {
    "code": 200,
    "msg": "success",
    "data": {
        "alignedWords": [
            {
                "word": "Verse 1:\nElon ",
                "success": true,
                "startS": 6.14,
                "endS": 6.5,
                "palign": 0
            },
            {
                "word": "Musk, ",
                "success": true,
                "startS": 6.5,
                "endS": 6.9,
                "palign": 0
            },
            {
                "word": "tech ",
                "success": true,
                "startS": 6.9,
                "endS": 7.14,
                "palign": 0
            },
            {
                "word": "visionary, ",
                "success": true,
                "startS": 7.14,
                "endS": 7.94,
                "palign": 0
            },
            {
                "word": "reaching ",
                "success": true,
                "startS": 7.94,
                "endS": 8.38,
                "palign": 0
            },
            {
                "word": "for ",
                "success": true,
                "startS": 8.38,
                "endS": 8.7,
                "palign": 0
            },
            {
                "word": "the ",
                "success": true,
                "startS": 8.7,
                "endS": 8.86,
                "palign": 0
            },
            {
                "word": "stars\n",
                "success": true,
                "startS": 8.86,
                "endS": 9.18,
                "palign": 0
            },
            {
                "word": "Got ",
                "success": true,
                "startS": 9.18,
                "endS": 9.49,
                "palign": 0
            },
            {
                "word": "his ",
                "success": true,
                "startS": 9.49,
                "endS": 9.65,
                "palign": 0
            },
            {
                "word": "sights ",
                "success": true,
                "startS": 9.65,
                "endS": 9.97,
                "palign": 0
            },
            {
                "word": "set ",
                "success": true,
                "startS": 9.97,
                "endS": 10.17,
                "palign": 0
            },
            {
                "word": "on ",
                "success": true,
                "startS": 10.17,
                "endS": 10.37,
                "palign": 0
            },
            {
                "word": "the ",
                "success": true,
                "startS": 10.37,
                "endS": 10.53,
                "palign": 0
            },
            {
                "word": "Red ",
                "success": true,
                "startS": 10.53,
                "endS": 10.77,
                "palign": 0
            },
            {
                "word": "Planet, ",
                "success": true,
                "startS": 10.77,
                "endS": 11.21,
                "palign": 0
            },
            {
                "word": "taking ",
                "success": true,
                "startS": 11.21,
                "endS": 11.65,
                "palign": 0
            },
            {
                "word": "us ",
                "success": true,
                "startS": 11.65,
                "endS": 11.93,
                "palign": 0
            },
            {
                "word": "to ",
                "success": true,
                "startS": 11.93,
                "endS": 12.13,
                "palign": 0
            },
            {
                "word": "Mars\n",
                "success": true,
                "startS": 12.13,
                "endS": 12.45,
                "palign": 0
            },
            {
                "word": "SpaceX ",
                "success": true,
                "startS": 12.45,
                "endS": 13.28,
                "palign": 0
            },
            {
                "word": "rockets, ",
                "success": true,
                "startS": 13.28,
                "endS": 13.72,
                "palign": 0
            },
            {
                "word": "Starship's ",
                "success": true,
                "startS": 13.72,
                "endS": 14.24,
                "palign": 0
            },
            {
                "word": "might, ",
                "success": true,
                "startS": 14.24,
                "endS": 14.44,
                "palign": 0
            },
            {
                "word": "breaking ",
                "success": true,
                "startS": 14.44,
                "endS": 14.84,
                "palign": 0
            },
            {
                "word": "through ",
                "success": true,
                "startS": 14.84,
                "endS": 15.16,
                "palign": 0
            },
            {
                "word": "the ",
                "success": true,
                "startS": 15.16,
                "endS": 15.32,
                "palign": 0
            },
            {
                "word": "stratosphere\n",
                "success": true,
                "startS": 15.32,
                "endS": 16.08,
                "palign": 0
            },
            {
                "word": "Colonizing ",
                "success": true,
                "startS": 16.08,
                "endS": 16.99,
                "palign": 0
            },
            {
                "word": "distant ",
                "success": true,
                "startS": 16.99,
                "endS": 17.35,
                "palign": 0
            },
            {
                "word": "worlds, ",
                "success": true,
                "startS": 17.35,
                "endS": 17.67,
                "palign": 0
            },
            {
                "word": "the ",
                "success": true,
                "startS": 17.67,
                "endS": 17.79,
                "palign": 0
            },
            {
                "word": "future's ",
                "success": true,
                "startS": 17.79,
                "endS": 18.27,
                "palign": 0
            },
            {
                "word": "drawing ",
                "success": true,
                "startS": 18.27,
                "endS": 18.59,
                "palign": 0
            },
            {
                "word": "near\n\n",
                "success": true,
                "startS": 18.59,
                "endS": 22.26,
                "palign": 0
            },
            {
                "word": "Chorus:\nElon ",
                "success": true,
                "startS": 28.44,
                "endS": 29.76,
                "palign": 0
            },
            {
                "word": "to ",
                "success": true,
                "startS": 29.76,
                "endS": 29.96,
                "palign": 0
            },
            {
                "word": "Mars, ",
                "success": true,
                "startS": 29.96,
                "endS": 32.93,
                "palign": 0
            },
            {
                "word": "a ",
                "success": true,
                "startS": 39.66,
                "endS": 41.68,
                "palign": 0
            },
            {
                "word": "cosmic ",
                "success": true,
                "startS": 45.58,
                "endS": 47.75,
                "palign": 0
            },
            {
                "word": "quest\n",
                "success": true,
                "startS": 47.75,
                "endS": 48.45,
                "palign": 0
            },
            {
                "word": "Silicon ",
                "success": true,
                "startS": 48.52,
                "endS": 49.83,
                "palign": 0
            },
            {
                "word": "Valley's ",
                "success": true,
                "startS": 49.83,
                "endS": 50.67,
                "palign": 0
            },
            {
                "word": "ultimate ",
                "success": true,
                "startS": 50.67,
                "endS": 51.26,
                "palign": 0
            },
            {
                "word": "test\n",
                "success": true,
                "startS": 51.26,
                "endS": 51.9,
                "palign": 0
            },
            {
                "word": "Revolutionizing ",
                "success": true,
                "startS": 51.9,
                "endS": 53.38,
                "palign": 0
            },
            {
                "word": "space, ",
                "success": true,
                "startS": 53.38,
                "endS": 53.78,
                "palign": 0
            },
            {
                "word": "no ",
                "success": true,
                "startS": 53.78,
                "endS": 54.26,
                "palign": 0
            },
            {
                "word": "time ",
                "success": true,
                "startS": 54.26,
                "endS": 54.45,
                "palign": 0
            },
            {
                "word": "to ",
                "success": true,
                "startS": 54.45,
                "endS": 54.69,
                "palign": 0
            },
            {
                "word": "rest\n",
                "success": true,
                "startS": 54.69,
                "endS": 55.21,
                "palign": 0
            },
            {
                "word": "Elon ",
                "success": true,
                "startS": 55.21,
                "endS": 56.13,
                "palign": 0
            },
            {
                "word": "to ",
                "success": true,
                "startS": 56.13,
                "endS": 56.33,
                "palign": 0
            },
            {
                "word": "Mars, ",
                "success": true,
                "startS": 56.33,
                "endS": 56.57,
                "palign": 0
            },
            {
                "word": "humanity's ",
                "success": true,
                "startS": 56.57,
                "endS": 57.41,
                "palign": 0
            },
            {
                "word": "next ",
                "success": true,
                "startS": 57.41,
                "endS": 57.65,
                "palign": 0
            },
            {
                "word": "conquest\n\n",
                "success": true,
                "startS": 57.65,
                "endS": 58.32,
                "palign": 0
            },
            {
                "word": "Verse 2:\nTesla's ",
                "success": true,
                "startS": 58.8,
                "endS": 59.24,
                "palign": 0
            },
            {
                "word": "genius, ",
                "success": true,
                "startS": 59.24,
                "endS": 59.44,
                "palign": 0
            },
            {
                "word": "PayPal's ",
                "success": true,
                "startS": 59.44,
                "endS": 60.12,
                "palign": 0
            },
            {
                "word": "wealth, ",
                "success": true,
                "startS": 60.12,
                "endS": 60.4,
                "palign": 0
            },
            {
                "word": "now ",
                "success": true,
                "startS": 60.4,
                "endS": 60.56,
                "palign": 0
            },
            {
                "word": "he's ",
                "success": true,
                "startS": 60.56,
                "endS": 60.84,
                "palign": 0
            },
            {
                "word": "aiming ",
                "success": true,
                "startS": 60.84,
                "endS": 61.16,
                "palign": 0
            },
            {
                "word": "higher\n",
                "success": true,
                "startS": 61.16,
                "endS": 61.64,
                "palign": 0
            },
            {
                "word": "Martian ",
                "success": true,
                "startS": 61.64,
                "endS": 62.35,
                "palign": 0
            },
            {
                "word": "dreams ",
                "success": true,
                "startS": 62.35,
                "endS": 62.67,
                "palign": 0
            },
            {
                "word": "fuel ",
                "success": true,
                "startS": 62.67,
                "endS": 63.03,
                "palign": 0
            },
            {
                "word": "his ",
                "success": true,
                "startS": 63.03,
                "endS": 63.23,
                "palign": 0
            },
            {
                "word": "fire, ",
                "success": true,
                "startS": 63.23,
                "endS": 63.43,
                "palign": 0
            },
            {
                "word": "ambition ",
                "success": true,
                "startS": 63.43,
                "endS": 63.91,
                "palign": 0
            },
            {
                "word": "never ",
                "success": true,
                "startS": 63.91,
                "endS": 64.35,
                "palign": 0
            },
            {
                "word": "tire\n",
                "success": true,
                "startS": 64.35,
                "endS": 64.91,
                "palign": 0
            },
            {
                "word": "Sustainable ",
                "success": true,
                "startS": 64.91,
                "endS": 65.78,
                "palign": 0
            },
            {
                "word": "living ",
                "success": true,
                "startS": 65.78,
                "endS": 66.14,
                "palign": 0
            },
            {
                "word": "on ",
                "success": true,
                "startS": 66.14,
                "endS": 66.46,
                "palign": 0
            },
            {
                "word": "a ",
                "success": true,
                "startS": 66.46,
                "endS": 66.62,
                "palign": 0
            },
            {
                "word": "planet ",
                "success": true,
                "startS": 66.62,
                "endS": 66.9,
                "palign": 0
            },
            {
                "word": "barren ",
                "success": true,
                "startS": 66.9,
                "endS": 67.46,
                "palign": 0
            },
            {
                "word": "and ",
                "success": true,
                "startS": 67.46,
                "endS": 67.66,
                "palign": 0
            },
            {
                "word": "red\n",
                "success": true,
                "startS": 67.66,
                "endS": 68.14,
                "palign": 0
            },
            {
                "word": "Musk's ",
                "success": true,
                "startS": 68.14,
                "endS": 68.9,
                "palign": 0
            },
            {
                "word": "determination, ",
                "success": true,
                "startS": 68.9,
                "endS": 69.85,
                "palign": 0
            },
            {
                "word": "pushing ",
                "success": true,
                "startS": 69.85,
                "endS": 70.17,
                "palign": 0
            },
            {
                "word": "limits ",
                "success": true,
                "startS": 70.17,
                "endS": 70.81,
                "palign": 0
            },
            {
                "word": "ahead\n\n(",
                "success": true,
                "startS": 70.81,
                "endS": 71.01,
                "palign": 0
            },
            {
                "word": "Repeat Chorus)\n\nOutro:\nFrom ",
                "success": true,
                "startS": 97.9,
                "endS": 98.02,
                "palign": 0
            },
            {
                "word": "Earth ",
                "success": true,
                "startS": 98.02,
                "endS": 98.34,
                "palign": 0
            },
            {
                "word": "to ",
                "success": true,
                "startS": 98.34,
                "endS": 98.66,
                "palign": 0
            },
            {
                "word": "Mars, ",
                "success": true,
                "startS": 98.66,
                "endS": 98.98,
                "palign": 0
            },
            {
                "word": "Elon's ",
                "success": true,
                "startS": 98.98,
                "endS": 176.59,
                "palign": 0
            },
            {
                "word": "legacy\n",
                "success": true,
                "startS": 178.55,
                "endS": 180.08,
                "palign": 0
            },
            {
                "word": "Interplanetary ",
                "success": true,
                "startS": 180.08,
                "endS": 181.4,
                "palign": 0
            },
            {
                "word": "species, ",
                "success": true,
                "startS": 181.4,
                "endS": 181.92,
                "palign": 0
            },
            {
                "word": "that's ",
                "success": true,
                "startS": 181.92,
                "endS": 182.19,
                "palign": 0
            },
            {
                "word": "his ",
                "success": true,
                "startS": 182.19,
                "endS": 182.31,
                "palign": 0
            },
            {
                "word": "prophecy",
                "success": true,
                "startS": 182.31,
                "endS": 198.51,
                "palign": 0
            },
        ],
        "waveformData": [
            0.0028,
            0.00639,
            0.00832,
            0.01072,
            0.0119,
            0.01058,
            0.006,
            0.01309,
            0.01287,
            0.01185,
            0.01786,
            0.04093,
            0.02798,
            0.03802,
            0.02135,
            0.03345,
            0.02286,
            0.03571,
            0.03415,
            0.02462,
            0.00851,
            0.01366,
            0.01828,
            0.04259,
            0.04519,
            0.05328,
            0.04783,
            0.04105,
            0.04207,
            0.07656,
            0.08591,
            0.11294,
            0.10197,
            0.25201,
            0.10504,
            0.1534,
            0.13047,
            0.1038,
            0.08691,
            0.22366,
            0.112,
            0.11407,
            0.12597,
            0.22587,
            0.1034,
            0.10934,
            0.22233,
            0.12748,
            0.11419,
            0.21722,
            0.1275,
            0.13626,
            0.14905,
            0.12345,
            0.03453,
            0.24798,
            0.11144,
            0.13122,
            0.12914,
            0.2344,
            0.1083,
            0.12277,
            0.2381,
            0.12784,
            0.2279,
            0.22487,
            0.12469,
            0.13113,
            0.13769,
            0.12625,
            0.05799,
            0.21148,
            0.11954,
            0.12436,
            0.12987,
            0.22452,
            0.15596,
            0.11684,
            0.21393,
            0.16759,
            0.13174,
            0.19747,
            0.18241,
            0.14378,
            0.12597,
            0.1328,
            0.06209,
            0.19078,
            0.18025,
            0.11596,
            0.13628,
            0.19026,
            0.18333,
            0.13811,
            0.12476,
            0.092,
            0.034,
            0.12225,
            0.2268,
            0.16841,
            0.1499,
            0.155,
            0.12259,
            0.14065,
            0.22433,
            0.12354,
            0.17196,
            0.15724,
            0.22758,
            0.12283,
            0.11085,
            0.24256,
            0.12065,
            0.11728,
            0.24176,
            0.16989,
            0.15828,
            0.1676,
            0.14199,
            0.1042,
            0.25926,
            0.12955,
            0.15079,
            0.15911,
            0.22164,
            0.10252,
            0.13446,
            0.24911,
            0.14426,
            0.23233,
            0.23144,
            0.13706,
            0.16382,
            0.15412,
            0.12841,
            0.06999,
            0.25164,
            0.12387,
            0.1539,
            0.1556,
            0.23286,
            0.15709,
            0.13899,
            0.21308,
            0.12264,
            0.12014,
            0.21512,
            0.16993,
            0.16485,
            0.14362,
            0.14421,
            0.09906,
            0.22849,
            0.18833,
            0.14948,
            0.15994,
            0.23807,
            0.16432,
            0.13338,
            0.06165,
            0.08437,
            0.09789,
            0.18971,
            0.18806,
            0.1294,
            0.13613,
            0.12942,
            0.09566,
            0.1546,
            0.19685,
            0.11236,
            0.14122,
            0.15238,
            0.20151,
            0.11766,
            0.14331,
            0.22792,
            0.13012,
            0.14992,
            0.2371,
            0.13241,
            0.14466,
            0.15134,
            0.09877,
            0.06005,
            0.24265,
            0.10478,
            0.14037,
            0.13956,
            0.22137,
            0.13818,
            0.10891,
            0.24782,
            0.13271,
            0.22912,
            0.25488,
            0.11944,
            0.14073,
            0.14332,
            0.14059,
            0.10774,
            0.23593,
            0.13486,
            0.12323,
            0.14319,
            0.23914,
            0.12939,
            0.10687,
            0.23272,
            0.12037,
            0.14176,
            0.25794,
            0.11199,
            0.15241,
            0.12373,
            0.10755,
            0.07988,
            0.2154,
            0.13922,
            0.1285,
            0.14209,
            0.2299,
            0.15569,
            0.12412,
            0.07315,
            0.07908,
            0.09735,
            0.2178,
            0.16126,
            0.13597,
            0.17988,
            0.14736,
            0.10733,
            0.19441,
            0.17606,
            0.1373,
            0.14334,
            0.19906,
            0.19094,
            0.13216,
            0.1985,
            0.19105,
            0.11601,
            0.18734,
            0.23432,
            0.15374,
            0.18229,
            0.17246,
            0.07538,
            0.15617,
            0.22752,
            0.14946,
            0.1597,
            0.15812,
            0.21611,
            0.13933,
            0.13228,
            0.25095,
            0.16281,
            0.24457,
            0.2659,
            0.14216,
            0.16725,
            0.15868,
            0.10879,
            0.10894,
            0.2179,
            0.11598,
            0.15172,
            0.14121,
            0.24897,
            0.15902,
            0.09921,
            0.23346,
            0.15104,
            0.11441,
            0.26533,
            0.11498,
            0.15803,
            0.17279,
            0.12881,
            0.09081,
            0.23789,
            0.13025,
            0.15198,
            0.16711,
            0.23878,
            0.14217,
            0.10239,
            0.10139,
            0.06916,
            0.09798,
            0.18736,
            0.08126,
            0.1185,
            0.11916,
            0.10322,
            0.0817,
            0.1025,
            0.06739,
            0.06836,
            0.06399,
            0.09136,
            0.08125,
            0.07719,
            0.08334,
            0.08308,
            0.09057,
            0.17727,
            0.14296,
            0.13306,
            0.12301,
            0.10933,
            0.08644,
            0.05211,
            0.10578,
            0.059,
            0.10222,
            0.14872,
            0.19408,
            0.1486,
            0.15235,
            0.17092,
            0.13122,
            0.1935,
            0.22378,
            0.12882,
            0.1526,
            0.13408,
            0.11491,
            0.11862,
            0.11067,
            0.09499,
            0.0474,
            0.09753,
            0.21908,
            0.14365,
            0.10597,
            0.21623,
            0.14108,
            0.12858,
            0.23211,
            0.12895,
            0.14131,
            0.1214,
            0.08277,
            0.09165,
            0.1321,
            0.08942,
            0.0679,
            0.06571,
            0.24038,
            0.14561,
            0.10754,
            0.09069,
            0.09201,
            0.0796,
            0.07159,
            0.08936,
            0.09681,
            0.06319,
            0.09379,
            0.09301,
            0.05742,
            0.07556,
            0.09625,
            0.07977,
            0.0664,
            0.05522,
            0.07207,
            0.052,
            0.04095,
            0.0403,
            0.07281,
            0.10332,
            0.09857,
            0.09465,
            0.08823,
            0.09951,
            0.07108,
            0.06274,
            0.06908,
            0.05262,
            0.07028,
            0.06261,
            0.06228,
            0.06714,
            0.0634,
            0.07717,
            0.07677,
            0.07833,
            0.09202,
            0.09876,
            0.087,
            0.08978,
            0.05989,
            0.0738,
            0.08567,
            0.09079,
            0.04952,
            0.08379,
            0.08632,
            0.0748,
            0.03971,
            0.03765,
            0.04679,
            0.08175,
            0.09268,
            0.08343,
            0.06337,
            0.08838,
            0.04148,
            0.04464,
            0.07148,
            0.06549,
            0.06786,
            0.06473,
            0.04908,
            0.1628,
            0.09559,
            0.16751,
            0.09794,
            0.23392,
            0.15151,
            0.15819,
            0.15542,
            0.13019,
            0.12075,
            0.25493,
            0.10514,
            0.15608,
            0.14539,
            0.2496,
            0.11452,
            0.12831,
            0.24645,
            0.11912,
            0.13516,
            0.25186,
            0.14855,
            0.16047,
            0.16934,
            0.13757,
            0.1134,
            0.24009,
            0.14136,
            0.14505,
            0.14478,
            0.22946,
            0.12453,
            0.11944,
            0.2356,
            0.17486,
            0.23923,
            0.22931,
            0.18404,
            0.15397,
            0.15758,
            0.13872,
            0.08707,
            0.2218,
            0.18311,
            0.13333,
            0.16376,
            0.18766,
            0.18497,
            0.16053,
            0.17907,
            0.19081,
            0.12378,
            0.17368,
            0.21896,
            0.16824,
            0.16715,
            0.17757,
            0.11621,
            0.14261,
            0.23758,
            0.14099,
            0.15132,
            0.17887,
            0.2291,
            0.13479,
            0.08183,
            0.04452,
            0.11969,
            0.07496,
            0.22778,
            0.11056,
            0.11517,
            0.13732,
            0.09277,
            0.01846,
            0.24993,
            0.12098,
            0.0987,
            0.13021,
            0.2131,
            0.10086,
            0.09388,
            0.23806,
            0.1083,
            0.11454,
            0.22268,
            0.10294,
            0.13084,
            0.12503,
            0.10657,
            0.04643,
            0.25041,
            0.09273,
            0.10796,
            0.12388,
            0.23691,
            0.08629,
            0.10339,
            0.03697,
            0.04509,
            0.04267,
            0.26924,
            0.145,
            0.13503,
            0.14585,
            0.1109,
            0.02141,
            0.24067,
            0.12461,
            0.10597,
            0.11574,
            0.22569,
            0.1532,
            0.11425,
            0.21529,
            0.15668,
            0.11553,
            0.22629,
            0.19177,
            0.12325,
            0.13899,
            0.1277,
            0.01932,
            0.18455,
            0.19269,
            0.106,
            0.12301,
            0.17703,
            0.20067,
            0.10821,
            0.00908,
            0.00755,
            0.01554,
            0.02049,
            0.00665,
            0.00478,
            0.00352,
            0.00202,
            0.00082,
            0.00103,
            0.00084,
            0.00077,
            0.00093,
            0.00076,
            0.00096,
            0.0011,
            0.00111,
            0.00129,
            0.01371,
            0.0243,
            0.0406,
            0.04401,
            0.06206,
            0.07376,
            0.05688,
            0.05439,
            0.05742,
            0.03365,
            0.03468,
            0.03857,
            0.03199,
            0.02391,
            0.03222,
            0.01917,
            0.02738,
            0.02198,
            0.02092,
            0.0142,
            0.00903,
            0.01037,
            0.0156,
            0.27113,
            0.1274,
            0.11365,
            0.12097,
            0.09838,
            0.01073,
            0.21713,
            0.08727,
            0.08162,
            0.10298,
            0.21353,
            0.13547,
            0.0893,
            0.19662,
            0.10957,
            0.089,
            0.19439,
            0.12209,
            0.09625,
            0.10821,
            0.1021,
            0.00516,
            0.19484,
            0.14804,
            0.09574,
            0.10911,
            0.18706,
            0.1544,
            0.09488,
            0.16756,
            0.19192,
            0.19969,
            0.23886,
            0.22333,
            0.11992,
            0.12505,
            0.13314,
            0.0122,
            0.13728,
            0.20202,
            0.07995,
            0.0909,
            0.13646,
            0.20473,
            0.10265,
            0.09158,
            0.2208,
            0.07396,
            0.1045,
            0.22171,
            0.1015,
            0.1049,
            0.11836,
            0.06428,
            0.00559,
            0.23248,
            0.09003,
            0.04882,
            0.01184,
            0.01547,
            0.01107,
            0.012,
            0.01262,
            0.0156,
            0.015,
            0.26535,
            0.09705,
            0.10841,
            0.11862,
            0.064,
            0.00111,
            0.00112,
            0.00112,
            0.00112,
            0.00112,
            0.00112,
            0.00112,
            0.00094,
            0.00467,
            0.01427,
            0.02896,
            0.08284,
            0.08687,
            0.06646,
            0.06546,
            0.07536,
            0.09817,
            0.09735,
            0.09501,
            0.07758,
            0.07497,
            0.07089,
            0.07564,
            0.08113,
            0.08582,
            0.07446,
            0.07637,
            0.07966,
            0.07356,
            0.07239,
            0.07478,
            0.06653,
            0.08061,
            0.08288,
            0.08263,
            0.07502,
            0.06999,
            0.05643,
            0.06427,
            0.07737,
            0.07866,
            0.1266,
            0.11019,
            0.14656,
            0.10434,
            0.13151,
            0.14385,
            0.12309,
            0.13419,
            0.14135,
            0.12561,
            0.1334,
            0.10917,
            0.12761,
            0.11629,
            0.08368,
            0.08149,
            0.11426,
            0.10769,
            0.13663,
            0.11639,
            0.13772,
            0.11881,
            0.11807,
            0.11809,
            0.13759,
            0.12025,
            0.12845,
            0.07531,
            0.10949,
            0.08661,
            0.00944,
            0.00722,
            0.01648,
            0.03459,
            0.25992,
            0.20543,
            0.20695,
            0.19973,
            0.10309,
            0.03185,
            0.26364,
            0.22875,
            0.21875,
            0.20289,
            0.25631,
            0.20696,
            0.10682,
            0.03102,
            0.03616,
            0.03216,
            0.29441,
            0.24145,
            0.23053,
            0.27557,
            0.10702,
            0.03163,
            0.27982,
            0.2324,
            0.22305,
            0.21454,
            0.25525,
            0.22607,
            0.19433,
            0.2205,
            0.22269,
            0.22085,
            0.25922,
            0.22733,
            0.20617,
            0.21393,
            0.11122,
            0.03416,
            0.25723,
            0.22324,
            0.21827,
            0.20985,
            0.24346,
            0.21612,
            0.10761,
            0.02732,
            0.04371,
            0.03279,
            0.26648,
            0.24191,
            0.24049,
            0.27672,
            0.10834,
            0.02669,
            0.26958,
            0.22238,
            0.103,
            0.01718,
            0.02893,
            0.02646,
            0.02713,
            0.02444,
            0.02731,
            0.03487,
            0.01934,
            0.00475,
            0.00229,
            0.0018,
            0.0046,
            0.00125,
            0.00086,
            0.00078,
            0.00142,
            0.00073,
            0.00071,
            0.00076,
            0.00079,
            0.001,
            0.00112,
            0.00113,
            0.00114,
            0.00114,
            0.00114,
            0.00114,
            0.00098,
            0.00629,
            0.01535,
            0.0366,
            0.0432,
            0.05965,
            0.06753,
            0.08779,
            0.07397,
            0.0735,
            0.06828,
            0.05964,
            0.05142,
            0.03369,
            0.03313,
            0.0265,
            0.02533,
            0.03133,
            0.02601,
            0.02223,
            0.03367,
            0.02799,
            0.02963,
            0.02159,
            0.02926,
            0.02499,
            0.02815,
            0.0297,
            0.02635,
            0.02861,
            0.03593,
            0.04319,
            0.0588,
            0.07436,
            0.0795,
            0.11115,
            0.19241,
            0.15118,
            0.26136,
            0.21774,
            0.24704,
            0.23852,
            0.20792,
            0.22402,
            0.28222,
            0.22914,
            0.23966,
            0.22608,
            0.26671,
            0.21336,
            0.20953,
            0.20807,
            0.21712,
            0.21403,
            0.25714,
            0.24382,
            0.23329,
            0.24234,
            0.23483,
            0.22425,
            0.25787,
            0.24937,
            0.2583,
            0.24964,
            0.283,
            0.25009,
            0.2268,
            0.22495,
            0.22442,
            0.23379,
            0.27294,
            0.22395,
            0.23478,
            0.25036,
            0.21935,
            0.23337,
            0.30766,
            0.23966,
            0.23709,
            0.23441,
            0.26518,
            0.20951,
            0.20558,
            0.21357,
            0.21824,
            0.21813,
            0.27975,
            0.24705,
            0.25412,
            0.2795,
            0.23154,
            0.23367,
            0.26534,
            0.2388,
            0.26444,
            0.23645,
            0.17493,
            0.14297,
            0.08511,
            0.09772,
            0.08384,
            0.16756,
            0.28618,
            0.23187,
            0.21209,
            0.2187,
            0.09751,
            0.03491,
            0.25435,
            0.22024,
            0.22415,
            0.21865,
            0.26397,
            0.20704,
            0.09449,
            0.02684,
            0.04073,
            0.03855,
            0.30443,
            0.26963,
            0.24514,
            0.29353,
            0.10633,
            0.0276,
            0.26804,
            0.24867,
            0.23716,
            0.23012,
            0.26306,
            0.2439,
            0.22544,
            0.22927,
            0.22708,
            0.22024,
            0.24661,
            0.18594,
            0.1994,
            0.15629,
            0.18394,
            0.13096,
            0.18511,
            0.16604,
            0.18233,
            0.16796,
            0.14087,
            0.12838,
            0.05177,
            0.08277,
            0.13636,
            0.15236,
            0.16119,
            0.13534,
            0.14721,
            0.12786,
            0.11164,
            0.18486,
            0.17413,
            0.15148,
            0.07813,
            0.0081,
            0.01391,
            0.01128,
            0.01819,
            0.08434,
            0.06987,
            0.0864,
            0.10948,
            0.09394,
            0.06709,
            0.06236,
            0.10766,
            0.10909,
            0.10081,
            0.10305,
            0.08576,
            0.10232,
            0.07576,
            0.09554,
            0.09381,
            0.10183,
            0.08397,
            0.10354,
            0.08913,
            0.10442,
            0.09953,
            0.10692,
            0.09208,
            0.12615,
            0.11606,
            0.25638,
            0.06784,
            0.24289,
            0.21713,
            0.22649,
            0.19975,
            0.16847,
            0.09851,
            0.02459,
            0.00281,
            0.00198,
            0.00139,
            0.00101,
            0.00098,
            0.00077,
            0.00151,
            0.00951,
            0.02776,
            0.07879,
            0.0663,
            0.06766,
            0.06636,
            0.07855,
            0.09611,
            0.09233,
            0.08131,
            0.07312,
            0.07661,
            0.06969,
            0.07612,
            0.08029,
            0.05785,
            0.07261,
            0.07018,
            0.06287,
            0.06771,
            0.07691,
            0.07149,
            0.07279,
            0.07771,
            0.07722,
            0.08228,
            0.08313,
            0.08806,
            0.07915,
            0.088,
            0.13255,
            0.12438,
            0.10483,
            0.01981,
            0.06725,
            0.09554,
            0.04993,
            0.0067,
            0.00076,
            0.00085,
            0.00113,
            0.00114,
            0.00112,
            0.00081,
            0.00459,
            0.01409,
            0.01752,
            0.27765,
            0.22827,
            0.23019,
            0.22162,
            0.22083,
            0.17752,
            0.03677,
            0.10589,
            0.30901,
            0.2187,
            0.20806,
            0.23231,
            0.22482,
            0.28929,
            0.22842,
            0.16971,
            0.04162,
            0.0399,
            0.03584,
            0.04547,
            0.30052,
            0.21967,
            0.2601,
            0.21471,
            0.30853,
            0.18117,
            0.04503,
            0.12235,
            0.33905,
            0.22324,
            0.22815,
            0.21654,
            0.24133,
            0.29831,
            0.25522,
            0.23721,
            0.23765,
            0.23965,
            0.23051,
            0.22912,
            0.30992,
            0.2403,
            0.23171,
            0.23903,
            0.24881,
            0.19819,
            0.04892,
            0.11619,
            0.30723,
            0.21873,
            0.22313,
            0.2308,
            0.22859,
            0.28288,
            0.2153,
            0.17541,
            0.03742,
            0.0316,
            0.03403,
            0.04224,
            0.30391,
            0.22711,
            0.26422,
            0.22681,
            0.3077,
            0.18408,
            0.04683,
            0.12697,
            0.32372,
            0.23387,
            0.19311,
            0.02912,
            0.02695,
            0.02693,
            0.03101,
            0.04384,
            0.04276,
            0.03922,
            0.03088,
            0.04496,
            0.01566,
            0.00082,
            0.00077,
            0.00089,
            0.00112,
            0.00113,
            0.00114,
            0.00114,
            0.00114,
            0.00114,
            0.0011,
            0.00184,
            0.00579,
            0.00801,
            0.00101,
            0.00114,
            0.00114,
            0.00114,
            0.00114,
            0.00114
        ],
        "hootCer": 1,
        "isStreamed": false
    },
}


export default {
    name: 'KaraokePlayer',
    components: {
        ScoreDisplay
    },

    data() {
        return {
            audioContext: null,
            audioBuffer: null,
            audioSource: null,
            gainNode: null,
            mediaRecorder: null,
            audioLoaded: false,
            isPlaying: false,
            isRecording: false,
            currentTime: 0,
            recordingDuration: 0,
            recordingInterval: null,
            volume: 0.5,
            errorMessage: '',
            lyrics: [],
            currentWords: [],
            previousLine: '',
            nextLine: '',
            recordedChunks: [],
            visualizerContext: null,
            analyzer: null,
            startTime: 0,
            alignedWords: [],
            scoringSystem: null,
            currentScore: 0,
            totalScore: 0,
            combo: 0,
            maxCombo: 0,
            perfectCount: 0,
            greatCount: 0,
            isPerformanceComplete: false,
            scoreFeedback: {
                message: '',
                color: '#FFFFFF'
            }
        }
    },

    watch: {
        volume(newVal) {
            if (this.gainNode) {
                this.gainNode.gain.value = newVal;
            }
        }
    },

    methods: {
        async initializeAudio() {
            try {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

                // Create audio processing nodes
                this.analyzer = this.audioContext.createAnalyser();
                this.gainNode = this.audioContext.createGain();
                this.gainNode.gain.value = this.volume;

                // Configure analyzer
                this.analyzer.fftSize = 2048;

                // Load audio file
                const response = await fetch(AUDIO_URL);
                const arrayBuffer = await response.arrayBuffer();
                this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

                if (!this.scoringSystem) {
                    this.scoringSystem = new ScoringSystem();
                }

                this.audioLoaded = true;
                this.setupVisualizer();
                this.processLyrics(LYRICS_DATA.data.alignedWords);
            } catch (error) {
                console.error('Error initializing audio:', error);
                this.errorMessage = 'Failed to load audio. Please try again.';
            }
        },

        processLyrics(alignedWords) {
            this.alignedWords = alignedWords.map(word => ({
                text: word.word.replace(/\\n/g, '\n').trim(),
                startTime: word.startS,
                endTime: word.endS,
                active: false,
                passed: false
            }));

            // Group words into lines
            let currentLine = [];
            let lines = [];

            alignedWords.forEach(word => {
                const text = word.word.replace(/\\n/g, '\n');
                if (text.includes('\n')) {
                    // Split the word that contains newline
                    const parts = text.split('\n');
                    if (parts[0]) {
                        currentLine.push({
                            text: parts[0],
                            startTime: word.startS,
                            endTime: word.endS
                        });
                    }
                    if (currentLine.length > 0) {
                        lines.push([...currentLine]);
                    }
                    currentLine = [];
                    if (parts[1]) {
                        currentLine.push({
                            text: parts[1],
                            startTime: word.startS,
                            endTime: word.endS
                        });
                    }
                } else {
                    currentLine.push({
                        text: text,
                        startTime: word.startS,
                        endTime: word.endS
                    });
                }
            });

            if (currentLine.length > 0) {
                lines.push(currentLine);
            }

            this.lyrics = lines;
        },

        isWordActive(word) {
            return this.currentTime >= word.startTime && this.currentTime < word.endTime;
        },

        isWordPassed(word) {
            return this.currentTime >= word.endTime;
        },

        formatTime(seconds) {
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = (seconds % 60).toFixed(2);
            return `${String(minutes).padStart(2, '0')}:${remainingSeconds.padStart(5, '0')}`;
        },

        async toggleRecording() {
            if (!this.isRecording) {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

                    // Create analyzer for mic input
                    const micSource = this.audioContext.createMediaStreamSource(stream);
                    const micAnalyzer = this.audioContext.createAnalyser();
                    micSource.connect(micAnalyzer);

                    this.mediaRecorder = new MediaRecorder(stream);
                    this.mediaRecorder.ondataavailable = (event) => {
                        if (event.data.size > 0) {
                            this.recordedChunks.push(event.data);
                        }
                    };

                    // Start scoring
                    this.scoreInterval = setInterval(() => {
                        this.updateScore();
                    }, 100);

                    this.mediaRecorder.start();
                    this.isRecording = true;
                    this.recordingDuration = 0;
                    this.recordingInterval = setInterval(() => {
                        this.recordingDuration += 0.1;
                    }, 100);
                } catch (error) {
                    console.error('Error starting recording:', error);
                    this.errorMessage = 'Failed to start recording. Please check microphone permissions.';
                }
            } else {
                clearInterval(this.scoreInterval);
                this.mediaRecorder.stop();
                this.isRecording = false;
                clearInterval(this.recordingInterval);
            }
        },
        togglePlayback() {
            if (!this.isPlaying) {
                // Reset scores when starting new song
                this.currentScore = 0;
                this.combo = 0;
                this.perfectCount = 0;
                this.greatCount = 0;
                this.maxCombo = 0;

                this.audioSource = this.audioContext.createBufferSource();
                this.audioSource.buffer = this.audioBuffer;

                this.audioSource.connect(this.gainNode);
                this.gainNode.connect(this.analyzer);
                this.analyzer.connect(this.audioContext.destination);

                this.startTime = this.audioContext.currentTime;
                this.audioSource.start(0);
                this.startTimeTracking();
            } else {
                this.audioSource.stop();
                this.stopTimeTracking();
            }
            this.isPlaying = !this.isPlaying;
        },

        startTimeTracking() {
            this.updateTimer = setInterval(() => {
                this.currentTime = this.audioContext.currentTime - this.startTime;
                this.updateLyrics();
                this.updateVisualizer();
            }, 16);
        },

        stopTimeTracking() {
            clearInterval(this.updateTimer);
        },

        updateLyrics() {
            // Find current line based on word timings
            const currentLineIndex = this.lyrics.findIndex(line => {
                const lineStartTime = line[0].startTime;
                const lineEndTime = line[line.length - 1].endTime;
                return this.currentTime >= lineStartTime && this.currentTime <= lineEndTime + 1;
            });

            if (currentLineIndex !== -1) {
                this.currentWords = this.lyrics[currentLineIndex];
                this.previousLine = currentLineIndex > 0 ?
                    this.lyrics[currentLineIndex - 1].map(w => w.text).join(' ') : '';
                this.nextLine = currentLineIndex < this.lyrics.length - 1 ?
                    this.lyrics[currentLineIndex + 1].map(w => w.text).join(' ') : '';
            }
        },

        updateVisualizer() {
            const bufferLength = this.analyzer.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            this.analyzer.getByteFrequencyData(dataArray);

            const canvas = this.$refs.visualizer;
            const ctx = this.visualizerContext;
            const width = canvas.width;
            const height = canvas.height;

            ctx.fillStyle = 'rgb(20, 20, 30)';
            ctx.fillRect(0, 0, width, height);

            const barWidth = (width / bufferLength) * 2.5;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                const barHeight = (dataArray[i] / 255) * height;

                const hue = (i / bufferLength) * 360;
                ctx.fillStyle = `hsl(${hue}, 70%, 50%)`;
                ctx.fillRect(x, height - barHeight, barWidth, barHeight);

                x += barWidth + 1;
            }
        },

        setupVisualizer() {
            const canvas = this.$refs.visualizer;
            this.visualizerContext = canvas.getContext('2d');

            this.visualizerContext.fillStyle = 'rgb(20, 20, 30)';
            this.visualizerContext.fillRect(0, 0, canvas.width, canvas.height);
        },

        async handleFirstInteraction() {
            try {
                if (this.audioContext) {
                    await this.audioContext.resume();
                }
                await this.initializeAudio();
            } catch (error) {
                console.error('Error in first interaction:', error);
            }
        },
        updateScore() {
            if (!this.isRecording || !this.scoringSystem) return;

            // Get current active word
            const activeWord = this.currentWords.find(word => this.isWordActive(word));
            if (!activeWord) return;

            // Get audio data from mic
            const audioData = new Float32Array(this.analyzer.frequencyBinCount);
            this.analyzer.getFloatFrequencyData(audioData);

            // Calculate volume level
            const volume = audioData.reduce((acc, val) => acc + Math.abs(val), 0) / audioData.length;

            // Calculate score based on timing and volume
            const score = Math.round(Math.max(0, Math.min(100, volume * 100)));

            if (score > 50) { // Threshold for detecting singing
                this.currentScore += score;
                this.combo++;
                if (this.combo > this.maxCombo) {
                    this.maxCombo = this.combo;
                }

                // Update feedback
                if (score > 90) {
                    this.perfectCount++;
                    this.scoreFeedback = { message: 'PERFECT! 🌟', color: '#FFD700' };
                } else if (score > 70) {
                    this.greatCount++;
                    this.scoreFeedback = { message: 'GREAT! ⭐', color: '#00FF00' };
                } else {
                    this.scoreFeedback = { message: 'GOOD! 👍', color: '#4CAF50' };
                }
            } else {
                this.combo = 0;
                this.scoreFeedback = { message: 'MISS 💫', color: '#FF0000' };
            }
        }

    },

    mounted() {
        this.initializeAudio();
        document.addEventListener('click', this.handleFirstInteraction, { once: true });
        this.scoringSystem = new ScoringSystem();
    },

    beforeDestroy() {
        this.stopTimeTracking();
        if (this.recordingInterval) {
            clearInterval(this.recordingInterval);
        }
        if (this.scoreInterval) {
            clearInterval(this.scoreInterval);
        }
        if (this.audioContext) {
            this.audioContext.close();
        }
    },

}
</script>

<style>
/* KaraokeStyles.css */
.karaoke-container {
    max-width: 900px;
    margin: 0 auto;
    padding: 20px;
    background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
    color: white;
    border-radius: 15px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    font-family: 'Arial', sans-serif;
}

/* Controls Section */
.controls {
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 20px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    margin-bottom: 20px;
}

.controls button {
    padding: 12px 24px;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease;
    text-transform: uppercase;
    letter-spacing: 1px;
}

.controls button:not(:disabled) {
    background: linear-gradient(45deg, #4CAF50, #45a049);
    color: white;
}

.controls button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
}

.controls button:disabled {
    background: #2c3e50;
    color: #95a5a6;
    cursor: not-allowed;
}

.controls button.recording {
    background: linear-gradient(45deg, #e74c3c, #c0392b);
    animation: recordingPulse 1.5s infinite;
}

/* Scoring Display */
.score-display {
    position: absolute;
    top: 20px;
    right: 20px;
    background: rgba(0, 0, 0, 0.8);
    padding: 20px;
    border-radius: 12px;
    text-align: center;
    min-width: 200px;
}

.current-score {
    font-size: 48px;
    font-weight: bold;
    text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
    margin-bottom: 10px;
}

.score-meter {
    height: 10px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 5px;
    overflow: hidden;
    margin: 10px 0;
}

.meter-fill {
    height: 100%;
    transition: width 0.3s ease;
}

.combo-counter {
    font-size: 24px;
    font-weight: bold;
    color: #FFD700;
    text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
}

/* Lyrics Display */
.lyrics-display {
    margin: 20px 0;
    padding: 30px;
    background: rgba(0, 0, 0, 0.5);
    border-radius: 15px;
    text-align: center;
    min-height: 200px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    position: relative;
    overflow: hidden;
}

.previous-line {
    font-size: 20px;
    opacity: 0.5;
    margin-bottom: 15px;
    color: #95a5a6;
}

.current-line {
    font-size: 32px;
    line-height: 1.5;
    margin: 20px 0;
    min-height: 48px;
}

.next-line {
    font-size: 20px;
    opacity: 0.5;
    margin-top: 15px;
    color: #95a5a6;
}

.current-line span {
    display: inline-block;
    padding: 0 5px;
    margin: 0 2px;
    border-radius: 4px;
    transition: all 0.2s ease;
}

.current-line span.highlight {
    color: #2ecc71;
    transform: scale(1.2);
    font-weight: bold;
    text-shadow: 0 0 10px rgba(46, 204, 113, 0.5);
    background: rgba(46, 204, 113, 0.2);
}

.current-line span.passed {
    color: #7f8c8d;
}

/* Performance Feedback */
.feedback-message {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(0);
    font-size: 36px;
    font-weight: bold;
    text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
    opacity: 0;
    transition: all 0.3s ease;
}

.feedback-message.show {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
}

.feedback-perfect {
    color: #FFD700;
    animation: perfectPulse 0.5s ease;
}

.feedback-great {
    color: #2ecc71;
}

.feedback-good {
    color: #3498db;
}

.feedback-okay {
    color: #f1c40f;
}

.feedback-miss {
    color: #e74c3c;
}

/* Visualizer */
.audio-visualization {
    width: 100%;
    height: 100px;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 10px;
    overflow: hidden;
    margin-top: 20px;
}

canvas {
    width: 100%;
    height: 100%;
}

/* Recording Indicator */
.recording-indicator {
    position: fixed;
    top: 20px;
    left: 20px;
    background: rgba(231, 76, 60, 0.9);
    padding: 10px 20px;
    border-radius: 20px;
    animation: recordingBlink 1s infinite;
}

/* Animations */
@keyframes recordingPulse {
    0% {
        transform: scale(1);
    }

    50% {
        transform: scale(1.05);
        box-shadow: 0 0 20px rgba(231, 76, 60, 0.5);
    }

    100% {
        transform: scale(1);
    }
}

@keyframes perfectPulse {
    0% {
        transform: scale(1);
    }

    50% {
        transform: scale(1.2);
    }

    100% {
        transform: scale(1);
    }
}

@keyframes recordingBlink {

    0%,
    100% {
        opacity: 1;
    }

    50% {
        opacity: 0.5;
    }
}

/* Score Animation Effects */
.score-popup {
    position: absolute;
    animation: scorePopup 0.5s ease-out forwards;
    font-weight: bold;
    pointer-events: none;
}

@keyframes scorePopup {
    0% {
        transform: translateY(0) scale(1);
        opacity: 1;
    }

    100% {
        transform: translateY(-50px) scale(1.2);
        opacity: 0;
    }
}

/* Combo Effects */
.combo-text {
    position: absolute;
    right: 20px;
    font-size: 24px;
    font-weight: bold;
    text-shadow: 0 0 10px currentColor;
}

.combo-multiplier {
    position: absolute;
    right: 20px;
    top: 50px;
    font-size: 18px;
    color: #FFD700;
}

/* Performance Grade */
.performance-grade {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(0);
    font-size: 120px;
    font-weight: bold;
    text-shadow: 0 0 20px currentColor;
    opacity: 0;
    transition: all 0.5s ease;
}

.performance-grade.show {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
}

/* Mobile Responsiveness */
@media (max-width: 768px) {
    .karaoke-container {
        padding: 10px;
    }

    .controls {
        flex-direction: column;
        gap: 10px;
    }

    .current-line {
        font-size: 24px;
    }

    .score-display {
        position: relative;
        top: auto;
        right: auto;
        margin-bottom: 20px;
    }
}

/* Multiplayer Split Screen */
.multiplayer-container {
    display: flex;
    gap: 20px;
}

.player-section {
    flex: 1;
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 15px;
}

.player-header {
    text-align: center;
    margin-bottom: 15px;
    font-size: 20px;
    font-weight: bold;
    color: #3498db;
}

/* Achievement Badges */
.achievement-badge {
    position: absolute;
    right: -100%;
    top: 20px;
    background: linear-gradient(45deg, #f1c40f, #f39c12);
    padding: 10px 20px;
    border-radius: 20px;
    animation: slideInBadge 0.5s ease forwards;
}

@keyframes slideInBadge {
    to {
        right: 20px;
    }
}
</style>