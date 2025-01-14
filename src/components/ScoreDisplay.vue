<!-- ScoreDisplay.vue -->
<template>
    <div class="score-display">
      <!-- Current Score -->
      <div class="score-section">
        <div class="current-score" :style="{ color: feedback.color }">
          {{ Math.floor(currentScore).toLocaleString() }}
        </div>
        <div class="score-label">SCORE</div>
      </div>
  
      <!-- Combo Counter -->
      <div class="combo-section" v-if="combo > 1">
        <div class="combo-counter" :class="{ 'high-combo': combo >= 10 }">
          {{ combo }}x
        </div>
        <div class="combo-label">COMBO</div>
      </div>
  
      <!-- Feedback Message -->
      <div class="feedback-message" 
           :class="{ show: feedback.message }"
           :style="{ color: feedback.color }">
        {{ feedback.message }}
      </div>
  
      <!-- Score Meter -->
      <div class="score-meter">
        <div class="meter-fill" 
             :style="{ 
               width: `${Math.min(100, (currentScore / maxPossibleScore) * 100)}%`,
               backgroundColor: feedback.color 
             }">
        </div>
      </div>
  
      <!-- Performance Stats -->
      <div class="performance-stats">
        <div class="stat-item">
          <div class="stat-value">{{ perfectCount }}</div>
          <div class="stat-label">PERFECT</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ greatCount }}</div>
          <div class="stat-label">GREAT</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ maxCombo }}</div>
          <div class="stat-label">MAX COMBO</div>
        </div>
      </div>
  
      <!-- Grade (shows at the end) -->
      <div v-if="showGrade" 
           class="performance-grade"
           :class="{ show: showGrade }"
           :style="{ color: gradeColor }">
        {{ grade }}
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
  
  <style scoped>
  .score-display {
    position: relative;
    padding: 20px;
    background: rgba(0, 0, 0, 0.8);
    border-radius: 15px;
    color: white;
    text-align: center;
    min-width: 250px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  }
  
  .score-section {
    margin-bottom: 15px;
  }
  
  .current-score {
    font-size: 48px;
    font-weight: bold;
    line-height: 1;
    text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
    transition: color 0.3s ease;
  }
  
  .score-label {
    font-size: 14px;
    opacity: 0.8;
    margin-top: 5px;
  }
  
  .combo-section {
    margin: 10px 0;
    animation: popIn 0.3s ease;
  }
  
  .combo-counter {
    font-size: 32px;
    font-weight: bold;
    color: #FFD700;
    text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
  }
  
  .high-combo {
    color: #FF4500;
    animation: pulse 1s infinite;
  }
  
  .feedback-message {
    font-size: 24px;
    font-weight: bold;
    margin: 10px 0;
    min-height: 36px;
    opacity: 0;
    transform: translateY(10px);
    transition: all 0.3s ease;
  }
  
  .feedback-message.show {
    opacity: 1;
    transform: translateY(0);
  }
  
  .score-meter {
    width: 100%;
    height: 8px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    overflow: hidden;
    margin: 15px 0;
  }
  
  .meter-fill {
    height: 100%;
    transition: width 0.3s ease, background-color 0.3s ease;
  }
  
  .performance-stats {
    display: flex;
    justify-content: space-around;
    margin-top: 20px;
    padding-top: 15px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .stat-item {
    text-align: center;
  }
  
  .stat-value {
    font-size: 24px;
    font-weight: bold;
    color: #3498db;
  }
  
  .stat-label {
    font-size: 12px;
    opacity: 0.8;
    margin-top: 5px;
  }
  
  .performance-grade {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(0);
    font-size: 120px;
    font-weight: bold;
    opacity: 0;
    transition: all 0.5s ease;
    text-shadow: 0 0 20px currentColor;
  }
  
  .performance-grade.show {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
  
  @keyframes popIn {
    0% { transform: scale(0); }
    50% { transform: scale(1.2); }
    100% { transform: scale(1); }
  }
  
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
  }
  </style>