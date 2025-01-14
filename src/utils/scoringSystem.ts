class ScoringSystem {
    constructor() {
      this.analyzer = null;
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.bufferSize = 2048;
      this.setupAnalyzer();
      
      // Scoring thresholds
      this.TIMING_THRESHOLD = 0.2;  // 200ms window for timing
      this.ENERGY_THRESHOLD = 0.1;  // Minimum volume level
      this.PITCH_TOLERANCE = 0.15;  // Pitch matching tolerance
      
      // Scoring weights
      this.weights = {
        timing: 0.4,    // 40% timing accuracy
        energy: 0.3,    // 30% volume matching
        pitch: 0.3      // 30% pitch accuracy
      };
    }
  
    setupAnalyzer() {
      this.analyzer = this.audioContext.createAnalyser();
      this.analyzer.fftSize = this.bufferSize;
      this.dataArray = new Float32Array(this.analyzer.frequencyBinCount);
    }
  
    calculateScore(userAudio, timing, expectedEnergy) {
      const timingScore = this.calculateTimingScore(timing);
      const energyScore = this.calculateEnergyScore(userAudio, expectedEnergy);
      const pitchScore = this.calculatePitchScore(userAudio);
  
      return {
        total: Math.round(
          timingScore * this.weights.timing +
          energyScore * this.weights.energy +
          pitchScore * this.weights.pitch
        ) * 100,
        breakdown: {
          timing: timingScore,
          energy: energyScore,
          pitch: pitchScore
        }
      };
    }
  
    calculateTimingScore(timing) {
      const delay = Math.abs(timing);
      return Math.max(0, 1 - (delay / this.TIMING_THRESHOLD));
    }
  
    calculateEnergyScore(userEnergy, expectedEnergy) {
      if (userEnergy < this.ENERGY_THRESHOLD) return 0;
      const difference = Math.abs(userEnergy - expectedEnergy);
      return Math.max(0, 1 - difference);
    }
  
    calculatePitchScore(frequency) {
      this.analyzer.getFloatFrequencyData(this.dataArray);
      // Simplified pitch detection
      const maxBin = this.findPeakFrequency();
      const expectedBin = this.frequencyToBin(frequency);
      const difference = Math.abs(maxBin - expectedBin) / expectedBin;
      return Math.max(0, 1 - (difference / this.PITCH_TOLERANCE));
    }
  
    findPeakFrequency() {
      let maxValue = -Infinity;
      let maxIndex = 0;
      for (let i = 0; i < this.dataArray.length; i++) {
        if (this.dataArray[i] > maxValue) {
          maxValue = this.dataArray[i];
          maxIndex = i;
        }
      }
      return maxIndex;
    }
  
    frequencyToBin(frequency) {
      return Math.round(frequency * this.bufferSize / this.audioContext.sampleRate);
    }
  
    getFeedback(score) {
      if (score >= 95) return { message: "PERFECT! 🌟", color: "#FFD700" };
      if (score >= 85) return { message: "GREAT! ⭐", color: "#00FF00" };
      if (score >= 75) return { message: "GOOD! 👍", color: "#4CAF50" };
      if (score >= 65) return { message: "OKAY! 👌", color: "#FFA500" };
      return { message: "MISS 💫", color: "#FF0000" };
    }
  
    connect(sourceNode) {
      sourceNode.connect(this.analyzer);
    }
  
    disconnect() {
      this.analyzer.disconnect();
    }
  }
  
  export default ScoringSystem;