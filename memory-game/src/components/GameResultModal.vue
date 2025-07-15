<style scoped>
img {
    display: block;
    margin: 0 auto;
}
</style>

<template>
    <v-dialog v-model="game.showResultModal" max-width="460" persistent>
        <v-card rounded="xl" class="text-center pt-6 pb-4 px-4">
            <!-- 🎆 Victory animation (only if you game.hasWon) -->
            <div v-if="game.hasWon" class="py-2">
                <img :src="FIREWORK_GIF" alt="Fireworks" style="height: 120px" />
            </div>

            <v-card-title class="text-h5 font-weight-bold">
                {{ game.hasWon ? '🎉 You Won!' : '☠️ Game Over' }}
            </v-card-title>

            <v-card-text class="text-body-1 py-4">
                {{ game.hasWon ? 'Great memory! You matched all the cards.' : 'Better luck next time!' }}
                <br />
                {{ game.hasWon ? `⏱️ Time: ${game.formattedTime}` : '' }}
            </v-card-text>

            <v-card-actions class="justify-center">
                <v-btn color="primary" @click="handleRestart" ref="restartButton">
                    {{ game.hasWon ? 'New Game' : 'Try Again' }}
                </v-btn>
                <v-btn variant="outlined" @click="handleExit">
                    Exit
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '../store/gameStore'
import { FIREWORK_GIF } from '../constants/assets'

const game = useGameStore()
const router = useRouter()

const restartButton = ref<any>(null)

const handleRestart = () => {
    game.resetGame()
    game.showResultModal = false
}

const handleExit = () => {
    game.clearGame()
    game.showResultModal = false
    router.push('/')
}

// 👉 Auto-focus restart/try again button when modal opens
watch(
    () => game.showResultModal,
    (visible) => {
        if (visible) {
            nextTick(() => {
                restartButton.value?.$el?.focus()
            })
        }
    }
)
</script>
