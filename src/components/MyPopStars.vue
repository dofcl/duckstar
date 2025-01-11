<template>
    <h1>My AI Pop Stars</h1>
<EditAiPopStar/>
</template>
<script lang="ts">
import { onMounted } from 'vue'
import EditAiPopStar from './EditAiPopStar.vue'
export default {
    name: 'MyPopStars',
}

onMounted(() => {
    console.log('MyPopStars mounted')
})
</script>