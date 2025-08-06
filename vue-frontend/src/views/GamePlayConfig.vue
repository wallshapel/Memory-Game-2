<!-- src/views/GamePlayConfig.vue -->
<template>
    <v-app>
        <v-main>
            <v-container class="d-flex flex-column align-center justify-center" style="min-height: 100vh" fluid>
                <h1 class="text-h5 mb-6">Gameplay Settings</h1>

                <v-card class="pa-6" width="100%" max-width="500" rounded="xl">
                    <!-- Difficulty Select -->
                    <v-select ref="difficultySelect" v-model="store.difficulty" :items="difficulties" item-title="label"
                        item-value="value" label="Select Difficulty" outlined dense hide-details="auto" class="mb-4"
                        @update:model-value="onDifficultyChange" :menu-props="{ closeOnContentClick: true }"
                        @keydown="handleDifficultyKey" />

                    <!-- Card Count Slider -->
                    <v-slider ref="cardsSlider" v-model="store.totalCards" :min="10" :max="30" step="2"
                        label="Number of Cards" hide-details thumb-label class="mb-6" tabindex="0"
                        @update:model-value="onSliderChange" />

                    <!-- Theme Selector -->
                    <div class="mb-4">
                        <label class="text-subtitle-1 font-weight-medium mb-2 d-block">Select Theme</label>
                        <v-row dense>
                            <v-col v-for="(theme, i) in themeOptions" :key="theme.value" cols="4" class="text-center">
                                <v-card :ref="el => themeRefs[i] = el" :tabindex="0"
                                    :elevation="store.theme === theme.value ? 12 : 2"
                                    :class="store.theme === theme.value ? 'border border-primary bg-grey-lighten-4' : ''"
                                    @click="() => { store.setTheme(theme.value); audioStore.playEffect(GAME_EFFECTS.EFFECT_SELECT) }">
                                    <v-img
                                        :src="`${BASE_PATH_IMAGE_RESOURCES.THEMES_PATH}${theme.label.toLowerCase()}.png`"
                                        height="80" class="mb-2" contain />
                                    <span class="text-caption">{{ theme.label }}</span>
                                    <v-icon v-if="store.theme === theme.value" color="primary" size="18"
                                        style="position: absolute; top: 4px; right: 6px">
                                        mdi-check-circle
                                    </v-icon>
                                </v-card>
                            </v-col>
                        </v-row>
                    </div>

                    <!-- Back Button -->
                    <v-btn ref="backBtn" class="mt-6" color="secondary"
                        @click="() => { audioStore.playEffect(GAME_EFFECTS.EFFECT_SUCCESS); router.push('/config') }"
                        block>
                        ⬅ Back to Config
                    </v-btn>
                </v-card>
            </v-container>
        </v-main>
    </v-app>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import type { Ref, ComponentPublicInstance } from 'vue'
import { useRouter } from 'vue-router'
import { usePlayerStore } from '../store/playerStore'
import { useAudioStore } from '../store/audioStore'
import {
    BASE_PATH_IMAGE_RESOURCES,
    GAME_THEMES,
    DIFFICULTY_LEVELS,
    GAME_EFFECTS,
    type GameThemeLiteral,
    type DifficultyLiteral
} from '../constants/assets'

const router = useRouter()
const store = usePlayerStore()
const audioStore = useAudioStore()

const difficulties = Object.entries(DIFFICULTY_LEVELS).map(([value, label]) => ({
    value: Number(value) as DifficultyLiteral,
    label: label.charAt(0) + label.slice(1).toLowerCase(),
}))

const themeOptions = Object.entries(GAME_THEMES)
    .map(([key, label]) => ({
        value: Number(key) as GameThemeLiteral,
        label: label.charAt(0) + label.slice(1).toLowerCase()
    }))
    .sort((a, b) => a.value - b.value)

const difficultySelect = ref<ComponentPublicInstance | null>(null)
const cardsSlider = ref<ComponentPublicInstance | null>(null)
const themeRefs: Ref<(Element | ComponentPublicInstance | null)[]> = ref([])
const backBtn = ref<ComponentPublicInstance | null>(null)

let focusedIndex = -1
const SELECT_INDEX = 0
const SLIDER_INDEX = 1
const FIRST_THEME_INDEX = 2
const BACK_BTN_INDEX = FIRST_THEME_INDEX + themeOptions.length

