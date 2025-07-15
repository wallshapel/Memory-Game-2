<template>
    <v-app>
        <v-main>
            <v-container class="d-flex flex-column align-center justify-center" style="min-height: 100vh;" fluid>
                <h1 class="text-h5 mb-6">Gameplay Settings</h1>

                <v-card class="pa-6" width="100%" max-width="500" rounded="xl">
                    <!-- Difficulty -->
                    <v-select v-model="store.difficulty" :items="difficulties" item-title="label" item-value="value"
                        label="Select Difficulty" outlined dense hide-details="auto" class="mb-4" />

                    <!-- Number of Cards -->
                    <v-slider v-model="store.totalCards" :min="10" :max="30" step="2" label="Number of Cards"
                        hide-details thumb-label class="mb-6">
                        <template #append>
                            <span class="ml-3 font-weight-medium">{{ store.totalCards }}</span>
                        </template>
                    </v-slider>

                    <!-- Theme -->
                    <div class="mb-4">
                        <label class="text-subtitle-1 font-weight-medium mb-2 d-block">
                            Select Theme
                        </label>
                        <v-row dense>
                            <v-col v-for="theme in themeOptions" :key="theme.value" cols="4" class="text-center">
                                <v-card :elevation="store.theme === theme.value.toUpperCase() ? 12 : 2"
                                    :class="store.theme === theme.value.toUpperCase() ? 'border border-primary bg-grey-lighten-4' : ''"
                                    @click="store.setTheme(theme.value.toUpperCase() as Uppercase<ThemeLiteral>)">
                                    <v-img :src="`${BASE_PATH_IMAGE_RESOURCES.THEMES_PATH}${theme.value}.png`" height="80" class="mb-2"
                                        contain />
                                    <span class="text-caption">
                                        {{ theme.label }}
                                    </span>

                                    <v-icon v-if="store.theme === theme.value.toUpperCase()" color="primary" size="18"
                                        style="position: absolute; top: 4px; right: 6px;">
                                        mdi-check-circle
                                    </v-icon>
                                </v-card>

                            </v-col>
                        </v-row>
                    </div>

                    <!-- Back -->
                    <v-btn class="mt-6" color="secondary" @click="router.push('/config')" block>
                        ⬅ Back to Config
                    </v-btn>
                </v-card>
            </v-container>
        </v-main>
    </v-app>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { usePlayerStore } from '../store/playerStore'
import { BASE_PATH_IMAGE_RESOURCES } from '../constants/assets'

const router = useRouter()
const store = usePlayerStore()

const difficulties = [
    { label: 'Easy', value: 'EASY' },
    { label: 'Medium', value: 'MEDIUM' },
    { label: 'Hard', value: 'HARD' },
]

const themeOptions = [
  { value: 'animals', label: 'Animals' },
  { value: 'flags', label: 'Flags' },
  { value: 'rickandmorty', label: 'Rick and Morty' }
] as const;

type ThemeLiteral = typeof themeOptions[number]['value']; // "animals" | "flags" | "rickandmorty"

// ⎋ ESC to return to config
const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape')
        router.push('/config')
}

onMounted(() => {
    window.addEventListener('keydown', handleEscape)
})

onBeforeUnmount(() => {
    window.removeEventListener('keydown', handleEscape)
})
</script>