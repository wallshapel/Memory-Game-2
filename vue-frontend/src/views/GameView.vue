<style scoped>
.settings-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 10;
  background-color: white;
  color: #444;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
}

.option-item {
  font-size: 18px;
  font-weight: 500;
  cursor: pointer;
  padding: 12px 8px;
}

.option-item:hover {
  background-color: #f0f0f0;
  border-radius: 8px;
}
</style>

<template>
  <v-app>
    <v-main>
      <!-- Settings -->
      <v-btn icon class="settings-btn" @click="game.showSettingsModal = true">
        <v-icon size="36">mdi-cog</v-icon>
      </v-btn>

      <!-- Modal Settings -->
      <GameSettingsModal />

      <!-- Main container -->
      <v-container class="d-flex flex-column align-center justify-center flex-wrap" fluid style="min-height: 100vh">
        <Chronometer ref="chronometerRef" />
        <Board />
        <Scoreboard />
        <GameResultModal />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref, defineAsyncComponent, onMounted, onUnmounted } from 'vue'
import { useAudioStore } from '../store/audioStore'
import { useGameStore } from '../store/gameStore'

// Components
const GameSettingsModal = defineAsyncComponent(() => import('../components/GameSettingsModal.vue'))
import Chronometer from '../components/Chronometer.vue'
import Board from '../components/Board.vue'
import Scoreboard from '../components/Scoreboard.vue'
const GameResultModal = defineAsyncComponent(() => import('../components/GameResultModal.vue'))

// Stores
const game = useGameStore()
const audio = useAudioStore()

// Ref chronometer
const chronometerRef = ref()

// Global keyboard handler
function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') 
    game.showSettingsModal = !game.showSettingsModal
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
  game.initializeGame()
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  // Audio cleaning and playback
  audio.stopAllAudio()
  audio.resumeMusicIfWasPlaying()
  game.clearGame()
  game.showSettingsModal = false
  game.resetChronometer()
})
</script>
