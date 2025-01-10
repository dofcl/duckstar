<template>
    <div class="bottom-menu" :class="{ 'menu-hidden': !isVisible }">
      <el-menu
        :default-active="activeIndex"
        mode="horizontal"
        @select="handleSelect"
      >
        <el-menu-item index="/">
          <el-icon><HomeFilled/></el-icon>
          <span>Home</span>
        </el-menu-item>
        
        <el-menu-item index="/battles">
          <el-icon><Star /></el-icon>
          <span>Battles</span>
        </el-menu-item>
        
        <el-menu-item index="/songs">
          <el-icon><Headset /></el-icon>
          <span>My Songs</span>
        </el-menu-item>
        
        <el-menu-item index="/billboard-charts">
          <el-icon><Expand /></el-icon>
          <span>Billboard</span>
        </el-menu-item>
        
        <el-menu-item index="/settings">
          <el-icon><Setting/></el-icon>
          <span>Settings</span>
        </el-menu-item>
      </el-menu>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted, onUnmounted } from 'vue'
  import { useRouter } from 'vue-router'

  const router = useRouter()
  const activeIndex = ref('/')
  const isVisible = ref(true)
  let lastScrollPosition = 0
  
  const handleSelect = (index: string) => {
    activeIndex.value = index
    router.push(index)
  }
  
  const handleScroll = () => {
    const currentScrollPosition = window.scrollY
    
    // Show menu when scrolling up, hide when scrolling down
    if (currentScrollPosition < lastScrollPosition || currentScrollPosition < 50) {
      isVisible.value = true
    } else {
      isVisible.value = false
    }
    
    lastScrollPosition = currentScrollPosition
  }
  
  // Add scroll event listener
  onMounted(() => {
    window.addEventListener('scroll', handleScroll)
  })
  
  // Clean up event listener
  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
  })
  </script>
  
  <style scoped>
  ul.el-menu.el-menu--horizontal {
    background: #222;
  }
  .el-menu--horizontal>.el-menu-item {
    color: #fff;
  }
  
  .el-menu--horizontal>.el-menu-item.active {
    color: var(--el-color-primary);
    background: #222;
  }
  
  .bottom-menu {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    border-top: 2px solid var(--el-color-primary);
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease;
    z-index: 999;
  }
  
  .menu-hidden {
    transform: translateY(100%);
  }
  
  :deep(.el-menu) {
    display: flex;
    justify-content: space-around;
    border-bottom: none;
  }
  
  :deep(.el-menu-item) {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 60px;
    line-height: normal;
    padding: 8px 0;
    color: #fff;
  }
  
  :deep(.el-icon) {
    margin-right: 0;
    margin-bottom: 4px;
    font-size: 20px;
  }
  
  :deep(.el-menu-item span) {
    font-size: 12px;
  }
  
  /* Hide bottom menu on desktop */
  @media (min-width: 768px) {
    .bottom-menu {
      display: none;
    }
  }
  </style>