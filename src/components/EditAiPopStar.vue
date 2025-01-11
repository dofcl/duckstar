<template>
    <div>
        <div v-if="loading">
            <DuckLoader />
            </div>
            <div v-else>
              
      <div v-if="myAiPopStars && myAiPopStars.length > 1 && !selectedAiPopStarId">
        <div v-if="myAiPopStars && myAiPopStars.length > 1 && !selectedAiPopStarId">
      <div class="el-card-container">
        <el-card 
        v-for="item in myAiPopStars" 
        :key="item.id" 
        shadow="always"
        class="hover:shadow-xl transition-all duration-300 cursor-pointer relative mb-4"
      >

        <div class="flex gap-4 ">
          <!-- Left column: Image and flag -->
          <div class="flex-none">
            <div class="relative">
              <el-image 
                :src="item.imageURL || ''" 
                :alt="item.name"
                class="w-24 h-24 rounded-lg object-cover mb-0 pb-0"
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
          </div>
    
          <!-- Right column: Content -->
          <div class="flex-1 overflow-hidden">
              <h4 class="text-lg font-bold truncate block pa-0 ma-0 text-left">{{ item.name||'' }}
                <span class="name-flag ml-2 mb-2">
                <CountryFlag 
                  v-if="item.country" 
                  :country="item.country.toLowerCase()" 
                  class="text-2xl"
                />
                </span>
              </h4>
              <p class="text-sm line-clamp-3 block pa-0 ma-0 bio-truncate text-left">
                {{ item.bio || '' }}
              </p>
              <div class="flex bottom mb-7">
                
              
                <!-- Stats section -->
                <div class="flex-1  text-sm text-gray-500 mt-1 text-left">
                <span>Songs:</span>
                    <span v-if="item.songCount" class="flex items-center">
                  <el-icon class="mr1"><Headset /></el-icon>
                  {{ item.songCount }}
                </span>
                <span v-else>
                    0
                </span>
                  &nbsp;|&nbsp; 
              
              
                <span>Followers:</span>
                <span v-if="item.followersCount" class="flex">
                  <el-icon class="mr1"><User /></el-icon>
                  {{ formatNumber(item.followersCount) }}
                </span>
                <span v-else>
                    0
                </span>

                <el-button  v-if="item.aiOwnerId === props.userId"
                  class="absolute bottom-3 right-3"
                  @click="handleAiPopStarChange(item)"
                >Edit</el-button>

                </div>
              
            </div>
          </div>
        </div>

        <!-- Selection indicator -->
        <el-tag 
          v-if="selectedAiPopStarId === item.id"
          class="absolute top-2 right-2"
          type="success"
          size="small"
          effect="dark"
        >
          Selected
        </el-tag>
      </el-card>
      </div>
    </div>
      </div>
      <div v-else-if="selectedAiPopStarId">
        <img :src="currentPopStar.imageUrl" class="w-48 h-48 rounded-full mx-auto roundBorder mt-4 mb-0 pb-0" />
        <p class="text-white text-left mb-0 pb-0 mt-0 pt-0">Name:</p>
        <el-input 
          v-model="currentPopStar.name" 
          placeholder="Name" 
          class="ma-1" 
          @blur="saveName">
        </el-input>
        
        <p class="text-white text-left mb-0 pb-0">Public Bio:</p>
        <el-input 
          v-model="currentPopStar.bio" 
          placeholder="Bio" 
          class="ma-1" 
          @blur="saveBio">
        </el-input>
        
        <p class="text-white text-left mb-0 pb-1">Country:</p>
        <el-autocomplete 
          v-model="countrySearch"
          :fetch-suggestions="querySearch"
          placeholder="Select your country" 
          class="ml-2 mx-auto" 
          @select="handleCountrySelect">
          <template #default="{ item }">
            <CountryFlag :country="item.code.toLowerCase()" class="mr-2 ma-0 pa-0" />
            <span class="ml-2 c-name">{{ item.name }}</span>
          </template>
        </el-autocomplete>
        
        <div v-if="currentPopStar.country" class="mt-4 mb-8">
          <CountryFlag :country="currentPopStar.country.toLowerCase()" class="text-4xl" />
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
    
  const { fetchCompanions, updateCompanionField } = useAiCompanions()
  const props = defineProps<{ userId: string }>()
  const myAiPopStars = ref<AiCompanionDataItem[]>([])
  const selectedAiPopStarId = ref('')
  const countrySearch = ref('')
  const loading = ref(true)

  
  // Use a reactive object to store current pop star data
  const currentPopStar = ref({
    id: '',
    name: '',
    bio: '',
    country: '',
    imageUrl: ''
  })
  
  const countries = getData().map((country: { code: string; name: string }) => ({
    code: country.code,
    name: country.name
  }))
  
  const querySearch = (queryString: string, cb: (results: { code: string; name: string }[]) => void) => {
    const results = countries.filter(
      (country: { code: string; name: string }) => 
      country.name.toLowerCase().includes(queryString.toLowerCase())
    )
    cb(results)
  }
  
  const handleCountrySelect = async (item: Record<string, any>) => {
    currentPopStar.value.country = item.code
    countrySearch.value = item.name
    await updateCompanionField(selectedAiPopStarId.value, 'country', currentPopStar.value.country);
  }
  
  const saveName = async () => {
    await updateCompanionField(selectedAiPopStarId.value, 'name', currentPopStar.value.name);

  }
  
  const saveBio = async () => {
    await updateCompanionField(selectedAiPopStarId.value, 'bio', currentPopStar.value.bio);
  }
  
  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  interface AiCompanionDataItem {
    id: string;
    name: string;
    bio: string;
    country: string;
    imageURL: string;
    songCount?: number;
    followersCount?: number;
    aiOwnerId?: string;
  }

  const handleAiPopStarChange = (row: AiCompanionData) => {
      const selected = myAiPopStars.value?.find((item) => item.id === row.id)
      changeSelectedPopStar(selected)
  }
  function changeSelectedPopStar(selected: AiCompanionData | undefined) {
    if (selected) {
        selectedAiPopStarId.value = selected.id
        console.log(selected)
      currentPopStar.value = {
        id: selected.id,
        name: selected.name || '',
        bio: selected.bio || '',
        country: selected.country || '',
        imageUrl: selected.imageURL || ''
      }
      countrySearch.value = selected.country || '';
      localStorage.setItem('lastPopStarUsed', JSON.stringify(currentPopStar.value))
    }
  }

  onMounted(async () => {

    const companions = await fetchCompanions()
    if (companions) {
      myAiPopStars.value = companions;
      
      if (companions.length === 1) {
        selectedAiPopStarId.value = companions[0].id
        changeSelectedPopStar(companions[0])
      }
    }
    loading.value = false
  })
  </script>
  
  <style scoped>
  .genre-select {
    width: 300px;
    margin: 20px auto;
  }
  
  :deep(.el-select) {
    --el-select-border-color-hover: var(--el-color-primary);
  }
  
  :deep(.el-select .el-input__wrapper) {
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 8px;
  }
  
  :deep(.el-select .el-input__wrapper.is-focus) {
    box-shadow: 0 0 0 1px var(--el-color-primary) inset;
  }
  
  :deep(.el-input__wrapper input) {
    color: white;
  }
  
  :deep(.el-select .el-input__wrapper input::placeholder) {
    color: rgba(255, 255, 255, 0.7);
  }
  
  :deep(.el-select__tags) {
    background-color: transparent;
  }
  
  :deep(.el-tag) {
    background-color: var(--el-color-primary);
    border-color: var(--el-color-primary);
    color: black;
  }

  .bio-truncate {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  } 
  </style>