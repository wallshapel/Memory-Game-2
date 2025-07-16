<template>
    <v-app>
        <v-main>
            <v-container class="d-flex flex-column align-center justify-center" style="min-height: 100vh;" fluid>
                <h1 class="text-h5 mb-6">Player Profile</h1>

                <v-card class="pa-6" width="100%" max-width="400" rounded="xl">
                    <v-text-field ref="nameInput" v-model="name" label="Enter your name" clearable maxlength="18"
                        counter outlined dense hide-details="auto" @keydown.enter="handleEnter" />

                    <v-btn class="mt-4" color="primary" block :disabled="!isNameValid" @click="saveName">
                        💾 Save
                    </v-btn>

                    <div v-if="saved" class="text-success mt-4 text-center">
                        ✔️ Name saved
                    </div>

                    <v-btn class="mt-6" color="secondary" @click="router.push('/config')" block max-width="400">
                        ⬅ Back to Config
                    </v-btn>
                </v-card>
            </v-container>
        </v-main>
    </v-app>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { usePlayerStore } from '../store/playerStore'

const store = usePlayerStore()
const router = useRouter()

const name = ref(store.name)
const saved = ref(false)
const nameInput = ref<HTMLInputElement | null>(null)

// 🕒 Timeout ID for clearing the "saved" flag
let saveTimeoutId: number | null = null

const saveName = () => {
    if (!isNameValid.value) return
    store.setName(name.value.trim())
    saved.value = true

    if (saveTimeoutId)
        clearTimeout(saveTimeoutId)

    saveTimeoutId = setTimeout(() => {
        saved.value = false
        saveTimeoutId = null
    }, 2000)
}

// ␛ ESC to go back to config
const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape')
        router.push('/config')
}

// ⏎ Pressing Enter is equivalent to saving
const handleEnter = (event: KeyboardEvent) => {
    if (isNameValid.value) {
        event.preventDefault()
        saveName()
    }
}

// ✅ Name must be 1–18 characters long
const isNameValid = computed(() => {
    const trimmed = name.value.trim()
    return trimmed.length > 0 && trimmed.length <= 18
})

onMounted(() => {
    nameInput.value?.focus()
    window.addEventListener('keydown', handleEscape)
})

onBeforeUnmount(() => {
    window.removeEventListener('keydown', handleEscape)
    if (saveTimeoutId) clearTimeout(saveTimeoutId)
})
</script>
