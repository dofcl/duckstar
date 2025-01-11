<template>
    <div>
        <el-button class="float-right" @click="toggleEdit">{{ isEditing ? 'Save' : 'Edit' }}</el-button>
        <div v-if="!isEditing">
            <h4 class="ml-4 pt-0 mt-2">{{ title }}</h4>
            <div class="text-left ma-4" v-html="formattedLyricsText"></div>
            <div class="relative">
                <el-button class="float-right btm-button" @click="toggleEdit">{{ isEditing ? 'Save' : 'Edit'
                    }}</el-button>
            </div>
        </div>

        <div v-else>
            <h4 class="text-center ma-0 pa-0">{{ title }}</h4>
            <textarea v-model="editableLyricsText" class="text-left mx-4 my-4" rows="10" cols="50"></textarea>
        </div>

        <div class="text-center">
            <hr>
            <el-button class="mt-2" @click="gotoMusic" type="primary" size="large">Add Music</el-button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { defineProps, ref, computed, defineEmits, watch } from 'vue';

const props = defineProps<{
    lyricsText: string;
    title: string;
}>();

const emit = defineEmits(['update:lyricsText']);

const isEditing = ref(false);
const editableLyricsText = ref(props.lyricsText);

const toggleEdit = () => {
    if (isEditing.value) {
        // Emit the updated lyrics to the parent component
        emit('update:lyricsText', editableLyricsText.value);
    }
    isEditing.value = !isEditing.value;
};

const formattedLyricsText = computed(() => {
    return props.lyricsText.replace(/\n/g, '<br>');
});

// Watch for changes in props.lyricsText and update editableLyricsText accordingly
watch(() => props.lyricsText, (newLyrics) => {
    editableLyricsText.value = newLyrics;
});

const gotoMusic = () => {
    console.log('save lyrics to song model and trigger music creation task')
}
</script>

<style scoped>
.float-right {
    float: right;
}

.btm-button {
    bottom: 20px !important;
    position: absolute;
    right: 4px;
}
</style>