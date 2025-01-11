<template>
    <div>
        <div v-if="loading">
            <DuckLoader />
        </div>
        <div v-else>
            <div v-if="stage == 0" class="text-center">
                <h1 class="text-white ma-0 pa-0">Create your AI Pop star</h1>
                <p class="text-white mx-auto text-center mt-0">Use their voice, their face, or both—it's your choice!
                </p>
                <p class="text-white mx-auto text-center mt-0">As you gain experience, your AI pop star evolves,
                    improving its skills and competing autonomously against real and other AI singers.</p>

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
                <h1 class="text-white ma-0 pa-0">What are your favourite music genres?</h1>
                <MusicGenre :userId="userId || ''" :musicGenre="myProfile?.musicGenre || ''" />
                <el-button v-if="!(popStars?.length > 0)" @click="back()" class="ma-2 mt-0">Back</el-button>
                <el-button @click="next()" type="primary" class="ma-2 mt-0">Next</el-button>
            </div>
            <div v-else-if="stage == 2" class="text-center">
                <h1 class="text-white ma-0 pa-0 mb-2">My AI Pop Stars</h1>
                <EditAiPopStar :userId="userId || ''" />

                <div class="mt-4">
                    <el-button @click="back()" class="ma-2">Back</el-button>
                    <el-button @click="next()" type="primary" class="ma-2">Next</el-button>
                </div>
            </div>

            <div v-else-if="stage == 3" class="text-center">
                <h1 class="text-white ma-0 pa-0 mb-4">My AI Pop Star</h1>

                <img v-if="myPersona" :src="myPersona" alt="myPersona" class="persona-image rd-full" /><br>
                <div v-if="selectedCountry" class="mt-1 mb-2">
                    <CountryFlag :country="selectedCountry?.toLowerCase()" class="text-4xl" />
                </div>

                <h3 class="text-white coiny ma-0 pa-0 text-left">{{ name || '' }}</h3>
                <p class="text-white ma-0 pa-0 mb-6">{{ bio || '' }}</p>
                <el-button @click="back" class="ma-2" type="text" text>Edit</el-button><br>
                <hr>
                <el-button @click="createSong" class="ma-2" type="primary" size="large">Create a Song</el-button>
                <el-button @click="lipSyncBattle" type="primary" size="large">Lip Sync Battle</el-button>
                <br>
                <br>
            </div>
            <br>
            <br>
            <br>
        </div>
    </div>

    <el-dialog v-model="createOwnModal" title="Create Your Own AI Singer" width="80%" class="create-own-modal"
        :before-close="handleClose">
        <p class="text-red">You need to win at least 1 LipSync battle to create your own AI Singer</p>
        <p class="text-gray-300">Describe your AI singer in a few words, their look their personality and favourite
            music genres.</p>
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
import EditAiPopStar from '@/components/EditAiPopStar.vue';
import DuckLoader from '@/components/DuckLoader.vue';
import { onMounted, ref } from 'vue';
import CountryFlag from 'vue-country-flag-next';
import { useRouter } from 'vue-router';
import { useProfile } from '@/composables/useProfile';
import { useAiCompanions } from '../composables/useAiCompanions';
const { getOrCreateProfile } = useProfile();
const { createCompanion, fetchCompanions } = useAiCompanions();
import { getCurrentUser } from 'aws-amplify/auth';
import { UserPoolIdentityProvider } from 'aws-cdk-lib/aws-cognito';
const router = useRouter();
const myPersona = ref<string | null>(null);
const stage = ref<number>(0);
const createOwnModal = ref(false);
const bio = ref('');
const name = ref('');
const selectedCountry = ref();
const userId = ref<string | null>(null);
interface AiPopStar {
    aiOwnerId: string;
    followers: number | null;
    owner: string | null;
}

const popStars = ref<AiPopStar[]>([]);
interface UserProfile {
    userId: string;
    musicGenre?: string | null;
    creditLogs?: any; // Allow any type for creditLogs to avoid type incompatibility
    owner?: string;
    [key: string]: any; // Allow additional properties
}

