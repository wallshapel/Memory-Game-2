<!-- src/views/CardsConfig.vue -->
<template>
    <v-app>
        <v-main>
            <v-container class="d-flex flex-column align-center justify-center" style="min-height: 100vh;" fluid>
                <h1 class="text-h5 mb-6">Card Back Cover</h1>

                <v-card class="pa-6 text-center" width="100%" max-width="500" rounded="xl">
                    <!-- Cover selection grid -->
                    <div class="mb-4">
                        <label class="text-subtitle-1 font-weight-medium mb-2 d-block text-center">
                            Select Cover
                        </label>
                        <v-row dense>
                            <!-- Default cover option -->
                            <v-col cols="6" class="text-center mx-auto">
                                <v-card class="pa-2" rounded="lg" :elevation="store.coverType === 'default' ? 10 : 2"
                                    :class="store.coverType === 'default' ? 'border border-primary bg-grey-lighten-4' : ''"
                                    style="cursor: pointer;" @click="selectDefaultCover">
                                    <v-img :src="defaultImage" aspect-ratio="2/3" class="mb-2" contain />
                                    <span class="text-caption">Default</span>
                                </v-card>
                            </v-col>
                            <!-- Uploaded cover option (if available) -->
                            <v-col cols="6" v-if="uploadedUrl" class="text-center">
                                <v-card class="pa-2" rounded="lg" :elevation="store.coverType === 'uploaded' ? 10 : 2"
                                    :class="store.coverType === 'uploaded' ? 'border border-primary bg-grey-lighten-4' : ''"
                                    style="cursor: pointer;" @click="store.setCoverType('uploaded')">
                                    <v-img :src="uploadedUrl" aspect-ratio="2/3" class="mb-2" contain />
                                    <span class="text-caption">Uploaded</span>
                                </v-card>
                            </v-col>
                        </v-row>
                    </div>

                    <!-- File input for uploading a cover -->
                    <v-file-input ref="fileInput" accept="image/png" label="Upload Custom Cover (.png, max 5MB)"
                        @update:modelValue="handleFile" prepend-icon="mdi-upload" outlined dense hide-details
                        class="mb-4" />

                    <!-- Back button to config menu -->
                    <v-btn ref="backBtn" class="mt-6" color="secondary" @click="handleBack" block>
                        ⬅ Back to Config
                    </v-btn>
                </v-card>

                <!-- Modal for error feedback -->
                <AlertModal v-model="showError" :title="store.name ? 'Invalid File' : 'User Required'"
                    :message="store.name ? 'Only .png files under 5MB are allowed.' : 'Please set your user name before uploading a cover.'"
                    actionLabel="OK" @confirm="showError = false" />
            </v-container>
        </v-main>
    </v-app>
</template>

<script setup lang="ts">
import { ref, defineAsyncComponent, onMounted, onBeforeUnmount, computed } from 'vue'
import { useRouter } from 'vue-router'
import { usePlayerStore } from '../store/playerStore'
import { useAudioStore } from '../store/audioStore'
import { BASE_PATH_IMAGE_RESOURCES, DEFAULT_COVER_IMAGE, FULL_BASE_PATH_IMAGE_RESOURCES, GAME_EFFECTS } from '../constants/assets'
import { uploadCover } from '../api/backend/cover'

const AlertModal = defineAsyncComponent(() => import('../components/AlertModal.vue'))

const router = useRouter()
const store = usePlayerStore()
const audioStore = useAudioStore()

// Path for default card back cover image
const defaultImage = `${BASE_PATH_IMAGE_RESOURCES.COVERS_PATH}${DEFAULT_COVER_IMAGE}`

const showError = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const backBtn = ref<HTMLButtonElement | null>(null)

/**
 * Returns the image URL for the uploaded card cover.
 * - Returns object URL if user just uploaded a file.
 * - Returns backend URL if there's a stored filename.
 * - Returns null if none is available.
 */
const uploadedUrl = computed(() => {
    if (store.coverType === "default") return null
    if (store.coverFile) return URL.createObjectURL(store.coverFile)
    if (store.coverType === "uploaded" && store.coverFileName)
        return `${FULL_BASE_PATH_IMAGE_RESOURCES.COVERS_PATH}${store.coverFileName}`
    return null
})

// Focus the file input on mount and listen for ESC key
onMounted(() => {
    fileInput.value?.focus()
    window.addEventListener('keydown', handleEscape)
})

onBeforeUnmount(() => {
    window.removeEventListener('keydown', handleEscape)
})

/**
 * Handles ESC key press to go back to config.
 */
const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') handleBack()
}

/**
 * Navigates back to the config menu with a confirmation sound.
 */
const handleBack = () => {
    audioStore.playEffect(GAME_EFFECTS.EFFECT_SUCCESS)
    router.push('/config')
}

/**
 * Handles selecting the default cover option and saves to backend.
 */
const selectDefaultCover = async () => {
    store.setCoverType("default")
    store.setCoverFile(null)
    store.setCoverFileName(undefined)
    if (store.name && store.name.trim().length > 0)
        await store.saveToBackend()
}

/**
 * Handles file input selection and upload logic.
 * Only accepts PNG under 5MB and requires a user name.
 * Uploads file to backend and updates the store.
 */
const handleFile = async (files: File[]) => {
    const selected = files?.[0]
    if (!selected) return

    if (!store.name || store.name.trim().length === 0) {
        showError.value = true
        return
    }

    const isPNG = selected.type === 'image/png'
    const isValidSize = selected.size <= 5 * 1024 * 1024

    if (!isPNG || !isValidSize) {
        showError.value = true
        return
    }

    try {
        const { filename } = await uploadCover(selected, store.name || "")
        store.setCoverFile(selected)
        store.setCoverFileName(filename)
        store.setCoverType('uploaded')
        if (store.name && store.name.trim().length > 0)
            await store.saveToBackend()
    } catch (e) {
        showError.value = true
    }
}
</script>
