<template>
    <div class="ma-0 pa-0">
        <template v-if="allowMultiple">
            <el-select v-model="selectedGenres" filterable remote :remote-method="filterGenres" :loading="loading"
                multiple collapse-tags collapse-tags-tooltip :max-collapse-tags="3" :placeholder="placeholder"
                class="genre-select ma-0 pa-0 w-full" size="large">
                <el-option v-for="genre in filteredGenres" :key="genre.value" :label="genre.label" :value="genre.value"
                    class="text-black" />
            </el-select>
        </template>
        <template v-else>
            <el-autocomplete v-model="singleGenre" :fetch-suggestions="querySearch" :placeholder="placeholder"
                class="genre-select ma-0 pa-0 w-full" @select="handleSelect" :trigger-on-focus="true" size="large">
                <template #default="{ item }">
                    <div class="suggestion-item">
                        {{ item.label }}
                    </div>
                </template>
            </el-autocomplete>
        </template>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useProfile } from '@/composables/useProfile'
import { genres } from '@/utils/musicGenres';

const { updateProfileField } = useProfile()
const emit = defineEmits(['genres-selected'])

const selectedGenres = ref<string[]>([])
const singleGenre = ref('')
const loading = ref(false)
const filteredGenres = ref<Genre[]>([])

const placeholder = ref('Select your favorite music genres')
const allowMultiple = ref(true)

interface Genre {
    label: string
    value: string
}

const props = defineProps<{
    userId: string
    musicGenre: string
    saveInComponent: boolean
}>()



const filterGenres = (query: string) => {
    if (query) {
        const results = genres.filter(genre =>
            genre.label.toLowerCase().includes(query.toLowerCase())
        )
        filteredGenres.value = results
    } else {
        filteredGenres.value = genres
    }
}

const querySearch = (queryString: string, cb: (arg: Genre[]) => void) => {
    const results = queryString
        ? genres.filter(genre =>
            genre.label.toLowerCase().includes(queryString.toLowerCase())
        )
        : genres
    cb(results)
}

const handleSelect = (item: Genre) => {
    if (allowMultiple.value) {
        if (!selectedGenres.value.includes(item.value)) {
            selectedGenres.value.push(item.value)
        }
    } else {
        handleGenreChange([item.value])
    }
}

const handleGenreChange = async (value: string[]) => {
    emit('genres-selected', value)
    if (props.saveInComponent) {
        await updateProfileField(props.userId, 'musicGenre', JSON.stringify(value))
    } else {
        placeholder.value = "Select a genre"
        allowMultiple.value = false
    }
}

// Watch for changes to selectedGenres
watch(selectedGenres, (newGenre) => {
    console.log('save', newGenre)
    handleGenreChange(newGenre)
})

// Watch for changes to singleGenre in non-multiple mode
watch(singleGenre, (newValue) => {
    if (!allowMultiple.value && newValue) {
        const genre = genres.find(g => g.label.toLowerCase() === newValue.toLowerCase())
        if (genre) {
            handleGenreChange([genre.value])
        }
    }
})

onMounted(() => {
    filteredGenres.value = genres
    if (props.musicGenre) {
        try {
            const parsedGenres = JSON.parse(props.musicGenre)
            selectedGenres.value = Array.isArray(parsedGenres) ? parsedGenres : [parsedGenres]
            if (!allowMultiple.value && selectedGenres.value.length > 0) {
                const genre = genres.find(g => g.value === selectedGenres.value[0])
                if (genre) {
                    singleGenre.value = genre.label
                }
            }
        } catch (error) {
            console.error('Error parsing music genre:', error)
        }
    }
})
</script>

<style scoped>
.genre-select {
    width: 100%;
    margin: 20px auto;
}

.suggestion-item {
    padding: 8px;
    color: var(--el-text-color-primary);
}

/* Custom styling for dark theme */
:deep(.el-select),
:deep(.el-autocomplete) {
    --el-select-border-color-hover: var(--el-color-primary);
}

:deep(.el-select .el-input__wrapper),
:deep(.el-autocomplete .el-input__wrapper) {
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 8px;
}

:deep(.el-select .el-input__wrapper.is-focus),
:deep(.el-autocomplete .el-input__wrapper.is-focus) {
    box-shadow: 0 0 0 1px var(--el-color-primary) inset;
}

:deep(.el-input__wrapper input) {
    color: white;
}

:deep(.el-select .el-input__wrapper input::placeholder),
:deep(.el-autocomplete .el-input__wrapper input::placeholder) {
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

:deep(.el-autocomplete-suggestion) {
    background-color: var(--el-bg-color);
}

:deep(.el-autocomplete-suggestion__list) {
    color: var(--el-text-color-primary);
}
</style>