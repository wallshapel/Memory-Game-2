<style scoped>
.disable-mouse {
    pointer-events: none;
}
</style>

<template>
    <div v-if="game.cards.length > 0" :style="gridStyle"
        :class="{ 'disable-mouse': store.controlMethod === 'keyboard' }">
        <Card v-for="(card, index) in game.cards" :key="card.id" :card="card" :width="cardWidth" :height="cardHeight"
            :isFocused="store.controlMethod === 'keyboard' && game.cardsAreReady && index === game.focusedIndex" />
    </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onBeforeUnmount, watch } from 'vue'
import { useGameStore } from '../store/gameStore'
import { usePlayerStore } from '../store/playerStore'
import { useAudioStore } from '../store/audioStore'
import Card from './Card.vue'
import { BOARD_GAP, BREAKPOINTS, DEFAULT_CARDS_SIZE, GAME_EFFECTS } from '../constants/assets'

const game = useGameStore()
const store = usePlayerStore()
const audio = useAudioStore()

const cardWidth = ref(DEFAULT_CARDS_SIZE.width)
const cardHeight = ref(DEFAULT_CARDS_SIZE.height)

function updateCardSize() {
    const width = window.innerWidth
    if (width <= BREAKPOINTS.xs.maxWidth) {
        cardWidth.value = BREAKPOINTS.xs.cardWidth
        cardHeight.value = BREAKPOINTS.xs.cardHeight
    } else if (width <= BREAKPOINTS.sm.maxWidth) {
        cardWidth.value = BREAKPOINTS.sm.cardWidth
        cardHeight.value = BREAKPOINTS.sm.cardHeight
    } else if (width <= BREAKPOINTS.md.maxWidth) {
        cardWidth.value = BREAKPOINTS.md.cardWidth
        cardHeight.value = BREAKPOINTS.md.cardHeight
    } else {
        cardWidth.value = BREAKPOINTS.lg.cardWidth
        cardHeight.value = BREAKPOINTS.lg.cardHeight
    }
}

function calculateGrid(count: number): { columns: number; rows: number } {
    let bestCols = count
    let bestRows = 1
    let minDiff = count
    let minArea = Infinity

    for (let rows = 1; rows <= count; rows++) {
        const cols = Math.ceil(count / rows)
        const area = cols * rows
        const diff = Math.abs(cols - rows)

        if (
            diff < minDiff ||
            (diff === minDiff && area < minArea)
        ) {
            bestCols = cols
            bestRows = rows
            minDiff = diff
            minArea = area
        }
    }

    return { columns: bestCols, rows: bestRows }
}

const gridStyle = computed(() => {
    const grid = calculateGrid(game.cards.length)
    return {
        display: 'grid',
        gridTemplateColumns: `repeat(${grid.columns}, ${cardWidth.value}px)`,
        gap: BOARD_GAP,
    }
})

function handleKeyDown(e: KeyboardEvent) {
    if (store.controlMethod !== 'keyboard' || !game.cardsAreReady) return

    const cards = game.cards
    const current = game.focusedIndex
    const grid = calculateGrid(cards.length)

    let newIndex = current

    const isValidIndex = (idx: number) => idx >= 0 && idx < cards.length

    switch (e.key) {
        case 'ArrowRight':
            do {
                newIndex = (newIndex + 1) % cards.length
            } while (!isValidIndex(newIndex) || newIndex === current)
            break
        case 'ArrowLeft':
            do {
                newIndex = (newIndex - 1 + cards.length) % cards.length
            } while (!isValidIndex(newIndex) || newIndex === current)
            break
        case 'ArrowDown':
            do {
                newIndex = (newIndex + grid.columns) % cards.length
            } while (!isValidIndex(newIndex) || newIndex === current)
            break
        case 'ArrowUp':
            do {
                newIndex = (newIndex - grid.columns + cards.length) % cards.length
            } while (!isValidIndex(newIndex) || newIndex === current)
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

onMounted(() => {
    window.addEventListener('keydown', handleKeyDown)

    watch(
        () => game.cardsAreReady,
        async (ready) => {
            if (ready && store.controlMethod === 'keyboard') {
                await nextTick()
                game.focusedIndex = 0 // Allows focus to be initiated on the first card (even if paired).
            } else
                game.focusedIndex = -1
        }
    )

    updateCardSize()
    window.addEventListener('resize', updateCardSize)
})

onBeforeUnmount(() => {
    window.removeEventListener('keydown', handleKeyDown)
    window.removeEventListener('resize', updateCardSize)
})
</script>