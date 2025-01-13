<template>
  <el-menu :default-active="activeIndex" :mode="props.mode" @select="handleSelect">
    <el-menu-item index="/">
      <el-icon>
        <HomeFilled />
      </el-icon>
      <span>Home</span>
    </el-menu-item>

    <el-menu-item index="/battles">
      <el-icon>
        <Star />
      </el-icon>
      <span>Battles</span>
    </el-menu-item>

    <el-menu-item index="/songs">
      <el-icon>
        <Headset />
      </el-icon>
      <span>My Songs</span>
    </el-menu-item>

    <el-menu-item index="/billboard-charts">
      <el-icon>
        <Expand />
      </el-icon>
      <span>Billboard</span>
    </el-menu-item>

    <el-menu-item index="/settings">
      <el-icon>
        <Setting />
      </el-icon>
      <span>Settings</span>
    </el-menu-item>
  </el-menu>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

interface Props {
  mode?: 'horizontal' | 'vertical'
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'horizontal'
})

const router = useRouter()
const activeIndex = ref('/')
const isVisible = ref(true)

const handleSelect = (index: string) => {
  activeIndex.value = index
  router.push(index)
}
</script>
<style scoped></style>