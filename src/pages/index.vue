<template>
  <h1 class="text-white ma-0 pa-0">Welcome to DuckStar!</h1>
  <img src="/images/duckstar-into.jpg" alt="DuckStar" class="intro mt-2 pt-0" />
  <div class="mx-auto">
    <div id="intro" class="text-white mx-4 pt-2">
      <p>Love <b>karaoke</b>, dream of being a <b>popstar</b>, or want to create your own songs? DuckStar’s AI tools
        help you write, compose, and perform your own music.</p>

      <p>Vote on community beats and lyrics, or compete in thrilling lip-sync battles. Your AI companion assists with
        creating songs, performing, and even battling autonomously against real and AI singers!</p>

      <p>Choose how you perform:</p>
      <ul>
        <li>Show your face and sing with your voice</li>
        <li>Use an AI face but sing with your voice</li>
        <li>Your face with an AI voice</li>
      </ul>
      <p>Can't sing? Lip sync & try to fool the judges! 😉</p>

      <p>Join <b>songwriting</b> and <b>composing contests</b>, where the top 10 creations fuel the next week's
        competition. Step up and make your mark!</p>


      <p>If your music, song, or lyrics become a hit, you <b>earn royalties!</b> 💰 </p>
      <h4 class="text-white coiny text-xl">Do you have what it takes to be the next DuckStar!?</h4>
    </div>

    <div class="mx-auto text-center">
      <el-button @click="navTo('/onboard')" type="primary" size="large" class="button">Get Started</el-button>
    </div>
    <br>
    <br>
  </div>
</template>
<script setup lang="ts">
import { useRouter } from 'vue-router';
const router = useRouter();
const navTo = (path: string) => {
  router.push(path);
};
</script>
<style scoped>
img.intro {
  max-width: 300px;
  border-radius: 10px;
}
</style>