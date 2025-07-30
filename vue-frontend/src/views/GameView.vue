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
import { ref, defineAsyncComponent, onMounted, onUnmounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAudioStore } from '../store/audioStore'
import { useGameStore } from '../store/gameStore'
import { getUserSettingsByName } from '../api/backend/userSettings'
import { usePlayerStore } from '../store/playerStore'
import type { IUserSettings } from '../interfaces/IUserSettings'
import type { DIFFICULTY_LEVELS } from '../constants/assets'

// Components
const GameSettingsModal = defineAsyncComponent(() => import('../components/GameSettingsModal.vue'))
import Chronometer from '../components/Chronometer.vue'
import Board from '../components/Board.vue'
import Scoreboard from '../components/Scoreboard.vue'
const GameResultModal = defineAsyncComponent(() => import('../components/GameResultModal.vue'))

// Stores
const game = useGameStore()
const audio = useAudioStore()
const playerStore = usePlayerStore()

const chronometerRef = ref()
const route = useRoute()

const isTimeAttack = computed(() => route.query.timeAttack === '1')
const wasTimeAttack = ref(false)

const timeLimit = computed(() => {
  const raw = route.query.timeLimit
  return typeof raw === 'string' ? parseInt(raw) : null
})

let originalSettings: IUserSettings | null = null

onMounted(async () => {
  wasTimeAttack.value = isTimeAttack.value

  window.addEventListener('keydown', onKeydown)

  if (isTimeAttack.value && timeLimit.value) {
    // Fetch & store backup before overwriting
    if (playerStore.name) {
      try {
        const data = await getUserSettingsByName(playerStore.name)
        originalSettings = data
      } catch (err) {
        console.error('❌ Failed to fetch player settings:', err)
      }
    }

    // Apply record config
    const cards = route.query.totalCards
    const difficulty = route.query.difficulty
    const mistakes = route.query.mistakes
    const parsedMistakes = typeof mistakes === 'string' ? parseInt(mistakes) : 0

    if (typeof cards === 'string') playerStore.totalCards = parseInt(cards)

    if (typeof difficulty === 'string') {
      const parsedDiff = parseInt(difficulty)
      if ([0, 1, 2].includes(parsedDiff))
        playerStore.difficulty = parsedDiff as keyof typeof DIFFICULTY_LEVELS
    }

    game.setCountdownMode(timeLimit.value, parsedMistakes)
    chronometerRef.value?.startCountdown?.(timeLimit.value)
  }

  game.initializeGame()
})

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') game.showSettingsModal = !game.showSettingsModal
}

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  audio.stopAllAudio()
  audio.resumeMusicIfWasPlaying()
  game.clearGame()
  game.showSettingsModal = false
  game.resetChronometer()

  if (wasTimeAttack.value && originalSettings) {
    playerStore.totalCards = originalSettings.totalCards

    const parsedDiff = parseInt(originalSettings.difficulty.toString())
    if ([0, 1, 2].includes(parsedDiff))
      playerStore.difficulty = parsedDiff as keyof typeof DIFFICULTY_LEVELS
  }
})

</script>
