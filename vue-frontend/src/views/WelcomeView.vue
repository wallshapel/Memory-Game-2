<!-- src/views/WelcomeView.vue -->
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
        <v-icon size="80" color="primary" aria-label="Gamepad Icon">mdi-gamepad-variant</v-icon>
        <h1 class="text-h4 mt-4">Memory Game</h1>
        <v-btn class="mt-6" color="orange-darken-2" size="large" @click="startGame" elevation="4"
          aria-label="Start Game">
          START
        </v-btn>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
/**
 * WelcomeView - Initial welcome screen for the Memory Game.
 * Shows game title and a single "START" button.
 * On click, triggers background music and navigates to the Main Menu.
 */
import { useRouter } from 'vue-router'
import { useAudioStore } from '../store/audioStore'

const router = useRouter()
const audioStore = useAudioStore()

function startGame() {
  audioStore.playMusic()
  router.push('/menu')
}
</script>
