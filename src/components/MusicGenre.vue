<template>
    <div>
      <el-select
        v-model="selectedGenres"
        multiple
        collapse-tags
        collapse-tags-tooltip
        :max-collapse-tags="3"
        placeholder="Select your favorite music genres"
        class="genre-select"
        @change="handleGenreChange"
      >
        <el-option-group
          v-for="group in genreGroups"
          :key="group.label"
          :label="group.label"
        >
          <el-option
            v-for="genre in group.genres"
            :key="genre.value"
            :label="genre.label"
            :value="genre.value"
          />
        </el-option-group>
      </el-select>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  
  const emit = defineEmits(['genres-selected'])
  
  const selectedGenres = ref([])
  
  const genreGroups = [
    {
      label: 'Popular',
      genres: [
        { label: 'Pop', value: 'pop' },
        { label: 'Rock', value: 'rock' },
        { label: 'Hip Hop', value: 'hiphop' },
        { label: 'R&B', value: 'rnb' }
      ]
    },
    {
      label: 'Classical & Jazz',
      genres: [
        { label: 'Classical', value: 'classical' },
        { label: 'Jazz', value: 'jazz' },
        { label: 'Blues', value: 'blues' }
      ]
    },
    {
      label: 'Electronic',
      genres: [
        { label: 'House', value: 'house' },
        { label: 'Techno', value: 'techno' },
        { label: 'Dubstep', value: 'dubstep' },
        { label: 'Trance', value: 'trance' }
      ]
    },
    {
      label: 'World Music',
      genres: [
        { label: 'Latin', value: 'latin' },
        { label: 'Reggae', value: 'reggae' },
        { label: 'African', value: 'african' },
        { label: 'Folk', value: 'folk' }
      ]
    }
  ]
  
  const handleGenreChange = (value) => {
    console.log('Selected genres:', value)
    emit('genres-selected', value)
  }
  </script>
  
  <style scoped>
  .genre-select {
    width: 300px;
    margin: 20px auto;
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
    color: white;
  }
  </style>
  