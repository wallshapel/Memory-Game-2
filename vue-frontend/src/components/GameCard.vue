<!-- src/components/GameCard.vue -->
<style scoped>
/* ---- GameCard Flipping and Focus Styles ---- */

.card-inner {
    width: 100%;
    height: 100%;
    transition: transform 0.6s ease;
    transform-style: preserve-3d;
    position: relative;
}

/* GameCard flips on Y axis when flipped */
.card.flipped .card-inner {
    transform: rotateY(180deg);
}

.card-front,
.card-back {
    position: absolute;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
    cursor: pointer;
}

.card-front img,
.card-back img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
}

.card-back {
    transform: rotateY(180deg);
}

/* Hover effect when face down */
.card:not(.flipped):hover .card-inner {
    transform: scale(1.05);
}

/* Highlight for keyboard focus */
.card.focused .card-inner {
    outline: 3px solid #ff9800;
}

/* Combine flip + focus: rotate and scale */
.card.flipped.focused .card-inner {
    transform: rotateY(180deg) scale(1.08);
}

/* Scale for focus when not flipped */
.card:not(.flipped).focused .card-inner {
    transform: scale(1.08);
}

.noselect,
.card,
.card-inner {
    user-select: none;
    -webkit-user-select: none;
    -ms-user-select: none;
    -moz-user-select: none;
}
</style>

<template>
    <!--
      Represents a single memory card in the game.
      - Handles flipping, focus highlight, and click/hover events.
      - Shows either the cover image (front) or the actual image (back).
      - Fully supports mouse and keyboard accessibility.
    -->
    <div class="card noselect" :class="{ flipped: card.flipped, focused: isFocused }" @mouseenter="handleHover"
        @click="handleClick" :style="{
            width: props.width + 'px',
            height: props.height + 'px',
            perspective: '600px',
            margin: '1px'
        }" @mousedown.prevent @selectstart.prevent>
        <div class="card-inner">
            <div class="card-front">
                <img :src="coverImage" alt="Cover" draggable="false" />
            </div>
            <div class="card-back">
                <img :src="card.image" alt="Animal" draggable="false" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
/**
 * GameCard.vue
 * - Displays a single card for the memory game.
 * - Handles animation, audio feedback, and click/focus interaction.
 */

import { computed, watch } from 'vue'
import { useGameStore } from '../store/gameStore'
import { usePlayerStore } from '../store/playerStore'
import { useAudioStore } from '../store/audioStore'
import {
    BASE_PATH_IMAGE_RESOURCES,
    DEFAULT_COVER_IMAGE,
    GAME_EFFECTS,
    FULL_BASE_PATH_IMAGE_RESOURCES
} from '../constants/assets'

const game = useGameStore()
const store = usePlayerStore()
const audio = useAudioStore()

const props = defineProps<{
    card: {
        id: string
        name: string
        image: string
        matched: boolean
        flipped: boolean
        blocked: boolean
    },
    isFocused: boolean,
    width: number,
    height: number
}>()

/**
 * Handles hover effect:
 * - Plays "over" sound if card is not yet flipped and game is not lost.
 */
const handleHover = () => {
    if (!props.card.flipped && !game.hasLost)
        audio.playEffect(GAME_EFFECTS.EFFECT_OVER)
}

/**
 * Handles card click:
 * - Plays "select" sound and triggers the flip logic on the store.
 */
const handleClick = () => {
    if (!props.card.flipped && !game.hasLost) {
        audio.playEffect(GAME_EFFECTS.EFFECT_SELECT)
        game.handleCardClick(props.card)
    }
}

// Also play sound when card becomes focused (for keyboard navigation)
watch(() => props.isFocused, (focused) => {
    if (focused && !props.card.flipped && !game.hasLost)
        audio.playEffect(GAME_EFFECTS.EFFECT_OVER)
})

/**
 * Returns the correct cover image based on cover type (default/uploaded).
 */
const coverImage = computed(() => {
    if (store.coverType === 'uploaded' && store.coverFileName)
        return `${FULL_BASE_PATH_IMAGE_RESOURCES.COVERS_PATH}${store.coverFileName}`;
    return `${BASE_PATH_IMAGE_RESOURCES.COVERS_PATH}${DEFAULT_COVER_IMAGE}`;
});
</script>
