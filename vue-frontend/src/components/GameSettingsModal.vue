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
    <v-dialog v-model="internalModel" max-width="400" @keydown.esc="close">
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
                    <v-list-item @click="onNewGame" class="option-item">
                        🎮 New Game
                    </v-list-item>
                    <v-list-item @click="toggleMusic" class="option-item">
                        {{ audio.musicMuted ? '🎵 Music' : '🔇 Music' }}
                    </v-list-item>
                    <v-list-item @click="toggleEffects" class="option-item">
                        {{ audio.effectsMuted ? '🔈Effects' : '🔕 Effects' }}
                    </v-list-item>
                    <v-list-item @click="onExit" class="option-item">
                        🚪 Exit
                    </v-list-item>
                </v-list>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '../store/gameStore'
import { useAudioStore } from '../store/audioStore'

const game = useGameStore()

const internalModel = computed({
  get: () => game.showSettingsModal,
  set: (val: boolean) => (game.showSettingsModal = val),
})

const close = () => {
  game.showSettingsModal = false
}

const router = useRouter()
const audio = useAudioStore()

const onNewGame = () => {
    game.resetGame()
    close()
}

const onExit = () => {
    game.clearGame()
    router.push('/menu')
}

const toggleMusic = () => {
    audio.setMusicMuted(!audio.musicMuted)
}

const toggleEffects = () => {
    audio.setEffectsMuted(!audio.effectsMuted)
}
</script>