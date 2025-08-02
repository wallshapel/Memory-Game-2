<!-- src/views/ConfigView.vue -->
<template>
    <v-app>
        <v-main>
            <v-container class="d-flex flex-column align-center justify-center" style="min-height: 100vh;" fluid>
                <v-card class="pa-6 text-center" max-width="400" width="100%">
                    <h1 class="text-h5 mb-6">Game Settings</h1>

                    <v-btn ref="btn0" block class="mb-3" color="primary" @click="() => handleClick('/config/profile')"
                        @mouseenter="handleHover(0)">
                        👤 Profile
                    </v-btn>
                    <v-btn ref="btn1" block class="mb-3" color="primary" @click="() => handleClick('/config/gameplay')"
                        @mouseenter="handleHover(1)">
                        👾 GamePlay
                    </v-btn>
                    <v-btn ref="btn2" block class="mb-3" color="primary" @click="() => handleClick('/config/cards')"
                        @mouseenter="handleHover(2)">
                        🃏 Cards
                    </v-btn>
                    <v-btn ref="btn3" block class="mb-3" color="primary" @click="() => handleClick('/config/controls')"
                        @mouseenter="handleHover(3)">
                        🎮 Controls
                    </v-btn>
                    <v-btn ref="btn4" block class="mb-6" color="primary" @click="() => handleClick('/config/sound')"
                        @mouseenter="handleHover(4)">
                        🔊 Sound
                    </v-btn>

                    <v-divider class="mb-6"></v-divider>

                    <v-btn ref="btn5" block color="secondary" @click="() => handleClick('/menu')"
                        @mouseenter="handleHover(5)">
                        ⬅ Back to Menu
                    </v-btn>
                </v-card>
            </v-container>
        </v-main>
    </v-app>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAudioStore } from '../store/audioStore'
import { OTHER_MUSICAL_BACKGROUNDS, GAME_EFFECTS } from '../constants/assets'

const router = useRouter()
const route = useRoute()
const audioStore = useAudioStore()

// Button refs for focus management
const btn0 = ref<any>(null)
const btn1 = ref<any>(null)
const btn2 = ref<any>(null)
const btn3 = ref<any>(null)
const btn4 = ref<any>(null)
const btn5 = ref<any>(null)
const buttons = [btn0, btn1, btn2, btn3, btn4, btn5]

let focusedIndex = 0

// Handles keyboard navigation (arrow keys, Enter, Escape)
function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'ArrowDown')
        focusedIndex = (focusedIndex + 1) % buttons.length,
            buttons[focusedIndex].value?.$el?.focus(),
            audioStore.playEffect(GAME_EFFECTS.EFFECT_OVER),
            e.preventDefault()
    else if (e.key === 'ArrowUp')
        focusedIndex = (focusedIndex - 1 + buttons.length) % buttons.length,
            buttons[focusedIndex].value?.$el?.focus(),
            audioStore.playEffect(GAME_EFFECTS.EFFECT_OVER),
            e.preventDefault()
    else if (e.key === 'Enter')
        audioStore.playEffect(GAME_EFFECTS.EFFECT_SUCCESS),
            buttons[focusedIndex].value?.$el?.click(),
            e.preventDefault()
    else if (e.key === 'Escape')
        router.push('/menu')
}

// Handles mouse hover for sound feedback and focus
const handleHover = (index: number) => {
    focusedIndex = index
    buttons[focusedIndex].value?.$el?.focus()
    audioStore.playEffect(GAME_EFFECTS.EFFECT_OVER)
}

// Handles button click with sound and navigation
const handleClick = (routePath: string) => {
    audioStore.playEffect(GAME_EFFECTS.EFFECT_SUCCESS)
    router.push(routePath)
}

/**
 * Ensures correct background music for the config root view.
 * If coming from SoundConfig, avoids replaying config music.
 * If coming from outside config, or returning from SoundConfig, ensures config music is active.
 */
const checkAndPlayMusic = () => {
    const expectedFile = OTHER_MUSICAL_BACKGROUNDS.settings
    const currentSrc = audioStore.bgMusicInstance?.src || ''
    const isExpectedTrackPlaying =
        currentSrc.includes(expectedFile) && !audioStore.bgMusicInstance?.paused

    if (!isExpectedTrackPlaying)
        audioStore.stopAllAudio(),
            audioStore.playMenuMusicLoop()
}

// On mount, focus first button and ensure config music is playing if on config root
onMounted(() => {
    if (route.path === '/config') checkAndPlayMusic()

    nextTick(() => {
        focusedIndex = 0
        buttons[focusedIndex].value?.$el?.focus()
    })

    window.addEventListener('keydown', handleKeydown)
})

/**
 * Watches route changes.
 * - If returning to config root either from outside config or from SoundConfig,
 *   checks if background music needs to be (re)started.
 */
watch(() => route.path, (newPath, oldPath) => {
    const comingFromSound = oldPath === '/config/sound'
    const comingFromOutsideConfig = !oldPath.startsWith('/config')
    if (newPath === '/config' && (comingFromSound || comingFromOutsideConfig))
        checkAndPlayMusic()
})

// On unmount, stop music only if leaving the config area entirely
onBeforeUnmount(() => {
    if (!router.currentRoute.value.path.startsWith('/config'))
        audioStore.stopMusic()
    window.removeEventListener('keydown', handleKeydown)
})
</script>
