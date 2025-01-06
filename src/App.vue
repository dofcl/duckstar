<script setup lang="ts">
import { Authenticator } from "@aws-amplify/ui-vue";
import "@aws-amplify/ui-vue/styles.css";
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
          <el-header style="text-align: right; font-size: 12px">
            <div class="toolbar text-white">
              <span class="text-truncate">{{ user.username }}</span>
              <el-dropdown>
                <el-icon style="margin-right: 8px; margin-top: 1px">
                  <setting class="text-white" />
                </el-icon>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="signOut">Sign Out</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
              
            </div>
          </el-header>
          <el-main class="ma-0 pa-0">
            <RouterView />
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
  padding: 20px;
  padding-bottom: 40px;
  border-radius: 50px;
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

</style>