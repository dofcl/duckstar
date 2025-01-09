<template>
    <Recorder />
</template>
<script>
import Recorder from '../components/Recorder.vue'
import { fadeOutAndStop } from '@/utils/fadeout';
export default {
    components: {
        Recorder
    },
    async mounted() {
        await fadeOutAndStop(2000)
    }
}
</script>