<!-- src/views/MainMenu.vue -->
<template>
  <v-app>
    <v-main>
      <v-container class="d-flex flex-column align-center justify-center" style="min-height: 100vh;" fluid>
        <v-card class="pa-6 text-center" max-width="400" width="100%">
          <h1 class="text-h4 font-weight-bold mb-6">Memory Game</h1>

          <v-btn ref="playButton" block class="mb-4" color="primary" @click="handlePlay" @mouseenter="handleHover(0)">
            ▶️ Play
          </v-btn>

          <v-btn ref="settingsButton" block class="mb-4" color="secondary" @click="handleOptions"
            @mouseenter="handleHover(1)">
            ⚙️ Settings
          </v-btn>

          <v-btn ref="recordsButton" block color="info" @click="handleRecords" @mouseenter="handleHover(2)">
            🏆 Records
          </v-btn>

          <!-- Modal profile -->
          <AlertModal v-model="showModal" title="Missing Profile"
            message="Please enter your name in the Profile section before playing." actionLabel="Go to Profile"
            @confirm="goToProfile" />
        </v-card>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref, defineAsyncComponent, onMounted, nextTick, onBeforeUnmount, watch } from 'vue'
import { useRouter } from 'vue-router'
import { usePlayerStore } from '../store/playerStore'
import { useAudioStore } from '../store/audioStore'
import { GAME_EFFECTS } from '../constants/assets'
import type { ComponentPublicInstance } from 'vue'

const AlertModal = defineAsyncComponent(() => import('../components/AlertModal.vue'))

const router = useRouter()
const playerStore = usePlayerStore()
const audioStore = useAudioStore()

const showModal = ref(false)
const playButton = ref<ComponentPublicInstance | null>(null)
const settingsButton = ref<ComponentPublicInstance | null>(null)
const recordsButton = ref<ComponentPublicInstance | null>(null)
const buttons = [playButton, settingsButton, recordsButton]
let focusedIndex = 0

const handleRecords = () => {
  audioStore.playEffect(GAME_EFFECTS.EFFECT_SUCCESS)
  void router.push('/records').catch(() => { })
}

const handlePlay = () => {
  audioStore.playEffect(GAME_EFFECTS.EFFECT_SUCCESS)
  if (!playerStore.name.trim())
    showModal.value = true
  else
    void router.push('/game').catch(() => { })
}

const handleOptions = () => {
  audioStore.playEffect(GAME_EFFECTS.EFFECT_SUCCESS)
  void router.push('/config').catch(() => { })
}

const handleHover = (index: number) => {
  focusedIndex = index
  const el = buttons[focusedIndex].value
  const htmlEl = el?.$el as HTMLElement | null
  htmlEl?.focus?.()
  audioStore.playEffect(GAME_EFFECTS.EFFECT_OVER)
}

const goToProfile = () => {
  showModal.value = false
  void router.push('/config/profile').catch(() => { })
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'ArrowDown') {
    focusedIndex = (focusedIndex + 1) % buttons.length
    const el = buttons[focusedIndex].value
    const htmlEl = el?.$el as HTMLElement | null
    htmlEl?.focus?.()
    audioStore.playEffect(GAME_EFFECTS.EFFECT_OVER)
    e.preventDefault()
  } else if (e.key === 'ArrowUp') {
    focusedIndex = (focusedIndex - 1 + buttons.length) % buttons.length
    const el = buttons[focusedIndex].value
    const htmlEl = el?.$el as HTMLElement | null
    htmlEl?.focus?.()
    audioStore.playEffect(GAME_EFFECTS.EFFECT_OVER)
    e.preventDefault()
  } else if (e.key === 'Enter') {
    audioStore.playEffect(GAME_EFFECTS.EFFECT_SUCCESS)
    const el = buttons[focusedIndex].value
    const htmlEl = el?.$el as HTMLElement | null
    htmlEl?.click?.()
    e.preventDefault()
  }
}

onMounted(() => {
  audioStore.stopAllAudio()

  watch(
    () => playerStore.isLoaded,
    (loaded) => {
      if (loaded)
        audioStore.playBackgroundForView({ type: "user" })
    },
    { immediate: true }
  )

  void nextTick(() => {
    focusedIndex = 0
    const el = playButton.value
    const htmlEl = el?.$el as HTMLElement | null
    htmlEl?.focus?.()
  })

  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
  audioStore.bgMusicInstance?.pause()
  audioStore.bgMusicInstance = null
})
</script>
