<template>
    <v-app>
        <v-main>
            <v-container class="d-flex flex-column align-center justify-center" style="min-height: 100vh;" fluid>
                <h1 class="text-h5 mb-6">Card Back Cover</h1>

                <v-card class="pa-6" width="100%" max-width="500" rounded="xl">
                    <!-- Cover Options -->
                    <div class="mb-4">
                        <label class="text-subtitle-1 font-weight-medium mb-2 d-block text-center">
                            Select Cover
                        </label>
                        <v-row dense>
                            <!-- Default -->
                            <v-col cols="6" class="text-center mx-auto">
                                <v-card class="pa-2" rounded="lg" :elevation="store.coverType === 'default' ? 10 : 2"
                                    :class="store.coverType === 'default' ? 'border border-primary bg-grey-lighten-4' : ''"
                                    style="cursor: pointer;" @click="store.setCoverType('default')">
                                    <v-img :src="defaultImage" aspect-ratio="2/3" class="mb-2" contain />
                                    <span class="text-caption">Default</span>
                                </v-card>
                            </v-col>

                            <!-- Uploaded -->
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

                    <!-- Upload Control -->
                    <v-file-input ref="fileInput" accept="image/png" label="Upload Custom Cover (.png, max 5MB)"
                        @update:modelValue="handleFile" prepend-icon="mdi-upload" outlined dense hide-details
                        class="mb-4" />

                    <!-- Back Button -->
                    <v-btn ref="backBtn" class="mt-6" color="secondary" @click="handleBack" block>
                        ⬅ Back to Config
                    </v-btn>
                </v-card>

                <!-- Error Modal -->
                <AlertModal v-model="showError" title="Invalid File" message="Only .png files under 5MB are allowed."
                    actionLabel="OK" @confirm="showError = false" />
            </v-container>
        </v-main>
    </v-app>
</template>

<script setup lang="ts">
import { ref, defineAsyncComponent, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { usePlayerStore } from '../store/playerStore'
import { useAudioStore } from '../store/audioStore'
import { BASE_PATH_IMAGE_RESOURCES, DEFAULT_COVER_IMAGE, GAME_EFFECTS } from '../constants/assets'

const AlertModal = defineAsyncComponent(() => import('../components/AlertModal.vue'))

const router = useRouter()
const store = usePlayerStore()
const audioStore = useAudioStore()

const defaultImage = `${BASE_PATH_IMAGE_RESOURCES.COVERS_PATH}${DEFAULT_COVER_IMAGE}`
const uploadedUrl = ref<string | null>(store.coverFile ? URL.createObjectURL(store.coverFile) : null)
const showError = ref(false)

const fileInput = ref<HTMLInputElement | null>(null)
const backBtn = ref<HTMLButtonElement | null>(null)

onMounted(() => {
    // Focus the upload input on mount
    fileInput.value?.focus()

    // Listen for Escape key
    window.addEventListener('keydown', handleEscape)
})

onBeforeUnmount(() => {
    window.removeEventListener('keydown', handleEscape)
})

// ⎋ ESC key = back action
const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') handleBack()
}

// Back button logic with sound
const handleBack = () => {
    audioStore.playEffect(GAME_EFFECTS.EFFECT_SUCCESS)
    router.push('/config')
}

// Watch for uploaded file
watch(
    () => store.coverFile,
    file => {
        uploadedUrl.value = file ? URL.createObjectURL(file) : null
    }
)

// Handle file upload
const handleFile = (files: File[]) => {
    const selected = files?.[0]
    if (!selected) return

    const isPNG = selected.type === 'image/png'
    const isValidSize = selected.size <= 5 * 1024 * 1024

    if (!isPNG || !isValidSize) {
        showError.value = true
        return
    }

    store.setCoverFile(selected)
    store.setCoverType('uploaded')
}
</script>
