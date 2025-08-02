<!-- src/views/SoundConfig.vue -->
<template>
  <v-app>
    <v-main>
      <v-container class="d-flex flex-column align-center justify-center" style="min-height: 100vh" fluid>
        <h1 class="text-h5 mb-6">Sound Settings</h1>

        <v-card class="pa-6" width="100%" max-width="500" rounded="xl">
          <!-- 🎵 Background Music Selection -->
          <v-select ref="musicSelect" v-model="musicTrack" :items="musicTracks" item-title="title" item-value="value"
            label="Select Background Music" outlined dense hide-details class="mb-4"
            :menu-props="{ closeOnContentClick: true }" @keydown="handleMusicSelectKey"
            @update:model-value="playSelectedMusic" />

          <!-- 🔇 Music mute & volume -->
          <v-switch ref="musicSwitch" v-model="musicMuted" label="Mute Background Music" inset class="mb-2" />
          <v-slider ref="musicSlider" v-model="musicVolume" :min="0" :max="100" step="1" label="Music Volume"
            hide-details thumb-label class="mb-6" :disabled="musicMuted" tabindex="0"
            @update:model-value="onVolumeChange">
            <template #append>
              <span class="ml-3 font-weight-medium">{{ musicVolume }}%</span>
            </template>
          </v-slider>

          <!-- 🔊 Effects mute & volume -->
          <v-switch ref="effectsSwitch" v-model="effectsMuted" label="Mute Sound Effects" inset class="mb-2" />
          <v-slider ref="effectsSlider" v-model="effectsVolume" :min="0" :max="100" step="1" label="Effects Volume"
            hide-details thumb-label class="mb-6" :disabled="effectsMuted" tabindex="0"
            @update:model-value="onEffectsVolumeChange">
            <template #append>
              <span class="ml-3 font-weight-medium">{{ effectsVolume }}%</span>
            </template>
          </v-slider>

          <!-- ⬅ Back -->
          <v-btn ref="backBtn" class="mt-6" color="secondary" @click="handleBack" block>
            ⬅ Back to Config
          </v-btn>
        </v-card>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAudioStore } from '../store/audioStore'
import { usePlayerStore } from '../store/playerStore'
import {
  BASE_PATH_AUDIO_RESOURCES,
  EFFECTS_VOLUME,
  BACKGROUND_MUSIC,
  GAME_EFFECTS
} from '../constants/assets'
import type { BackgroundMusicIndex } from '../store/audioStore'

const router = useRouter()
const store = useAudioStore()
const playerStore = usePlayerStore()

// Refs to focus
const musicSelect = ref<any>(null)
const musicSwitch = ref<any>(null)
const musicSlider = ref<any>(null)
const effectsSwitch = ref<any>(null)
const effectsSlider = ref<any>(null)
const backBtn = ref<any>(null)

let focusedIndex = -1
const MUSIC_SELECT_INDEX = 0
const MUSIC_SWITCH_INDEX = 1
const EFFECTS_SWITCH_INDEX = 3
const BACK_BTN_INDEX = 5

const getFocusableElements = () => [
  () => musicSelect.value?.$el?.querySelector('input') ?? null,
  () => musicSwitch.value?.$el?.querySelector('input[type="checkbox"]') ?? null,
  () => musicSlider.value?.$el?.querySelector('.v-slider-thumb') ?? null,
  () => effectsSwitch.value?.$el?.querySelector('input[type="checkbox"]') ?? null,
  () => effectsSlider.value?.$el?.querySelector('.v-slider-thumb') ?? null,
  () => backBtn.value?.$el ?? null
]

const focusElements = getFocusableElements()
const focusElement = (index: number) => {
  const target = focusElements[index]?.()
  if (target) {
    target.focus()
    focusedIndex = index
    store.playEffect(GAME_EFFECTS.EFFECT_OVER)
  }
}

// 🔊 Store refs
const { musicVolume, effectsMuted, effectsVolume } = storeToRefs(store)

const musicMuted = computed({
  get: () => store.musicMuted,
  set: (val: boolean) => store.setMusicMuted(val)
})

const musicTrack = computed({
  get: () => store.musicTrack,
  set: (val: BackgroundMusicIndex) => {
    store.setMusicTrack(val);
    playerStore.setBackgroundMusic(val);
  }
})