const myProfile = ref();
const loading = ref<boolean>(true);

interface UserProfileInput {
    userId: string;
}

function handleSelectedPersona(persona: string | null) {
    myPersona.value = persona;
}

function handleClose(done: any) {
    createOwnModal.value = false;
    done();
}

function createYourOwn() {
    console.log('Create your own persona');
}

function change() {
    myPersona.value = null;
}

const getAiSeed = (filePath: string): string => {
    const fileName = filePath.split('/').pop() || '';
    const baseName = fileName.replace(/\.[^/.]+$/, ''); // Remove the file extension
    const match = baseName.match(/^(\d+|[a-zA-Z]+)$/); // Match either digits or letters
    return match ? match[1] : '';
};

const next = async () => {

    if (stage.value === 0 && myPersona.value && userId.value) {
        try {
            const aiCompanion = await createCompanion({
                aiOwnerId: userId.value,
                seedId: getAiSeed(myPersona.value),
                imageURL: myPersona.value
            });
            console.log('Added AI companion:', aiCompanion);
        } catch (error) {
            console.error('Error creating AI companion or updating profile:', error);
        }
    } else if (stage.value === 3) {
        let currentPopStar: AiPopStar | undefined = popStars.value.find((popStar: AiPopStar) => popStar.aiOwnerId === userId.value);
        if (!currentPopStar) {
            const lastPopStarUsed = localStorage.getItem('lastPopStarUsed');
            if (lastPopStarUsed) {
                currentPopStar = JSON.parse(lastPopStarUsed) as AiPopStar;
                name.value = currentPopStar.owner || '';
                bio.value = currentPopStar.owner || '';
                selectedCountry.value = currentPopStar.owner || '';
            }
        }
    }

    stage.value += 1;
};

function back() {
    stage.value -= 1;
    console.log("trigger welcome TTS");
}

function createSong() {
    console.log('Create a song');
    router.push('/create-song');
}

function lipSyncBattle() {
    router.push('/lip-sync-battle');
}

const initAudio = () => {
    const bgAudio = document.getElementById('bg-audio') as HTMLAudioElement | null;
    if (bgAudio) {
        bgAudio.volume = 0.6;
        try {
            const playPromise = bgAudio.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.error("Audio playback failed:", error);
                });
            }
        } catch (err) {
            console.error("Error playing audio:", err);
        }
    }
};

const getOrCreateProfileData = async () => {
    if (!userId.value) {
        console.error('Missing user data');
        return;
    }

    try {
        let id = userId.value;
        myProfile.value = await getOrCreateProfile(id, userId.value);

        return myProfile.value;
    } catch (err) {
        console.error('Error creating profile:', err);
        throw err; // Propagate error for handling
    }
};

const getAiPopStars = async () => {
    if (!userId.value) {
        console.error('Missing user data');
        return;
    }

    try {
        const companions = await fetchCompanions();
        if (!companions) {
            console.error('No companions found');
            return;
        }
        const aiPopStars = companions.map((popStar: any) => ({
            ...popStar,
            followers: typeof popStar.followers === 'function' ? null : popStar.followers
        }));
        popStars.value = aiPopStars;
        if (aiPopStars.length > 0) {
            stage.value = 1;
        }
        return aiPopStars;
    } catch (err) {
        console.error('Error fetching AI Pop Stars:', err);
        throw err; // Propagate error for handling
    }
};

async function getUser() {
    try {
        const { userId, username } = await getCurrentUser();
        return { userId, username };
    } catch (err) {
        console.error('Not signed in');
        return null;
    }
}

onMounted(() => {
    initAudio();
    getUser().then(async data => {
        if (data) {
            userId.value = data.userId;
            await getOrCreateProfileData();
            await getAiPopStars();
            loading.value = false;
        }
    });
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