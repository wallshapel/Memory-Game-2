<!-- src/views/ControlsConfig.vue -->
<template>
    <v-app>
        <v-main>
            <v-container class="d-flex flex-column align-center justify-center" style="min-height: 100vh" fluid>
                <h1 class="text-h5 mb-6">Control Settings</h1>

                <v-card class="pa-6" width="100%" max-width="500" rounded="xl">
                    <v-radio-group v-model="store.controlMethod" label="Select Control Method" class="mb-4">
                        <v-radio ref="radioMouse" label="🖱 Mouse (click to flip cards)" value="mouse" />
                        <v-radio ref="radioKeyboard" label="⌨️ Keyboard (arrow keys to move, Enter/Space to flip)"
                            value="keyboard" />
                    </v-radio-group>

                    <v-alert v-if="store.controlMethod === 'keyboard'" type="info" class="mb-4" border="start"
                        variant="tonal">
                        Use arrow keys (← ↑ → ↓) to move, and Enter or Space to flip the selected card.
                    </v-alert>

                    <v-btn ref="backBtn" class="mt-6" color="secondary" @click="handleBack" block>
                        ⬅ Back to Config
                    </v-btn>
                </v-card>
            </v-container>
        </v-main>
    </v-app>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { usePlayerStore } from '../store/playerStore'
import { useAudioStore } from '../store/audioStore'
import { GAME_EFFECTS } from '../constants/assets'

const router = useRouter()
const store = usePlayerStore()
const audioStore = useAudioStore()

const radioMouse = ref()
const radioKeyboard = ref()
const backBtn = ref()

const focusables = [radioMouse, radioKeyboard, backBtn]
let focusIndex = 0

// Focuses the current element (radio or button)
const focusCurrent = () => {
    const el = focusables[focusIndex].value?.$el?.querySelector('input, button') || focusables[focusIndex].value?.$el
    el?.focus()
}

// Updates store.controlMethod based on focus
const updateSelection = () => {
    if (focusables[focusIndex] === radioMouse) store.controlMethod = 'mouse'
    if (focusables[focusIndex] === radioKeyboard) store.controlMethod = 'keyboard'
}

// Plays "over" sound effect for navigation
const playOverSound = () => {
    audioStore.playEffect(GAME_EFFECTS.EFFECT_OVER)
}

// Handles keyboard navigation and selection
const handleKeyNavigation = (e: KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
        e.preventDefault()
        focusIndex = (focusIndex - 1 + focusables.length) % focusables.length
        updateSelection()
        focusCurrent()
        playOverSound()
    } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        focusIndex = (focusIndex + 1) % focusables.length
        updateSelection()
        focusCurrent()
        playOverSound()
    } else if (e.key === 'Escape') {
        e.preventDefault()
        handleBack()
    }
}

// Handles back button click (with sound)
const handleBack = () => {
    audioStore.playEffect(GAME_EFFECTS.EFFECT_SUCCESS)
    router.push('/config')
}

// Setup event listeners and initial focus
onMounted(() => {
    window.addEventListener('keydown', handleKeyNavigation)
    nextTick(() => {
        // Sets initial focus according to selected option
        focusIndex = store.controlMethod === 'keyboard' ? 1 : 0
        focusCurrent()
    })
})

onBeforeUnmount(() => {
    window.removeEventListener('keydown', handleKeyNavigation)
})

// Watcher to save controlMethod change to backend if user exists
watch(
    () => store.controlMethod,
    async () => {
        if (store.name && store.name.trim().length > 0)
            await store.saveToBackend();
    }
)
</script>
