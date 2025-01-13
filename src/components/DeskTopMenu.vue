<template>
    <div class="side-menu mt-1">
        <MenuItems mode="vertical" />
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import MenuItems from "@/components/MenuItems.vue"

const router = useRouter()
const activeIndex = ref('/')
const isVisible = ref(true)

const handleSelect = (index: string) => {
    activeIndex.value = index
    router.push(index)
}

</script>

<style scoped>
.side-menu{
    height: 100vh;
    margin-top: 50px;
}
.side-menu .el-menu {
    height: 100vh;
    position: fixed;
    z-index: 1;
    width: 200px;
}
</style>