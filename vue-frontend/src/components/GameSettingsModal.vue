<!-- src/components/GameSettingsModal.vue -->
<style scoped>
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
    <!--
      GameSettingsModal
      - Modal with quick in-game options: New Game, toggle music/effects, or exit.
      - Communicates directly with Pinia stores.
    -->
    <v-dialog v-model="internalModel" max-width="400">
        <v-card rounded="xl">
            <v-card-title class="d-flex justify-space-between align-center text-h6">
                <span class="text-center w-100">⚙️ Game Options</span>
                <v-btn icon @click="close" variant="text" size="small">
                    ❌
                </v-btn>
            </v-card-title>

            <v-divider></v-divider>

            <v-card-text class="d-flex justify-center py-4 px-6">
                <v-list density="comfortable">
                    <v-list-item @click="onNewGame" class="option-item">🎮 New Game</v-list-item>
                    <v-list-item @click="toggleMusic" class="option-item">
                        {{ audio.musicMuted ? '🎵 Music' : '🔇 Music' }}
                    </v-list-item>
                    <v-list-item @click="toggleEffects" class="option-item">
                        {{ audio.effectsMuted ? '🔈Effects' : '🔕 Effects' }}
                    </v-list-item>
                    <v-list-item @click="onExit" class="option-item">🚪 Exit</v-list-item>
                </v-list>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
/**
 * GameSettingsModal.vue
 * - Displays quick settings during gameplay.
 * - New game, music/effects mute toggle, exit to menu.
 * - Controls are routed through Pinia stores.
 */
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '../store/gameStore'
import { useAudioStore } from '../store/audioStore'

const game = useGameStore()
const audio = useAudioStore()
const router = useRouter()

/**
 * Binds dialog open state to game store property.
 */
const internalModel = computed({
    get: () => game.showSettingsModal,
    set: (val: boolean) => (game.showSettingsModal = val),
})

/**
 * Closes the modal dialog.
 */
const close = () => {
    game.showSettingsModal = false
}

/**
 * Starts a new game, closing the modal.
 */
const onNewGame = () => {
    game.resetGame()
    close()
}

/**
 * Clears all game state and returns to menu.
 */
const onExit = () => {
    game.clearGame()
    router.push('/menu')
}

/**
 * Toggles music mute via audio store.
 */
const toggleMusic = () => {
    audio.setMusicMuted(!audio.musicMuted)
}

/**
 * Toggles effects mute via audio store.
 */
const toggleEffects = () => {
    audio.setEffectsMuted(!audio.effectsMuted)
}
</script>
