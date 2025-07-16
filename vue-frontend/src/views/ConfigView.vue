<template>
    <v-app>
        <v-main>
            <v-container class="d-flex flex-column align-center justify-center" style="min-height: 100vh;" fluid>
                <v-card class="pa-6 text-center" max-width="400" width="100%">
                    <h1 class="text-h5 mb-6">Game Settings</h1>

                    <v-btn block class="mb-3" color="primary" @click="router.push('/config/profile')">
                        👤 Profile
                    </v-btn>
                    <v-btn block class="mb-3" color="primary" @click="router.push('/config/gameplay')">
                        👾 GamePlay
                    </v-btn>
                    <v-btn block class="mb-3" color="primary" @click="router.push('/config/cards')">
                        🃏 Cards
                    </v-btn>
                    <v-btn block class="mb-3" color="primary" @click="router.push('/config/controls')">
                        🎮 Controls
                    </v-btn>
                    <v-btn block class="mb-6" color="primary" @click="router.push('/config/sound')">
                        🔊 Sound
                    </v-btn>

                    <v-divider class="mb-6"></v-divider>

                    <v-btn block color="secondary" @click="router.push('/menu')">
                        ⬅ Back to Menu
                    </v-btn>
                </v-card>
            </v-container>
        </v-main>
    </v-app>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAudioStore } from '../store/audioStore'
import { OTHER_MUSICAL_BACKGROUNDS } from '../constants/assets'

const router = useRouter()
const route = useRoute()
const audioStore = useAudioStore()

const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') router.push('/menu')
}

const checkAndPlayMusic = () => {
    const expectedFile = OTHER_MUSICAL_BACKGROUNDS.settings;
    const currentSrc = audioStore.bgMusicInstance?.src || '';
    const isExpectedTrackPlaying =
        currentSrc.includes(expectedFile) && !audioStore.bgMusicInstance?.paused;

    if (!isExpectedTrackPlaying) {
        audioStore.stopAllAudio();
        audioStore.playMenuMusicLoop();
    }
};

onMounted(() => {
    window.addEventListener('keydown', handleEscape)
    if (route.path === '/config') checkAndPlayMusic()
})

watch(() => route.path, (newPath) => {
    if (newPath === '/config') checkAndPlayMusic()
})

onBeforeUnmount(() => {
    if (!router.currentRoute.value.path.startsWith('/config'))
        audioStore.stopMusic();
    window.removeEventListener('keydown', handleEscape);
});
</script>
