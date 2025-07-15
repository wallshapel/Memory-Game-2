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
</style>

<template>
  <v-app>
    <v-main>
      <v-btn icon class="settings-btn" @click="game.showSettingsModal = true">
        <v-icon size="36">mdi-cog</v-icon>
      </v-btn>
      <GameSettingsModal />
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
import { usePlayerStore } from '../store/playerStore'
import { useGameStore } from '../store/gameStore'
const GameSettingsModal = defineAsyncComponent(() => import('../components/GameSettingsModal.vue'))
import Chronometer from '../components/Chronometer.vue'
import Board from '../components/Board.vue'
import Scoreboard from '../components/Scoreboard.vue'
const GameResultModal = defineAsyncComponent(() => import('../components/GameResultModal.vue'))

const chronometerRef = ref()
const store = usePlayerStore()
const game = useGameStore()

onMounted(() => {
  game.initializeGame()
})

onUnmounted(() => {
  store.stopAllAudio()
  store.resumeMusicIfWasPlaying()
  game.clearGame()
  game.showSettingsModal = false
  game.resetChronometer()
})
</script>