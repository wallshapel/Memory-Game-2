<template>
  <v-app>
    <v-main>
      <v-container class="d-flex flex-column align-center justify-center" style="min-height: 100vh" fluid>
        <h1 class="text-h5 mb-6">Sound Settings</h1>

        <v-card class="pa-6" width="100%" max-width="500" rounded="xl">
          <!-- 🎵 Background Music Selection -->
          <v-select v-model="musicTrack" :items="musicTracks" item-title="title" item-value="value"
            label="Select Background Music" outlined dense hide-details class="mb-4" />

          <!-- 🔇 Music mute & volume -->
          <v-switch v-model="musicMuted" label="Mute Background Music" inset class="mb-2" />
          <v-slider v-model="musicVolume" :min="0" :max="100" step="1" label="Music Volume" hide-details thumb-label
            class="mb-6" :disabled="musicMuted">
            <template #append>
              <span class="ml-3 font-weight-medium">{{ musicVolume }}%</span>
            </template>
          </v-slider>

          <!-- 🔊 Effects mute & volume -->
          <v-switch v-model="effectsMuted" label="Mute Sound Effects" inset class="mb-2" />
          <v-slider v-model="effectsVolume" :min="0" :max="100" step="1" label="Effects Volume" hide-details thumb-label
            class="mb-6" :disabled="effectsMuted">
            <template #append>
              <span class="ml-3 font-weight-medium">{{ effectsVolume }}%</span>
            </template>
          </v-slider>

          <!-- ⬅ Back -->
          <v-btn class="mt-6" color="secondary" @click="router.push('/config')" block>
            ⬅ Back to Config
          </v-btn>
        </v-card>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAudioStore } from '../store/audioStore'
import { BASE_PATH_AUDIO_RESOURCES, EFFECTS_VOLUME, BACKGROUND_MUSIC } from '../constants/assets'
import type { BackgroundMusicIndex } from '../store/audioStore'

const router = useRouter()
const store = useAudioStore()

// 🔊 Bind store refs
const { musicVolume, effectsMuted, effectsVolume } = storeToRefs(store)

// Custom computed for musicMuted (to call action instead of mutating state directly)
const musicMuted = computed({
  get: () => store.musicMuted,
  set: (val: boolean) => store.setMusicMuted(val)
})

// Custom computed for musicTrack (to call action with logic)
const musicTrack = computed({
  get: () => store.musicTrack,
  set: (val: BackgroundMusicIndex) => {
    store.setMusicTrack(val)

    // Play the new background music when the select is changed
    const file = store.getMusicFileFromKey(val)
    const src = `${BASE_PATH_AUDIO_RESOURCES.MUSIC_PATH}${file}.mp3`
    const audio = new Audio(src)
    audio.loop = true
    audio.volume = musicVolume.value / 100
    audio.muted = musicMuted.value
    audio.play().catch(() => { })

    store.bgMusicInstance?.pause()
    store.bgMusicInstance = audio
  }
})

const musicTracks = computed(() =>
  Object.entries(BACKGROUND_MUSIC).map(([key, data]) => ({
    value: Number(key),
    title: data.label
  }))
)

// 🔄 Immediate auditory feedback when changing the effect volume
watch(effectsVolume, (newVolume) => {
  if (store.effectsMuted) return

  const preview = new Audio(`${BASE_PATH_AUDIO_RESOURCES.EFFECTS_PATH}${EFFECTS_VOLUME}`)
  preview.volume = newVolume / 100
  preview.play().catch(() => { })
})

watch(musicVolume, (newVolume) => {
  if (store.bgMusicInstance) 
    store.bgMusicInstance.volume = newVolume / 100
})

// ⎋ ESC to return to config
const handleEscape = (e: KeyboardEvent) => {
  if (e.key === 'Escape') router.push('/config')
}

onMounted(() => {
  window.addEventListener('keydown', handleEscape)

  const file = store.getMusicFileFromKey(store.musicTrack)
  const src = `${BASE_PATH_AUDIO_RESOURCES.MUSIC_PATH}${file}.mp3`
  const audio = new Audio(src)

  audio.loop = true
  audio.volume = musicVolume.value / 100
  audio.muted = musicMuted.value

  audio.play().catch(() => { })

  store.bgMusicInstance?.pause()
  store.bgMusicInstance = audio
})

onBeforeUnmount(() => {
  // ⏹️ Stop any music when leaving this view
  store.bgMusicInstance?.pause()
  store.bgMusicInstance = null
  window.removeEventListener('keydown', handleEscape)
})
</script>