const musicTracks = computed<Array<{ value: BackgroundMusicIndex; title: string }>>(() =>
  Object.entries(BACKGROUND_MUSIC).map(([key, data]) => ({
    value: Number(key) as BackgroundMusicIndex,
    title: data.label
  }))
)

const playSelectedMusic = () => {
  const file = store.getMusicFileFromKey(store.musicTrack)
  store.playAndSetBgMusic(file, musicVolume.value, musicMuted.value)
}

const onVolumeChange = () => {
  if (store.bgMusicInstance)
    store.bgMusicInstance.volume = musicVolume.value / 100
}

const onEffectsVolumeChange = () => {
  store.playEffect(GAME_EFFECTS.EFFECT_OVER)
  if (!effectsMuted.value) {
    const preview = new Audio(`${BASE_PATH_AUDIO_RESOURCES.EFFECTS_PATH}${EFFECTS_VOLUME}`)
    preview.volume = effectsVolume.value / 100
    preview.play().catch(() => { })
  }
}

const handleBack = () => {
  store.playEffect(GAME_EFFECTS.EFFECT_SUCCESS)
  router.push('/config')
}

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') return handleBack()

  if (['ArrowUp', 'ArrowDown'].includes(e.key)) {
    e.preventDefault()
    const newIndex =
      e.key === 'ArrowUp'
        ? (focusedIndex > MUSIC_SELECT_INDEX ? focusedIndex - 1 : BACK_BTN_INDEX)
        : (focusedIndex < BACK_BTN_INDEX ? focusedIndex + 1 : MUSIC_SELECT_INDEX)
    focusElement(newIndex)
  }

  if (['ArrowLeft', 'ArrowRight'].includes(e.key) &&
    (focusedIndex === MUSIC_SWITCH_INDEX || focusedIndex === EFFECTS_SWITCH_INDEX)) {
    e.preventDefault()
    if (focusedIndex === MUSIC_SWITCH_INDEX)
      musicMuted.value = !musicMuted.value
    else
      effectsMuted.value = !effectsMuted.value
    store.playEffect(GAME_EFFECTS.EFFECT_SELECT)
  }
}

const handleMusicSelectKey = (e: KeyboardEvent) => {
  if (['ArrowLeft', 'ArrowRight'].includes(e.key)) {
    e.preventDefault()
    e.stopPropagation()
    const currentIndex = musicTracks.value.findIndex(t => t.value === musicTrack.value)
    let newIndex = currentIndex
    if (e.key === 'ArrowLeft')
      newIndex = currentIndex > 0 ? currentIndex - 1 : musicTracks.value.length - 1
    else
      newIndex = currentIndex < musicTracks.value.length - 1 ? currentIndex + 1 : 0
    musicTrack.value = musicTracks.value[newIndex].value
  }
}

const handleFocusIn = () => {
  const activeElement = document.activeElement
  const idx = focusElements.findIndex(getter => {
    const el = getter()
    return el === activeElement || el?.contains(activeElement)
  })
  if (idx !== -1 && idx !== focusedIndex) focusedIndex = idx
}

onMounted(() => {
  setTimeout(() => focusElement(MUSIC_SELECT_INDEX), 100)
  nextTick(() => {
    const input = musicSelect.value?.$el?.querySelector('input')
    if (input) {
      input.addEventListener(
        'keydown',
        (e: KeyboardEvent) => {
          if (['ArrowUp', 'ArrowDown'].includes(e.key)) e.stopImmediatePropagation()
        },
        true
      )
    }
  })
  window.addEventListener('keydown', handleKeyDown, true)
  document.addEventListener('focusin', handleFocusIn)

  store.playAndSetBgMusic(store.getMusicFileFromKey(store.musicTrack), musicVolume.value, musicMuted.value)

})

onBeforeUnmount(() => {
  store.bgMusicInstance?.pause()
  store.bgMusicInstance = null
  window.removeEventListener('keydown', handleKeyDown, true)
  document.removeEventListener('focusin', handleFocusIn)
})

watch(
  [
    () => store.musicTrack,
    () => store.musicMuted,
    () => store.musicVolume,
    () => store.effectsMuted,
    () => store.effectsVolume
  ],
  async () => {
    if (playerStore.name && playerStore.name.trim().length > 0)
      await playerStore.saveToBackend();
  }
)

</script>
