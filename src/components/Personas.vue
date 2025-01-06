<script setup lang="ts">
import { ref, onMounted, defineEmits } from 'vue'

const displayedImages = ref<string[]>([])
const loading = ref<boolean>(true)
const batchSize = 10
const selectedPersona = ref<string | null>(null)
const emit = defineEmits<(event: 'persona-selected', persona: string | null) => void>()

const imageModules = import.meta.glob('@/assets/images/personas/*.{jpg,jpeg,png,gif}', {
    eager: false
})

// Fisher-Yates shuffle implementation
const fisherYatesShuffle = (array: string[]) => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
}

// Shuffle all keys at start
const imageKeys = fisherYatesShuffle(Object.keys(imageModules))
let currentBatch = 0

const loadNextBatch = async () => {
  const start = currentBatch * batchSize
  const end = Math.min(start + batchSize, imageKeys.length)
  
  if (start >= imageKeys.length) return

  loading.value = true
  
  try {
    const batchPromises = imageKeys
      .slice(start, end)
      .map(async (key) => {
        const module = await imageModules[key]() as { default: string }
        return module.default
      })

    const newImages = await Promise.all(batchPromises)
    displayedImages.value.push(...newImages)
    currentBatch++
  } catch (error) {
    console.error('Error loading images:', error)
  } finally {
    loading.value = false
  }
}

// Reshuffle function if you want to add a reshuffle button
const reshuffleImages = async () => {
  displayedImages.value = []
  currentBatch = 0
  const shuffledKeys = fisherYatesShuffle(Object.keys(imageModules))
  imageKeys.splice(0, imageKeys.length, ...shuffledKeys)
  await loadNextBatch()
}

function selectPersona(index: number) {
    selectedPersona.value = displayedImages.value[index]
    console.log('Selected persona:', selectedPersona.value)
    // Emit the selected persona to the parent component
    emit('persona-selected', selectedPersona.value)
}

onMounted(async () => {
  await loadNextBatch()
})
</script>

<template>
  <div>
    <el-carousel :interval="4000" type="card" height="150px" :autoplay="true" :initial-index="0" arrow="always"
        :pause-on-hover="true" :loop="true" :motion-blur="true" :card-scale="0.8">
        <el-carousel-item v-for="(image, index) in displayedImages" :key="index" class="carousel-item" @click="selectPersona(index)">
            <img :src="image" :alt="`Image ${index + 1}`" class="carousel-image rd-full">
        </el-carousel-item>
    </el-carousel>
  </div>
</template>

<style>
.carousel-item {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
}

.carousel-image {
    width: 150px;
    height: 150px;
    object-fit: cover;
    border: 2px solid #fff;
}

.el-carousel__item.is-active .carousel-image {
    border: 4px solid var(--el-color-primary) !important;
    border-radius: 100%;
    box-shadow: 0 0 10px #000;
}

:deep(.el-carousel__item) {
    border-radius: 6px;
}

.el-carousel__indicator--horizontal {
    display: none;
}
.el-carousel__mask {
    background: transparent;
}
</style>