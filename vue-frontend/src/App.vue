<template>
   <router-view />
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { usePlayerStore } from './store/playerStore'
import { storeToRefs } from 'pinia'
import { BASE_PATH_AUDIO_RESOURCES, DEFAULT_BACKGROUND } from './constants/assets'

const store = usePlayerStore()
const { musicMuted, musicVolume } = storeToRefs(store)

onMounted(() => {
  const file = store.musicTrack
    ? store.getMusicFileFromKey(store.musicTrack)
    : DEFAULT_BACKGROUND.work
  const src = `${BASE_PATH_AUDIO_RESOURCES.MUSIC_PATH}${file}.mp3`
  const audio = new Audio(src)
  audio.loop = true
  audio.volume = musicVolume.value / 100
  audio.muted = musicMuted.value

  store.bgMusicInstance = audio

  const allowPlayback = () => {
    document.removeEventListener('click', allowPlayback)
    document.removeEventListener('keydown', allowPlayback)

    if (!musicMuted.value)
      store.playMusic()
  }

  document.addEventListener('click', allowPlayback)
  document.addEventListener('keydown', allowPlayback)
})

// 🔊 Volume sync
watch(musicVolume, (vol) => {
  if (store.bgMusicInstance)
    store.bgMusicInstance.volume = vol / 100
})
</script>
