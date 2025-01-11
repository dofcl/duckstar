<template>
    <div class="ma-0 pa-0">
        <el-select v-model="selectedGenres" :multiple="allowMultiple" collapse-tags collapse-tags-tooltip
            :max-collapse-tags="3" :placeholder="placeholder" class="genre-select" size="large">
            <el-option v-for="genre in genres" :key="genre.value" :label="genre.label" :value="genre.value"
                class="text-black" />
        </el-select>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useProfile } from '@/composables/useProfile'
const { updateProfileField } = useProfile()
const emit = defineEmits(['genres-selected'])

const selectedGenres = ref<string[]>([])

const placeholder = ref('Select your favorite music genres')
const allowMultiple = ref(true)

interface Profile {
    musicGenre: string[]
}

const props = defineProps<{ userId: string, musicGenre: string, saveInComponent: boolean }>()

const genres = [
    { label: 'African', value: 'african' },
    { label: 'Alternative', value: 'alternative' },
    { label: 'Bachata', value: 'bachata' },
    { label: 'Blues', value: 'blues' },
    { label: 'Bollywood', value: 'bollywood' },
    { label: 'Classical', value: 'classical' },
    { label: 'Country', value: 'country' },
    { label: 'Dubstep', value: 'dubstep' },
    { label: 'Folk', value: 'folk' },
    { label: 'Gospel', value: 'gospel' },
    { label: 'Grunge', value: 'grunge' },
    { label: 'Hip Hop', value: 'hiphop' },
    { label: 'House', value: 'house' },
    { label: 'Indie', value: 'indie' },
    { label: 'J-Pop', value: 'jpop' },
    { label: 'Jazz', value: 'jazz' },
    { label: 'K-Pop', value: 'kpop' },
    { label: 'Latin', value: 'latin' },
    { label: 'Merengue', value: 'merengue' },
    { label: 'Metal', value: 'metal' },
    { label: 'Pop', value: 'pop' },
    { label: 'Punk', value: 'punk' },
    { label: 'R&B', value: 'rnb' },
    { label: 'Reggae', value: 'reggae' },
    { label: 'Reggaeton', value: 'reggaeton' },
    { label: 'Rock', value: 'rock' },
    { label: 'Salsa', value: 'salsa' },
    { label: 'Techno', value: 'techno' },
    { label: 'Trance', value: 'trance' }
]



const handleGenreChange = async (value: any) => {
    emit('genres-selected', value)
    if (props.saveInComponent) {
        await updateProfileField(props.userId, 'musicGenre', JSON.stringify(value));
    } else {
        placeholder.value = "Select a genre"
        allowMultiple.value = false
    }
}
// Watch for changes to selectedGenre
watch(selectedGenres, (newGenre) => {
    console.log('save', newGenre)
    handleGenreChange(newGenre);
});

onMounted(() => {
    if (props.musicGenre) {
        selectedGenres.value = JSON.parse(props.musicGenre)
    }
})

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
    color: black;
}
</style>