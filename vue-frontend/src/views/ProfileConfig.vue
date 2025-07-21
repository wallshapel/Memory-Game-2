<template>
    <v-app>
        <v-main>
            <v-container class="d-flex flex-column align-center justify-center" style="min-height: 100vh;" fluid>
                <h1 class="text-h5 mb-6">Player Profile</h1>

                <v-card class="pa-6" width="100%" max-width="400" rounded="xl">
                    <v-text-field ref="nameInput" v-model="name" label="Enter your name" clearable maxlength="18"
                        counter outlined dense hide-details="auto" @keydown.enter="handleEnter"
                        @mouseenter="handleHover(0)" />

                    <v-btn ref="saveBtn" class="mt-4" color="primary" block :disabled="!isNameValid" @click="handleSave"
                        @mouseenter="handleHover(1)">
                        💾 Save
                    </v-btn>

                    <div v-if="saved" class="text-success mt-4 text-center">
                        ✔️ Name saved
                    </div>

                    <v-btn ref="backBtn" class="mt-6" color="secondary" @click="handleBack" block max-width="400"
                        @mouseenter="handleHover(2)">
                        ⬅ Back to Config
                    </v-btn>
                </v-card>
            </v-container>
        </v-main>
    </v-app>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { usePlayerStore } from '../store/playerStore'
import { useAudioStore } from '../store/audioStore'
import { GAME_EFFECTS } from '../constants/assets'

const store = usePlayerStore()
const audioStore = useAudioStore()
const router = useRouter()

const name = ref(store.name)
const saved = ref(false)

const nameInput = ref<any>(null)
const saveBtn = ref<any>(null)
const backBtn = ref<any>(null)

const elements = [nameInput, saveBtn, backBtn]
let focusedIndex = 0

let saveTimeoutId: number | null = null

const isNameValid = computed(() => {
    const trimmed = name.value.trim()
    return trimmed.length > 0 && trimmed.length <= 18
})

const handleSave = async () => {
    if (!isNameValid.value) return;
    audioStore.playEffect(GAME_EFFECTS.EFFECT_ERROR);
    store.setName(name.value.trim());

    await store.saveToBackend(); // <-- Call to backend

    saved.value = true;

    if (saveTimeoutId) clearTimeout(saveTimeoutId);

    saveTimeoutId = setTimeout(() => {
        saved.value = false;
        saveTimeoutId = null;
    }, 2000);
}

const handleBack = () => {
    audioStore.playEffect(GAME_EFFECTS.EFFECT_SUCCESS)
    router.push('/config')
}

const handleEnter = (event: KeyboardEvent) => {
    if (focusedIndex === 0 && isNameValid.value) {
        event.preventDefault()
        handleSave()
    }
}

const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
        focusedIndex = (focusedIndex + 1) % elements.length
        focusElement(focusedIndex)
        e.preventDefault()
    } else if (e.key === 'ArrowUp') {
        focusedIndex = (focusedIndex - 1 + elements.length) % elements.length
        focusElement(focusedIndex)
        e.preventDefault()
    } else if (e.key === 'Enter') {
        if (focusedIndex === 0 && isNameValid.value)
            handleSave()
        else if (focusedIndex === 1)
            handleSave()
        else if (focusedIndex === 2)
            handleBack()
        e.preventDefault()
    } else if (e.key === 'Escape') {
        handleBack()
    }
}

const focusElement = (index: number) => {
    const el = elements[index].value
    if (!el) return

    focusedIndex = index
    if (index === 0) {
        const input = el.$el?.querySelector('input') as HTMLInputElement | null
        if (input) {
            input.focus()
            input.select()
        }
    } else {
        el.$el?.focus?.()
    }
    audioStore.playEffect(GAME_EFFECTS.EFFECT_OVER)
}

const handleHover = (index: number) => {
    if (focusedIndex !== index) {
        focusedIndex = index
        elements[focusedIndex].value?.$el?.focus?.()
        audioStore.playEffect(GAME_EFFECTS.EFFECT_OVER)
    }
}

onMounted(() => {
    nextTick(() => {
        focusElement(0)
    })
    window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
    window.removeEventListener('keydown', handleKeydown)
    if (saveTimeoutId) clearTimeout(saveTimeoutId)
})
</script>
