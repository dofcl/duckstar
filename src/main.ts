// Vue and routing
import { createApp } from "vue";
import { createRouter, createWebHistory } from 'vue-router/auto'
import { routes } from 'vue-router/auto-routes'
import App from "./App.vue";
import 'virtual:uno.css'

// UI Framework
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import "./assets/main.css";
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

// AWS
import { Amplify } from "aws-amplify";
import outputs from "../amplify_outputs.json";

const router = createRouter({
    history: createWebHistory(),
    routes,
});


Amplify.configure(outputs);

console.log('VITE_APP_PUBLIC_STATIC', import.meta.env.VITE_APP_MUSIC_GEN_ENDPOINT );


const app = createApp(App)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}
app.use(ElementPlus)
app.use(router)
app.mount('#app')