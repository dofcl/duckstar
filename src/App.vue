<script setup lang="ts">
import { ref } from 'vue'
import { Authenticator } from "@aws-amplify/ui-vue";
import "@aws-amplify/ui-vue/styles.css";
import BottomMenu from '@/components/MainMenu.vue'
import { RouterView } from 'vue-router'
import { useRouter } from 'vue-router'
const router = useRouter()
const muted = ref(false)

function muteAudio() {
  const audio = document.getElementById('bg-audio') as HTMLAudioElement
  muted.value = !muted.value
  if (muted.value) {
    audio.volume = 0
  } else {
    audio.volume = 0.5
  }
}
</script>

<template>
  
  <div class="main-wrapper">
  <authenticator>
    <template v-slot:header>
      <div style="text-align: center" class="pa-2">
        <img
          class="amplify-image"
          alt="DuckStar logo"
          src="/images/duckstar-into.jpg"
        />
      <h1 class="ma-0 pa-0 text-white text-xlg logo-text">DuckStar</h1>
      </div>
    </template>
    <template v-slot="{ user, signOut }">
      <div class="common-layout">
        <el-container>
          <el-header style="text-align: right; font-size: 12px" height="30px">
            <div class="header-logo">
              <img src="@/assets/duck-star-logo-simple.png" alt="DuckStar logo" class="logo" />
              </div>

            <div class="header-title">
              <span class="coiny" @click="router.push('/')">DuckStar</span>
            </div>
            <div class="toolbar text-white">
              <span class="text-truncate" @click="router.push('/settings')">{{ user.username }}</span>
              <el-button type="text" @click="muteAudio">
                <div class="icon-wrapper" :class="{'muted': muted}">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <!-- Speaker cone -->
  <path d="M11 5L6 9H2v6h4l5 4V5z" 
        fill="currentColor" 
        stroke="currentColor" 
        stroke-width="1.5"
        stroke-linejoin="round"/>
  
  <!-- X mark (crossed lines) -->
  <line  v-if="muted" x1="23" y1="9" x2="17" y2="15"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"/>
  <line  v-if="muted" x1="17" y1="9" x2="23" y2="15"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"/>

         <!-- Sound waves -->
  <path  v-if="!muted" d="M14 7.5C16 9.5 16 14.5 14 16.5"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"/>
  
  <path v-if="!muted" d="M17 4.5C20.5 8 20.5 16 17 19.5"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"/>
</svg>
  </div>  
              </el-button>
              
            </div>
          </el-header>
          <el-main class="ma-0 pa-0">
            <RouterView />          
            <bottom-menu />
          </el-main>
        </el-container>
      </div>
    </template>
  </authenticator>
  </div>
  <audio id="bg-audio" src="/music/menu-bg.mp3" autoplay loop></audio>
</template>
<style>
.amplify-image {
  width: 220px;
  height: 220px;
  border-radius: 10px;
  margin: 0 auto;
  aspect-ratio: 1/1;
}
.logo-text {
    font-size: 40px;
    text-shadow: 
        -1px -1px 0 #000,
        1px -1px 0 #000,
        -1px 1px 0 #000,
        1px 1px 0 #000,
        0 0 8px #000;
}

[data-amplify-authenticator] {
  --amplify-components-authenticator-router-box-shadow: 0 0 16px var(--amplify-colors-overlay-10);
  --amplify-components-authenticator-router-border-width: 0;
  --amplify-components-authenticator-form-padding: 0 20px !important;
  --amplify-components-button-primary-background-color: var(--amplify-colors-neutral-100);
  --amplify-components-fieldcontrol-focus-box-shadow: 0 0 0 2px var(--amplify-colors-purple-60);
  --amplify-components-tabs-item-active-border-color: var(--amplify-colors-neutral-100);
  --amplify-components-tabs-item-color: var(--amplify-colors-neutral-80);
  --amplify-components-tabs-item-active-color: var(--amplify-colors-purple-100);
  --amplify-components-button-link-color: var(--amplify-colors-purple-80);
}



@media (max-width: 450px) {
    [data-amplify-authenticator] [data-amplify-container] {
        place-self: center;
        padding: 0px;
        margin: 0px;
        width: 90%;
    }
}

.login-card {
  --el-card-padding: 0;
}
.main-wrapper {
  background-color: #222;
  margin: 10px;
  padding: 10px;
  padding-bottom: 40px;
  border-radius: 5px;
  max-width: 600px;
  margin: auto;
}

button.amplify-button.amplify-field-group__control.amplify-button--primary.amplify-field-group__control.amplify-authenticator__font {
    background-color: #f9db4a;
    color: #000;
}

[data-amplify-authenticator] [data-amplify-router] {
    border-radius: 0 0 20px 20px;
}

.icon-wrapper {
    width: 24px;
    height: 24px;
    color: #fff;
    margin: -6px -8px 6px 8px;
    padding: 0px;
}

.icon-wrapper.muted {
  width: 24px;
  height: 24px;
  color: red;
}
.header-logo img {
    float: left;
    margin: -5px 11px -4px -18px;
    height: 45px;
    width: 45px;
    border-radius: 50%;
    border: 1px solid #fff;
}

.header-title{
  float: left;
    margin: 1px 0 0 0;
    font-size: 22px;
}

.toolbar {
    margin: 9px -10px 0 0;
}
</style>