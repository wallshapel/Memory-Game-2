<!-- src/components/GameScoreboard.vue -->
<style scoped>
.scoreboard {
    display: flex;
    justify-content: center;
    gap: 48px;
    margin-top: 32px;
    font-size: 32px;
    font-weight: bold;
}

.score.success {
    color: green;
}

.score.fail {
    color: red;
}
</style>

<template>
    <!--
      GameScoreboard
      - Shows current score: successful pairs and fails/mistakes.
      - Icon for fails changes if in countdown mode.
    -->
    <div class="scoreboard">
        <div class="score success">
            ✅ {{ game.successCount }}
        </div>
        <div class="score fail">
            <!-- Show ❤️ in countdown mode, ❌ otherwise -->
            <span v-if="game.isCountdownMode">❤️</span>
            <span v-else>❌</span>
            {{ game.failCount }}
        </div>
    </div>
</template>

<script setup lang="ts">
/**
 * GameScoreboard.vue
 * - Displays real-time match and fail counts.
 * - Uses different icon for fails if time attack mode is active.
 */
import { useGameStore } from '../store/gameStore'

const game = useGameStore()
</script>
