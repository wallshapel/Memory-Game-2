<!-- src/components/GameChronometer.vue -->
<style scoped>
.chronometer {
    font-size: 30px;
    font-weight: bold;
    text-align: center;
    margin-bottom: 32px;
}
</style>

<template>
    <!--
      GameChronometer component
      - Displays the formatted game time as a stopwatch.
      - Updates reactively with the game store.
    -->
    <div class="chronometer">
        🕒 {{ game.formattedTime }}
    </div>
</template>

<script setup lang="ts">
/**
 * GameChronometer.vue
 * - Shows the elapsed or remaining game time.
 * - Reads its data reactively from game store (Pinia).
 */
import { useGameStore } from '../store/gameStore'

const game = useGameStore()
</script>
