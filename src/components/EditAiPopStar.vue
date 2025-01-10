<template>
  <div>
    <div v-if="selectedAiPopStarId">
      <p class="text-white text-left mb-0 pb-0">Name:</p>
      <el-input v-model="name" placeholder="Name" class="ma-1"></el-input>
      <p class="text-white text-left mb-0 pb-0">Public Bio:</p>
      <el-input v-model="bio" placeholder="Bio" class="ma-1"></el-input>
      <p class="text-white text-left mb-0 pb-1">Country:</p>
      <el-autocomplete v-model="selectedCountry" :fetch-suggestions="querySearch"
        placeholder="Select your country" class="ml-2 mx-auto" @select="handleCountrySelect">
        <template #default="{ item }">
          <CountryFlag :country="item.code.toLowerCase()" class="mr-2 ma-0 pa-0" />
          <span class="ml-2 c-name">{{ item.name }}</span>
        </template>
      </el-autocomplete>
      <div v-if="selectedCountry" class="mt-4 mb-8">
        <CountryFlag :country="selectedCountry.toLowerCase()" class="text-4xl" />
      </div>
    </div>
    <div v-if="myAiPopStars && myAiPopStars.length > 1 && !selectedAiPopStarId">
      <div class="el-card-container">
        <el-card v-for="item in myAiPopStars" :key="item.id" class="mb-4" @click="handleAiPopStarChange(item.id)">
          <div class="flex items-center">
            <img :src="item.imageURL ?? ''" class="w-16 h-16 rounded-full mr-4" />
            <div>
              <p class="text-lg font-bold">{{ item.name }}</p>
              <p class="text-sm">{{ item.bio }}</p>
              <CountryFlag :country="item.country?.toLowerCase() ?? ''" class="text-4xl" />
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAiCompanions } from '../composables/useAiCompanions';
import type { AiCompanionData } from '../types/schema';
import CountryFlag from 'vue-country-flag-next';
import { getData } from 'country-list';

const { fetchCompanions, updateAiPopStarFields } = useAiCompanions();

const props = defineProps<{ userId: string }>()
const name = ref('')
const bio = ref('')
const selectedCountry = ref('')
const myAiPopStars = ref<AiCompanionData[] | null>(null)
const selectedAiPopStarId = ref('')

const countries = getData().map((country: { code: string; name: string }) => ({
  code: country.code,
  name: country.name
}))

const querySearch = (queryString: string, cb: (results: { code: string; name: string }[]) => void) => {
  const results = countries.filter((country: { code: string; name: string }) => country.name.toLowerCase().includes(queryString.toLowerCase()))
  cb(results)
}

const handleCountrySelect = (item: Record<string, any>) => {
  selectedCountry.value = item.code
  console.log('selected country', item.code)
  console.log('userId', props.userId)
  updateAiPopStarFields(selectedAiPopStarId.value || '', { country: item.code })
}

const handleAiPopStarChange = (id: string) => {
  const selectedAiPopStar = myAiPopStars.value?.find((item) => item.id === id)
  if (selectedAiPopStar) {
    console.log('selectedAiPopStar', selectedAiPopStar)
    console.log('selectedAiPopStar name', selectedAiPopStar.name)
    selectedAiPopStarId.value = selectedAiPopStar.id
    name.value = selectedAiPopStar.name || ''
    console.log('name', name.value)
    bio.value = selectedAiPopStar.bio || ''
    selectedCountry.value = selectedAiPopStar.country || ''
  }
}

onMounted(() => {
  console.log('mounted', props.userId)
  fetchCompanions(props.userId).then((companions) => {
    console.log('companions', companions)
    myAiPopStars.value = companions
    if (myAiPopStars.value.length === 1) {
      selectedAiPopStarId.value = myAiPopStars.value[0].id
      name.value = myAiPopStars.value[0].name || ''
      bio.value = myAiPopStars.value[0].bio || ''
      selectedCountry.value = myAiPopStars.value[0].country || ''
    }
  })
})
</script>

<style scoped>
.genre-select {
  width: 300px;
  margin: 20px auto;
}

.el-card-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Custom styling for dark theme */
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
</style>