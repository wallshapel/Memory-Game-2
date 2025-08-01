<!-- src/components/Scoreboard.vue -->
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
    <div class="scoreboard">
        <div class="score success">
            ✅ {{ game.successCount }}
        </div>
        <div class="score fail">
            <span v-if="game.isCountdownMode">❤️</span>
            <span v-else>❌</span>
            {{ game.failCount }}
        </div>
    </div>
</template>

<script setup lang="ts">
import { useGameStore } from '../store/gameStore'

const game = useGameStore()
</script>