const getFocusableElements = (): Array<() => HTMLElement | null> => [
    // Difficulty select input
    () => {
        const el = difficultySelect.value?.$el as HTMLElement | undefined
        return el?.querySelector('input') ?? null
    },
    // Cards slider thumb
    () => {
        const el = cardsSlider.value?.$el as HTMLElement | undefined
        return el?.querySelector('.v-slider-thumb') ?? null
    },
    // Themes
    ...themeOptions.map((_, i) => () => {
        const ref = themeRefs.value[i]
        if (!ref) return null
        if (ref instanceof HTMLElement) return ref
        return (ref as ComponentPublicInstance).$el as HTMLElement ?? null
    }),
    // Back button
    () => (backBtn.value?.$el as HTMLElement | null) ?? null
]

const focusElements = getFocusableElements()

const focusElement = (index: number) => {
    const target = focusElements[index]?.()
    if (target) {
        target.focus()
        focusedIndex = index
        audioStore.playEffect(GAME_EFFECTS.EFFECT_OVER)
    }
}

const onDifficultyChange = () => audioStore.playEffect(GAME_EFFECTS.EFFECT_SELECT)
const onSliderChange = () => audioStore.playEffect(GAME_EFFECTS.EFFECT_OVER)

const selectCurrentTheme = () => {
    if (focusedIndex >= FIRST_THEME_INDEX && focusedIndex < BACK_BTN_INDEX) {
        const themeValue = themeOptions[focusedIndex - FIRST_THEME_INDEX].value
        store.setTheme(themeValue)
        audioStore.playEffect(GAME_EFFECTS.EFFECT_SELECT)
    }
}

const handleKeyDown = (e: KeyboardEvent) => {
    if (focusedIndex === SELECT_INDEX && ['ArrowLeft', 'ArrowRight'].includes(e.key)) return
    if (e.key === 'Escape') return void router.push('/config').catch(() => { })
    if ((e.key === 'Enter' || e.key === ' ') && focusedIndex >= FIRST_THEME_INDEX && focusedIndex < BACK_BTN_INDEX)
        return void (e.preventDefault(), selectCurrentTheme())

    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault()
        if (focusedIndex >= FIRST_THEME_INDEX && focusedIndex < BACK_BTN_INDEX)
            return void focusElement(e.key === 'ArrowUp' ? SLIDER_INDEX : BACK_BTN_INDEX)

        const newIndex = e.key === 'ArrowUp'
            ? (focusedIndex > SELECT_INDEX ? focusedIndex - 1 : BACK_BTN_INDEX)
            : (focusedIndex < BACK_BTN_INDEX ? focusedIndex + 1 : SELECT_INDEX)
        return void focusElement(newIndex)
    }

    if (focusedIndex >= FIRST_THEME_INDEX && focusedIndex < BACK_BTN_INDEX) {
        if (e.key === 'ArrowLeft') return void (e.preventDefault(), focusElement(focusedIndex === FIRST_THEME_INDEX ? BACK_BTN_INDEX - 1 : focusedIndex - 1))
        if (e.key === 'ArrowRight') return void (e.preventDefault(), focusElement(focusedIndex === BACK_BTN_INDEX - 1 ? FIRST_THEME_INDEX : focusedIndex + 1))
    }
}

const handleFocusIn = () => {
    const active = document.activeElement as HTMLElement
    const index = focusElements.findIndex(get => {
        const el = get()
        return el === active || (el && el.contains(active))
    })
    if (index !== -1 && index !== focusedIndex) focusedIndex = index
}

onMounted(() => {
    setTimeout(() => focusElement(SELECT_INDEX), 100)
    void nextTick(() => {
        const el = difficultySelect.value?.$el as HTMLElement | undefined
        const input = el?.querySelector('input')
        if (input) input.addEventListener('keydown', (e: KeyboardEvent) => {
            if (['ArrowUp', 'ArrowDown'].includes(e.key)) e.stopImmediatePropagation()
        }, true)
    })
    window.addEventListener('keydown', handleKeyDown, true)
    document.addEventListener('focusin', handleFocusIn)
})

onBeforeUnmount(() => {
    window.removeEventListener('keydown', handleKeyDown, true)
    document.removeEventListener('focusin', handleFocusIn)
})

const handleDifficultyKey = (e: KeyboardEvent) => {
    if (['ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault()
        e.stopPropagation()
        const currentIndex = difficulties.findIndex(d => d.value === store.difficulty)
        const newIndex = e.key === 'ArrowLeft'
            ? (currentIndex > 0 ? currentIndex - 1 : difficulties.length - 1)
            : (currentIndex < difficulties.length - 1 ? currentIndex + 1 : 0)
        store.difficulty = difficulties[newIndex].value
        audioStore.playEffect(GAME_EFFECTS.EFFECT_SELECT)
    }
}

watch(
    [() => store.difficulty, () => store.totalCards, () => store.theme],
    async () => {
        if (store.name && store.name.trim().length > 0)
            await store.saveToBackend();
    }
)
</script>
