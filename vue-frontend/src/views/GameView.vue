<!-- src/views/GameView.vue -->
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
      <!-- Settings Button -->
      <v-btn icon class="settings-btn" @click="game.showSettingsModal = true">
        <v-icon size="36">mdi-cog</v-icon>
      </v-btn>

      <!-- Modal Settings -->
      <GameSettingsModal />

      <!-- Main Game UI -->
      <v-container class="d-flex flex-column align-center justify-center flex-wrap" fluid style="min-height: 100vh">
        <GameChronometer ref="chronometerRef" />
        <GameBoard />
        <GameScoreboard />
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
import { OTHER_MUSICAL_BACKGROUNDS } from '../constants/assets'
import type { IUserSettings } from '../interfaces/IUserSettings'
import type { DIFFICULTY_LEVELS } from '../constants/assets'

// Dynamic imports for modals and components
const GameSettingsModal = defineAsyncComponent(() => import('../components/GameSettingsModal.vue'))
import GameChronometer from '../components/GameChronometer.vue'
import GameBoard from '../components/GameBoard.vue'
import GameScoreboard from '../components/GameScoreboard.vue'
const GameResultModal = defineAsyncComponent(() => import('../components/GameResultModal.vue'))

// Stores
const game = useGameStore()
const audioStore = useAudioStore()
const playerStore = usePlayerStore()

const chronometerRef = ref()
const route = useRoute()

// Time attack mode logic
const isTimeAttack = computed(() => route.query.timeAttack === '1')
const wasTimeAttack = ref(false)

const timeLimit = computed(() => {
  const raw = route.query.timeLimit
  return typeof raw === 'string' ? parseInt(raw) : null
})

let originalSettings: IUserSettings | null = null

/**
 * Plays the background music for gameplay using the central audio function,
 * passing correct parameters for normal vs. countdown mode.
 */
function playGameMusic() {
  audioStore.playBackgroundForView({
    type: 'fixed',
    file: isTimeAttack.value
      ? OTHER_MUSICAL_BACKGROUNDS.timetrial
      : OTHER_MUSICAL_BACKGROUNDS.gameplay,
    loop: true,
  })
}

onMounted(async () => {
  wasTimeAttack.value = isTimeAttack.value

  window.addEventListener('keydown', onKeydown)

  // Play game background music
  playGameMusic()

  // Handle time attack config
  if (isTimeAttack.value && timeLimit.value) {
    // Backup current player settings before applying time attack config
    if (playerStore.name) {
      try {
        const data = await getUserSettingsByName(playerStore.name)
        originalSettings = data
      } catch (err) {
        console.error('❌ Failed to fetch player settings:', err)
      }
    }

    // Apply time attack settings
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
    game.setCountdownMode(timeLimit.value, parsedMistakes, timeLimit.value)
    chronometerRef.value?.startCountdown?.(timeLimit.value)
  }

  game.initializeGame()
})

/**
 * Toggles the game settings modal when Escape is pressed.
 */
function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') game.showSettingsModal = !game.showSettingsModal
}

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  audioStore.stopAllAudio()
  audioStore.resumeMusicIfWasPlaying()
  game.clearGame()
  game.showSettingsModal = false
  game.resetChronometer()

  // Restore user settings after time attack
  if (wasTimeAttack.value && originalSettings) {
    playerStore.totalCards = originalSettings.totalCards

    const parsedDiff = parseInt(originalSettings.difficulty.toString())
    if ([0, 1, 2].includes(parsedDiff))
      playerStore.difficulty = parsedDiff as keyof typeof DIFFICULTY_LEVELS
  }
})
</script>
