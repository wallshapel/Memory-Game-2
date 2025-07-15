<style scoped>
.disable-mouse {
    pointer-events: none;
}
</style>

<template>
    <div v-if="game.cards.length > 0" :style="gridStyle"
        :class="{ 'disable-mouse': store.controlMethod === 'keyboard' }">
        <Card v-for="(card, index) in game.cards" :key="card.id" :card="card"
            :isFocused="store.controlMethod === 'keyboard' && game.cardsAreReady && index === game.focusedIndex"
            :dimensions="cardDimensions" />
    </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onBeforeUnmount, watch } from 'vue'
import { useGameStore } from '../store/gameStore'
import { usePlayerStore } from '../store/playerStore'
import Card from './Card.vue'
import { CARD_DISPLAY_SETTINGS } from '../constants/assets'

const game = useGameStore()
const store = usePlayerStore()
const screenSize = ref<'SMALL' | 'MEDIUM' | 'LARGE'>('LARGE')

const cardDimensions = computed(() => ({
    width: CARD_DISPLAY_SETTINGS[screenSize.value].CARD_WIDTH,
    height: Math.round(CARD_DISPLAY_SETTINGS[screenSize.value].CARD_WIDTH * 1.5),
    margin: Math.round(CARD_DISPLAY_SETTINGS[screenSize.value].CARD_GAP / 2),
}))

const updateScreenSize = () => {
    const width = window.innerWidth
    if (width <= 539) screenSize.value = 'SMALL'
    else if (width <= 1023) screenSize.value = 'MEDIUM'
    else screenSize.value = 'LARGE'
}

function calculateGrid(count: number): { columns: number; rows: number } {
    if (Number.isInteger(Math.sqrt(count))) {
        const side = Math.sqrt(count)
        return { columns: side, rows: side }
    }

    const upper = Math.ceil(Math.sqrt(count))
    const lower = Math.floor(Math.sqrt(count))

    for (let cols = upper; cols <= count; cols++)
        if (count % cols === 0) return { columns: cols, rows: count / cols }

    return { columns: upper, rows: lower }
}

const gridStyle = computed(() => {
    const grid = calculateGrid(game.cards.length)
    const settings = CARD_DISPLAY_SETTINGS[screenSize.value]

    return {
        display: 'grid',
        gridTemplateColumns: `repeat(${grid.columns}, ${settings.CARD_WIDTH}px)`,
        gap: `${settings.CARD_GAP}px`,
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
                store.playEffect('select')
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

    updateScreenSize()
    window.addEventListener('resize', updateScreenSize)
})

onBeforeUnmount(() => {
    window.removeEventListener('keydown', handleKeyDown)
    window.removeEventListener('resize', updateScreenSize)
})
</script>
