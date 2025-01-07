<template>
  <img src="/images/duckstar-into.jpg" alt="DuckStar" class="intro" />
  <br>

  <div class="mx-auto text-center">
    <p class="text-white coiny text-xl">Have you got what it takes to be the next DuckStar!?</p>
  <el-button @click="navTo('/onboard')" type="primary" size="large" class="button">Get Started</el-button>
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