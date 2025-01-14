<!-- ScoreDisplay.vue -->
<template>
    <div class=" top-4  p-5 bg-black/80 rounded-xl text-white text-center shadow-lg">
        <!-- Score Section -->
        <div class="mb-4">
            <div class="text-4xl lg:text-5xl font-bold leading-none" :style="{ color: feedback.color }">
                {{ Math.floor(currentScore).toLocaleString() }}
            </div>
            <div class="text-sm opacity-80 mt-1">SCORE</div>
        </div>

        <!-- Combo Counter -->
        <div v-if="combo > 1" class="my-3 animate-pop-in">
            <div class="text-2xl lg:text-3xl font-bold"
                :class="combo >= 10 ? 'text-orange-500 animate-pulse' : 'text-yellow-400'">
                {{ combo }}x
            </div>
            <div class="text-sm opacity-80">COMBO</div>
        </div>

        <!-- Feedback Message -->
        <div class="text-xl lg:text-2xl font-bold min-h-[36px] transition-all duration-300"
            :class="feedback.message ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'"
            :style="{ color: feedback.color }">
            {{ feedback.message }}
        </div>

        <!-- Score Meter -->
        <div class="w-full h-2 bg-white/10 rounded overflow-hidden my-4">
            <div class="h-full transition-all duration-300" :style="{
                width: `${Math.min(100, (currentScore / maxPossibleScore) * 100)}%`,
                backgroundColor: feedback.color
            }">
            </div>
        </div>

        <!-- Stats Grid -->
        <div class="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-white/10">
            <div class="text-center">
                <div class="text-lg lg:text-xl font-bold text-blue-400">{{ perfectCount }}</div>
                <div class="text-xs opacity-80">PERFECT</div>
            </div>
            <div class="text-center">
                <div class="text-lg lg:text-xl font-bold text-blue-400">{{ greatCount }}</div>
                <div class="text-xs opacity-80">GREAT</div>
            </div>
            <div class="text-center">
                <div class="text-lg lg:text-xl font-bold text-blue-400">{{ maxCombo }}</div>
                <div class="text-xs opacity-80">MAX COMBO</div>
            </div>
        </div>

        <!-- Grade -->
        <div class="relative">
            <div v-if="showGrade"
                class="absolute right-0 top -translate-x-1/2 -translate-y-1/2 text-8xl font-bold transition-all duration-500"
                :class="showGrade ? 'opacity-100 scale-100' : 'opacity-0 scale-0'" :style="{ color: gradeColor }">
                {{ grade }}
            </div>
        </div>
    </div>
</template>


<script>
export default {
    name: 'ScoreDisplay',

    props: {
        currentScore: {
            type: Number,
            default: 0
        },
        maxPossibleScore: {
            type: Number,
            default: 10000
        },
        combo: {
            type: Number,
            default: 0
        },
        maxCombo: {
            type: Number,
            default: 0
        },
        perfectCount: {
            type: Number,
            default: 0
        },
        greatCount: {
            type: Number,
            default: 0
        },
        feedback: {
            type: Object,
            default: () => ({
                message: '',
                color: '#FFFFFF'
            })
        },
        showGrade: {
            type: Boolean,
            default: false
        }
    },

    computed: {
        grade() {
            const percentage = (this.currentScore / this.maxPossibleScore) * 100;
            if (percentage >= 95) return 'S';
            if (percentage >= 90) return 'A+';
            if (percentage >= 85) return 'A';
            if (percentage >= 80) return 'B+';
            if (percentage >= 75) return 'B';
            if (percentage >= 70) return 'C+';
            if (percentage >= 65) return 'C';
            return 'D';
        },

        gradeColor() {
            const gradeColors = {
                'S': '#FFD700',   // Gold
                'A+': '#00FF00',  // Bright Green
                'A': '#32CD32',   // Lime Green
                'B+': '#4169E1',  // Royal Blue
                'B': '#1E90FF',   // Dodger Blue
                'C+': '#FFA500',  // Orange
                'C': '#FF8C00',   // Dark Orange
                'D': '#FF4500'    // Red Orange
            };
            return gradeColors[this.grade] || '#FF0000';
        }
    },

    methods: {
        // Trigger score popup animation
        showScorePopup(points, type) {
            const popup = document.createElement('div');
            popup.className = `score-popup ${type.toLowerCase()}`;
            popup.textContent = `+${points}`;
            this.$el.appendChild(popup);

            // Remove popup after animation
            popup.addEventListener('animationend', () => {
                popup.remove();
            });
        }
    },

    watch: {
        // Watch for perfect/great hits to show popups
        perfectCount(newVal, oldVal) {
            if (newVal > oldVal) {
                this.showScorePopup(1000, 'perfect');
            }
        },
        greatCount(newVal, oldVal) {
            if (newVal > oldVal) {
                this.showScorePopup(500, 'great');
            }
        }
    }
}
</script>
<style>
/* Only keep custom animations, remove the rest since we're using UnoCSS */
@keyframes pop-in {
    0% {
        transform: scale(0);
    }

    50% {
        transform: scale(1.2);
    }

    100% {
        transform: scale(1);
    }
}

.animate-pop-in {
    animation: pop-in 0.3s ease;
}

@keyframes pulse {
    0% {
        transform: scale(1);
    }

    50% {
        transform: scale(1.1);
    }

    100% {
        transform: scale(1);
    }
}

.animate-pulse {
    animation: pulse 1s infinite;
}
</style>