<template>

  <div v-if="loading">
    <DuckLoader />
  </div>
  <div v-if="myProfile.onboarded">
    onbaoarded
  </div>
  <div v-else>
    <h1 class="text-white mb-0 pb-0 mt-3 pt-0">Welcome to DuckStar!</h1>
    <div class="grid grid-cols-1 md:grid-cols-1 gap-4">
      <div>
        <img src="/images/duckstar-into-small.jpg" alt="DuckStar" class="intro m-0 p-0 mt-1 mx-auto" />
      </div>
      <div class="mx-auto">
        <div id="intro" class="text-white mx-4 pt-1 mt-0">
          <p class="mt-1 pt-0">Love karaoke or dream of being a rock or pop star? DuckStar's AI tools help you write,
            compose, & perform music.</p>
          <p>Vote on beats, compete in lip-sync battles, or team up with AI for performances & battles against real & AI
            singers!</p>
          <p>Choose your style:</p>
          <ul>
            <li>Sing with your voice & face</li>
            <li>AI face with your voice</li>
            <li>Your face with AI voice</li>
          </ul>
          <p>Can't sing? Lip syncing is encouraged! 😉</p>
          <p>Join songwriting & composing contests, where the top 10 creations shape next week's competition. Make your
            mark!</p>
          <p>Earn royalties if your song becomes a hit! 💰</p>

          <h4 class="text-white coiny text-xl mt-1 pt-0">Do you have what it takes to be the next DuckStar!?</h4>
        </div>
      </div>
    </div>
    <div>
      <div class="mx-auto text-center">
        <el-button @click="navTo('/onboard')" type="primary" size="large" class="button">Get Started</el-button>
      </div>
      <br>
      <br>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import DuckLoader from '@/components/DuckLoader.vue';
import { onMounted, ref } from 'vue';
import { useProfile } from '../composables/useProfile';
import { getCurrentUser } from 'aws-amplify/auth';
const { getOrCreateProfile } = useProfile();
const router = useRouter();
const loading = ref(true);
const userId = ref<string | null>(null);
const myProfile = ref<any>({});

const navTo = (path: string) => {
  router.push(path);
};

const getOrCreateProfileData = async () => {
  if (!userId.value) {
    console.error('Missing user data');
    return;
  }

  try {
    console.log(userId.value)
    myProfile.value = await getOrCreateProfile(userId.value);
    return myProfile.value;
  } catch (err) {
    console.error('Error creating profile:', err);
    throw err; // Propagate error for handling
  }
};


const initAudio = () => {
  const bgAudio = document.getElementById('bg-audio') as HTMLAudioElement | null;
  if (bgAudio) {
    bgAudio.volume = 0.4;
    try {
      const playPromise = bgAudio.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error("Audio playback failed:", error);
        });
      }
    } catch (err) {
      console.error("Error playing audio:", err);
    }
  }
};

async function getUser() {
  try {
    const { userId, username } = await getCurrentUser();
    return { userId, username };
  } catch (err) {
    console.error('Not signed in');
    return null;
  }
}

onMounted(() => {
  initAudio();
  getUser().then(async data => {
    if (data) {
      userId.value = data.userId;
      await getOrCreateProfileData();
      loading.value = false;
    }
  });
});
</script>

<style scoped>
img.intro {
  max-width: 250px;
  border-radius: 10px;
}
</style>