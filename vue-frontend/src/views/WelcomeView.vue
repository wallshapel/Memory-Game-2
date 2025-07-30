<style scoped>
.welcome-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
}
</style>

<template>
  <v-app>
    <v-main class="welcome-wrapper">
      <v-container class="text-center">
        <v-icon size="80" color="primary">mdi-gamepad-variant</v-icon>
        <h1 class="text-h4 mt-4">Memory Game</h1>
        <v-btn class="mt-6" color="orange-darken-2" size="large" @click="startGame" elevation="4">
          START
        </v-btn>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAudioStore } from '../store/audioStore'

const router = useRouter()
const audioStore = useAudioStore()

function startGame() {
  audioStore.playMusic()
  router.push('/menu')
}
</script>
