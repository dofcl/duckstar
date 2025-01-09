<template>
    <div>
        <div v-if="stage == 0" class="text-center">


            <h1 class="text-white ma-0 pa-0">Create your AI companion</h1>
            <p class="text-white mx-auto text-center mt-0">Use their voice, their face, or both—it's your choice!</p>
            <p class="text-white mx-auto text-center mt-0">As you gain experience, your AI companion evolves, improving
                its skills and competing autonomously against real and AI singers.</p>

            <div v-if="!myPersona">
                <p class="text-white mx-auto text-center">
                    Click to select<br>
                    <el-icon class="large-icon mt-1">
                        <bottom />
                    </el-icon>
                </p>
                <Personas @persona-selected="handleSelectedPersona" />
                <p class="text-white">Or</p>
                <el-button @click="createOwnModal = true" class="ma-2">Create your own</el-button>
            </div>

            <div class="mx-auto text-center mt-6">
                <img v-if="myPersona" :src="myPersona" alt="myPersona" class="persona-image rd-full" /><br>
                <p class="mt-2">
                    <el-button v-if="myPersona" @click="change" class="ma-2">Change</el-button>
                    <el-button v-if="myPersona" @click="next()" type="primary" class="ma-2">Next</el-button>
                </p>
            </div>
        </div>
        <div v-else-if="stage == 1" class="text-center">
            <h1 class="text-white ma-0 pa-0">What's favourite genre?</h1>
            <MusicGenre />
            <el-button @click="back()" class="ma-2 mt-0">Back</el-button> <el-button @click="next()" type="primary"
                class="ma-2 mt-0">Next</el-button>
        </div>
        <div v-else-if="stage == 2" class="text-center">
            <h1 class="text-white ma-0 pa-0">AI Companion details.</h1>
            <p class="text-white text-left mb-0 pb-0">Name:</p>
            <el-input v-model="name" placeholder="Name" class="ma-1"></el-input>
            <p class="text-white text-left mb-0 pb-0">Public Bio:</p>
            <el-input v-model="bio" placeholder="Bio" class="ma-1"></el-input>
            <p class="text-white text-left mb-0 pb-1">Country:</p>
            <el-autocomplete v-model="selectedCountry" :fetch-suggestions="querySearch"
                placeholder="Select your country" class=" ml-2 mx-auto" @select="handleSelect">
                <template #default="{ item }">
                    <CountryFlag :country="item.code.toLowerCase()" class="mr-2 ma-0 pa-0" />
                    <span class="ml-2 c-name">{{ item.name }}</span>
                </template>
            </el-autocomplete>
            <div v-if="selectedCountry" class="mt-4 mb-8">
                <CountryFlag :country="selectedCountry?.toLowerCase()" class="text-4xl" />
            </div>
            <div class="mt-4">
                <el-button @click="back()" class="ma-2">Back</el-button> <el-button @click="next()" type="primary"
                    class="ma-2">Next</el-button>
            </div>
        </div>

        <div v-else-if="stage == 3" class="text-center">
            <h1 class="text-white ma-0 pa-0 mb-4">Review AI Companion</h1>

            <img v-if="myPersona" :src="myPersona" alt="myPersona" class="persona-image rd-full" /><br>
            <div v-if="selectedCountry" class="mt-1 mb-2">
                <CountryFlag :country="selectedCountry?.toLowerCase()" class="text-4xl" />
            </div>

            <h3 class="text-white coiny ma-0 pa-0">{{ name }}</h3>
            <p class="text-white ma-0 pa-0 mb-6">{{ bio }}</p>
            <el-button @click="back" class="ma-2" type="text" text>Edit</el-button><br>
            <hr>
            <el-button @click="createSong" class="ma-2">Create a Song</el-button>
            <el-button @click="lipSyncBattle" type="primary">Lip Sync Battle</el-button>
            <br>
            <br>
        </div>
        <br>
        <br>
        <br>

    </div>

    <el-dialog v-model="createOwnModal" title="Create Your Own AI Singer" width="80%" class="create-own-modal"
        :before-close="handleClose">
        <p class="text-red">You need to win at least 1 LipSync battle to create your own AI Singer</p>
        <p class="text-gray-300">Describe your AI singer in a few words, their look their personality and favourite
            music
            genres.</p>
        <el-input></el-input>

        <template #footer>
            <div class="dialog-footer">
                <el-button type="primary" @click="createOwnModal = false">
                    Close
                </el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
import MusicGenre from '@/components/MusicGenre.vue';
import Personas from '@/components/Personas.vue';
import { onMounted, ref } from 'vue';
import CountryFlag from 'vue-country-flag-next'
import { getData } from 'country-list'
import { useRouter } from 'vue-router';
import { useProfile } from '@/composables/useProfile'
const { getOrCreateProfile, loading, error, updateProfile } = useProfile()
import { getCurrentUser } from 'aws-amplify/auth'
const router = useRouter();
const bgAudio = document.getElementById('bg-audio') as HTMLAudioElement;
const myPersona = ref<string | null>(null)
const stage = ref(0)
const createOwnModal = ref(false)
const name = ref('')
const bio = ref('')
const selectedCountry = ref<string>('')
const userId = ref<string | null>(null)
const countries = getData().map((country: { code: string; name: string }) => ({
    code: country.code,
    name: country.name
}))

const querySearch = (queryString: string, cb: (results: { code: string; name: string }[]) => void) => {
    const results = countries.filter((country: { code: string; name: string }) => country.name.toLowerCase().includes(queryString.toLowerCase()))
    cb(results)
}

const handleSelect = (item: Record<string, any>) => {
    selectedCountry.value = item.code
}

function handleSelectedPersona(persona: string | null) {
    myPersona.value = persona
}

function handleClose(done: any) {
    createOwnModal.value = false
    done()
}

function createYourOwn() {
    console.log('Create your own persona');
}

function change() {
    myPersona.value = null

}
function next() {
    stage.value += 1
    console.log("trigger welcome TTS")

}
function back() {
    stage.value -= 1
    console.log("trigger welcome TTS")

}

function createSong() {
    console.log('Create a song');
    router.push('/create-song');
}


function lipSyncBattle() {
    router.push('/lip-sync-battle');
}

const initAudio = () => {
    if (bgAudio) {
        bgAudio.volume = 0.6; // Set initial volume
        bgAudio.play();
    }
}

const completeOnboarding = async () => {
    console.log('completeOnboarding',userId.value)
    if (userId.value) {
        const userData = {
            userId: userId.value as string,
            username: '', // Add appropriate value
            email: '' // Add appropriate value
        };
        await getOrCreateProfile(userData).then((data) => {
            console.log('Profile created', data)
        }).catch((err) => {
            console.error('Error creating profile', err)
        })
    }
}

async function getUser() {
    try {
        const { userId, } = await getCurrentUser()
        console.log('User ID:', userId)
        return userId
    } catch (err) {
        console.error('Not signed in')
        return null
    }
}
onMounted(() => {
    initAudio();
    getUser().then(id => {
    userId.value = id
    completeOnboarding()
    }
)
    

});

</script>
<style>
.persona-image {
    width: 150px;
    height: 150px;
    border-radius: 100%;
    margin: 0 auto;
    aspect-ratio: 1/1;
    border: 4px solid var(--el-color-primary) !important;
    border-radius: 100%;
    box-shadow: 0 0 10px #000;
}

.create-own-modal {
    max-width: 500px;
}

.el-carousel__arrow--left,
.el-carousel__arrow--right {
    border: 2px solid #fff;
    background: #0202028c;
}
</style>