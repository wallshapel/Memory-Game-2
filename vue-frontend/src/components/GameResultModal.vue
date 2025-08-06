<!-- src/components/GameResultModal.vue -->
<template>
    <!--
      GameResultModal
      - Modal dialog showing the result (win or lose) after each game.
      - Handles "New Record" for time attack mode.
      - All actions are accessible and focused automatically.
    -->
    <v-dialog v-model="game.showResultModal" max-width="460" persistent>
        <v-card rounded="xl" class="text-center pt-6 pb-4 px-4">
            <!-- 🎆 Victory animation (only if you win) -->
            <div v-if="game.hasWon" class="py-2">
                <img :src="FIREWORK_GIF" alt="Fireworks" style="height: 120px" />
            </div>

            <v-card-title class="text-h5 font-weight-bold">
                <template v-if="isTimeAttackRecordBeaten">
                    🏅 New Record! 🏅
                </template>
                <template v-else>
                    {{ game.hasWon ? '🎉 You Won!' : '☠️ Game Over' }}
                </template>
            </v-card-title>

            <v-card-text class="text-body-1 py-4">
                <template v-if="isTimeAttackRecordBeaten">
                    You broke the time attack record!<br>
                    ⏱️ Time: {{ formattedResultTime }}
                </template>
                <template v-else>
                    {{ game.hasWon ? 'Great memory! You matched all the cards.' : 'Better luck next time!' }}
                    <br />
                    {{ game.hasWon ? `⏱️ Time: ${formattedResultTime}` : '' }}
                </template>
            </v-card-text>

            <v-card-actions class="justify-center">
                <v-btn color="primary" @click="handleRestart" ref="restartButton">
                    {{ game.hasWon ? 'New Game' : 'Try Again' }}
                </v-btn>
                <v-btn variant="outlined" @click="handleExit">
                    Exit
                </v-btn>
                <v-btn v-if="game.hasWon" color="secondary" variant="outlined" @click="goToRecords">
                    See Records
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
/**
 * GameResultModal.vue
 * - Displays after each game with game result and options.
 * - Shows fireworks and "New Record" banner if time attack record beaten.
 * - Allows quick navigation to new game, menu, or records.
 */
import { ref, watch, nextTick, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '../store/gameStore'
import { FIREWORK_GIF } from '../constants/assets'

const game = useGameStore()
const router = useRouter()

// Ref for auto-focus on primary button
const restartButton = ref<HTMLElement | null>(null)

/**
 * Calculates the time used for this session.
 * - If time attack, it's the difference between the limit and remaining time.
 * - Else, it's just the elapsed milliseconds.
 */
const timeUsed = computed(() => {
    return game.isCountdownMode
        ? game.countdownLimit - game.milliseconds
        : game.milliseconds
})

/**
 * Formats the time in mm:ss.mmm format for display.
 */
const formattedResultTime = computed(() => {
    const ms = timeUsed.value % 1000
    const totalSeconds = Math.floor(timeUsed.value / 1000)
    const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0")
    const seconds = String(totalSeconds % 60).padStart(2, "0")
    const millis = String(ms).padStart(3, "0")
    return `${minutes}:${seconds}.${millis}`
})

/**
 * Indicates if the player beat their time attack record.
 */
const isTimeAttackRecordBeaten = computed(() =>
    game.isCountdownMode && game.didBeatRecord && game.hasWon
)

/**
 * Restart the game with current settings.
 */
const handleRestart = () => {
    if (isTimeAttackRecordBeaten.value) {
        const newTime = timeUsed.value;
        game.updateTargetRecord(newTime, game.mistakesMade);

        // Make sure the stopwatch uses the new time.
        game.countdownLimit = newTime;
        game.resetChronometer();
    }

    game.resetGame();
    game.showResultModal = false;
};

/**
 * Exit to main menu, cleaning up state.
 */
const handleExit = () => {
    game.clearGame()
    game.showResultModal = false
    void router.push('/menu')
}

/**
 * Navigates to records view.
 */
const goToRecords = () => {
    game.showResultModal = false
    void router.push('/records')
}

// Auto-focus restart/try again button when modal opens
watch(
    () => game.showResultModal,
    (visible) => {
        if (visible) {
            void nextTick(() => {
                restartButton.value?.focus()
            })
        }
    }
)
</script>
