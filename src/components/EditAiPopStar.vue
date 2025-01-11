<template>
  <div>
    <DuckLoader v-if="loading" />
    
    <div v-else-if="!selectedAiPopStarId && myAiPopStars.length > 1" class="el-card-container">
      <el-card 
        v-for="star in myAiPopStars" 
        :key="star.id"
        shadow="always"
        class="hover:shadow-xl transition-all duration-300 cursor-pointer relative mb-4"
      >
        <div class="flex gap-4">
          <!-- Profile Image -->
          <div class="flex-none">
            <el-image 
              :src="star.imageURL" 
              :alt="star.name"
              class="w-24 h-24 rounded-lg object-cover"
              fit="cover"
              loading="lazy"
            >
              <template #error>
                <div class="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                  <el-icon class="text-2xl text-gray-400"><Avatar /></el-icon>
                </div>
              </template>
            </el-image>
          </div>

          <!-- Star Info -->
          <div class="flex-1 overflow-hidden">
            <h4 class="text-lg font-bold truncate text-left">
              {{ star.name }}
              <CountryFlag 
                v-if="star.country" 
                :country="star.country.toLowerCase()" 
                class="text-2xl ml-2"
              />
            </h4>

            <p class="text-sm line-clamp-3 text-left">{{ star.bio }}</p>

            <!-- Stats -->
            <div class="flex mt-1 text-sm text-gray-500 text-left">
              <span class="flex items-center">
                <el-icon class="mr-1"><Headset /></el-icon>
                Songs: {{ star.songCount || 0 }}
              </span>
              
              <span class="mx-2">|</span>
              
              <span class="flex items-center">
                <el-icon class="mr-1"><User /></el-icon>
                Followers: {{ formatNumber(star.followersCount || 0) }}
              </span>
            </div>

            <!-- Edit Button -->
            <el-button
              v-if="star.aiOwnerId === props.userId"
              class="absolute bottom-3 right-3"
              @click="handleAiPopStarChange(star)"
            >
              Edit
            </el-button>
          </div>
        </div>

        <el-tag 
          v-if="selectedAiPopStarId === star.id"
          class="absolute top-2 right-2"
          type="success"
          size="small"
          effect="dark"
        >
          Selected
        </el-tag>
      </el-card>
    </div>

    <!-- Edit Form -->
    <div v-else-if="selectedAiPopStarId" class="max-w-md mx-auto">
      <img 
        :src="currentPopStar.imageUrl" 
        class="w-48 h-48 rounded-full mx-auto mt-4" 
      />
      
      <div class="space-y-4 mt-4">
        <div>
          <label class="text-white text-left block mb-1">Name:</label>
          <el-input 
            v-model="currentPopStar.name" 
            placeholder="Name" 
            @blur="saveName"
          />
        </div>

        <div>
          <label class="text-white text-left block mb-1">Public Bio:</label>
          <el-input 
            v-model="currentPopStar.bio" 
            placeholder="Bio" 
            @blur="saveBio"
          />
        </div>

        <div>
          <label class="text-white text-left block mb-1">Country:</label>
          <el-autocomplete 
            v-model="countrySearch"
            :fetch-suggestions="querySearch"
            placeholder="Select your country"
            class="w-full"
            @select="handleCountrySelect"
          >
            <template #default="{ item }">
              <CountryFlag :country="item.code.toLowerCase()" class="mr-2" />
              <span>{{ item.name }}</span>
            </template>
          </el-autocomplete>

          <div v-if="currentPopStar.country" class="mt-4">
            <CountryFlag :country="currentPopStar.country.toLowerCase()" class="text-4xl" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAiCompanions } from '../composables/useAiCompanions'
import CountryFlag from 'vue-country-flag-next'
import { getData } from 'country-list'
import DuckLoader from '@/components/DuckLoader.vue'

interface PopStar {
  id: string
  name: string
  bio: string
  country: string
  aiOwnerId?: string
  songCount?: number
  followersCount?: number
  imageURL?: string
}

const props = defineProps<{ userId: string }>()
const { fetchCompanions, updateCompanionField } = useAiCompanions()

const loading = ref(true)
const myAiPopStars = ref<PopStar[]>([])
const selectedAiPopStarId = ref('')
const countrySearch = ref('')
const currentPopStar = ref<PopStar>({
  id: '',
  name: '',
  bio: '',
  country: '',
  imageUrl: ''
})

const countries = getData().map(country => ({
  code: country.code,
  name: country.name
}))

const querySearch = (query: string, cb: (results: { code: string; name: string }[]) => void) => {
  const results = countries.filter(country => 
    country.name.toLowerCase().includes(query.toLowerCase())
  )
  cb(results)
}

const handleCountrySelect = async (item: Record<string, any>) => {
  currentPopStar.value.country = item.code
  countrySearch.value = item.name
  await updateCompanionField(selectedAiPopStarId.value, 'country', item.code)
  saveToLocalStorage()
}

const saveName = async () => {
  await updateCompanionField(selectedAiPopStarId.value, 'name', currentPopStar.value.name)
  saveToLocalStorage()
}

const saveBio = async () => {
  await updateCompanionField(selectedAiPopStarId.value, 'bio', currentPopStar.value.bio)
  saveToLocalStorage()
}

const saveToLocalStorage = () => {
  localStorage.setItem('lastPopStarUsed', JSON.stringify(currentPopStar.value))
}

const formatNumber = (num: number) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

const handleAiPopStarChange = (star: PopStar) => {
  selectedAiPopStarId.value = star.id
  currentPopStar.value = {
    id: star.id,
    name: star.name || '',
    bio: star.bio || '',
    country: star.country || '',
    imageUrl: star.imageURL || ''
  }
  countrySearch.value = star.country || ''
  saveToLocalStorage()
}

onMounted(async () => {
  const companions = await fetchCompanions()
  if (companions) {
    myAiPopStars.value = companions
    if (companions.length === 1) {
      handleAiPopStarChange(companions[0])
    }
  }
  loading.value = false
})
</script>

<style scoped>
.el-autocomplete {
  width: 100%;
}

:deep(.el-input__wrapper) {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px var(--el-color-primary) inset;
}

:deep(.el-input__wrapper input) {
  color: white;
}

:deep(.el-input__wrapper input::placeholder) {
  color: rgba(255, 255, 255, 0.7);
}
</style>