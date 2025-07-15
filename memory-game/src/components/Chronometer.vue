<style scoped>
.chronometer {
    font-size: 30px;
    font-weight: bold;
    text-align: center;
    margin-bottom: 32px;
}
</style>

<template>
    <div class="chronometer">
        🕒 {{ game.formattedTime }}
    </div>
</template>

<script setup lang="ts">
import { useGameStore } from '../store/gameStore'

const game = useGameStore()
</script>
