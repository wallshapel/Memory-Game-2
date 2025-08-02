<!-- src/components/Board.vue -->
<style scoped>
.noselect {
    user-select: none;
    -webkit-user-select: none;
    -ms-user-select: none;
    -moz-user-select: none;
}

.disable-mouse {
    pointer-events: none;
}
</style>

<template>
    <!--
      Renders the card board as a CSS grid, dynamically sized based on window width and number of cards.
      - In keyboard mode, disables mouse input for accessibility and shows focus on the selected card.
      - Each card is represented by the Card component.
    -->
    <div v-if="game.cards.length > 0" :style="gridStyle" class="noselect"
        :class="{ 'disable-mouse': store.controlMethod === 'keyboard' }" @mousedown.prevent @selectstart.prevent>
        <Card v-for="(card, index) in game.cards" :key="card.id" :card="card" :width="cardWidth" :height="cardHeight"
            :isFocused="store.controlMethod === 'keyboard' && game.cardsAreReady && index === game.focusedIndex" />
    </div>
</template>

<script setup lang="ts">
/**
 * Board.vue
 * Renders the game board using a CSS grid and manages keyboard navigation.
 * Handles card focus and input for both mouse and keyboard users.
 */

import { ref, computed, nextTick, onMounted, onBeforeUnmount, watch } from 'vue'
import { useGameStore } from '../store/gameStore'
import { usePlayerStore } from '../store/playerStore'
import { useAudioStore } from '../store/audioStore'
import Card from './Card.vue'
import { BOARD_GAP, BREAKPOINTS, DEFAULT_CARDS_SIZE, GAME_EFFECTS } from '../constants/assets'

const game = useGameStore()
const store = usePlayerStore()
const audio = useAudioStore()

// Card size based on screen width
const cardWidth = ref(DEFAULT_CARDS_SIZE.width)
const cardHeight = ref(DEFAULT_CARDS_SIZE.height)

// Dynamically adjust card size by breakpoint
function updateCardSize() {
    const width = window.innerWidth
    if (width <= BREAKPOINTS.xs.maxWidth)
        cardWidth.value = BREAKPOINTS.xs.cardWidth,
            cardHeight.value = BREAKPOINTS.xs.cardHeight
    else if (width <= BREAKPOINTS.sm.maxWidth)
        cardWidth.value = BREAKPOINTS.sm.cardWidth,
            cardHeight.value = BREAKPOINTS.sm.cardHeight
    else if (width <= BREAKPOINTS.md.maxWidth)
        cardWidth.value = BREAKPOINTS.md.cardWidth,
            cardHeight.value = BREAKPOINTS.md.cardHeight
    else
        cardWidth.value = BREAKPOINTS.lg.cardWidth,
            cardHeight.value = BREAKPOINTS.lg.cardHeight
}

// Calculates the most "square" grid possible for the number of cards
function calculateGrid(count: number): { columns: number; rows: number } {
    let bestCols = count, bestRows = 1, minDiff = count, minArea = Infinity
    for (let rows = 1; rows <= count; rows++) {
        const cols = Math.ceil(count / rows)
        const area = cols * rows
        const diff = Math.abs(cols - rows)
        if (diff < minDiff || (diff === minDiff && area < minArea))
            bestCols = cols, bestRows = rows, minDiff = diff, minArea = area
    }
    return { columns: bestCols, rows: bestRows }
}

// CSS grid style for board layout
const gridStyle = computed(() => {
    const grid = calculateGrid(game.cards.length)
    return {
        display: 'grid',
        gridTemplateColumns: `repeat(${grid.columns}, ${cardWidth.value}px)`,
        gap: BOARD_GAP,
    }
})

/**
 * Handles all keyboard navigation and card flipping for keyboard control.
 * Arrow keys navigate, Enter/Space flips the focused card.
 */
function handleKeyDown(e: KeyboardEvent) {
    if (store.controlMethod !== 'keyboard' || !game.cardsAreReady) return

    const cards = game.cards
    const current = game.focusedIndex
    const grid = calculateGrid(cards.length)
    let newIndex = current
    const isValidIndex = (idx: number) => idx >= 0 && idx < cards.length

    switch (e.key) {
        case 'ArrowRight':
            do newIndex = (newIndex + 1) % cards.length
            while (!isValidIndex(newIndex) || newIndex === current)
            break
        case 'ArrowLeft':
            do newIndex = (newIndex - 1 + cards.length) % cards.length
            while (!isValidIndex(newIndex) || newIndex === current)
            break
        case 'ArrowDown':
            do newIndex = (newIndex + grid.columns) % cards.length
            while (!isValidIndex(newIndex) || newIndex === current)
            break
        case 'ArrowUp':
            do newIndex = (newIndex - grid.columns + cards.length) % cards.length
            while (!isValidIndex(newIndex) || newIndex === current)
            break
        case 'Enter':
        case ' ':
            const currentCard = cards[current]
            if (
                current >= 0 &&
                !currentCard.flipped &&
                !currentCard.blocked &&
                !currentCard.matched
            ) {
                audio.playEffect(GAME_EFFECTS.EFFECT_SELECT)
                game.handleCardClick(currentCard)
            }
            return
        default:
            return
    }

    game.focusedIndex = newIndex
}

// -- Lifecycle & Watchers --

onMounted(() => {
    window.addEventListener('keydown', handleKeyDown)
    updateCardSize()
    window.addEventListener('resize', updateCardSize)

    // When cards become ready, focus the first card in keyboard mode
    watch(
        () => game.cardsAreReady,
        async (ready) => {
            if (ready && store.controlMethod === 'keyboard') {
                await nextTick()
                game.focusedIndex = 0
            } else
                game.focusedIndex = -1
        }
    )
})

onBeforeUnmount(() => {
    window.removeEventListener('keydown', handleKeyDown)
    window.removeEventListener('resize', updateCardSize)
})
</script>
