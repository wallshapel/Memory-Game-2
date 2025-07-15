<style scoped>
.card-inner {
    width: 100%;
    height: 100%;
    transition: transform 0.6s ease;
    transform-style: preserve-3d;
    position: relative;
}

/* Turn the card when it is flipped */
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

/* Visual hover only if upside down */
.card:not(.flipped):hover .card-inner {
    transform: scale(1.05);
}

/* 👉 Highlight the currently focused card (keyboard control) */
.card.focused .card-inner {
    outline: 3px solid #ff9800;
}

/* Combine flip + focus: rotate + scale */
.card.flipped.focused .card-inner {
    transform: rotateY(180deg) scale(1.08);
}

/* Focus without flip: just scale */
.card:not(.flipped).focused .card-inner {
    transform: scale(1.08);
}
</style>

<template>
    <div class="card" :class="{ flipped: card.flipped, focused: isFocused }" @mouseenter="handleHover"
        @click="handleClick"
        :style="{ width: props.width + 'px', height: props.height + 'px', perspective: '600px', margin: '1px' }">
        <div class="card-inner">
            <div class="card-front">
                <img :src="coverImage" alt="Cover" />
            </div>
            <div class="card-back">
                <img :src="card.image" alt="Animal" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useGameStore } from '../store/gameStore'
import { usePlayerStore } from '../store/playerStore'
import { DEFAULT_COVER_IMAGE } from '../constants/assets'

const game = useGameStore()
const store = usePlayerStore()

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

const handleHover = () => {
    if (!props.card.flipped && !game.hasLost)
        store.playEffect('over')
}

const handleClick = () => {
    if (!props.card.flipped && !game.hasLost) {
        store.playEffect('select')
        game.handleCardClick(props.card)
    }
}

// 🎯 Detect if this letter was focused by keyboard
watch(() => props.isFocused, (focused) => {
    if (focused && !props.card.flipped && !game.hasLost)
        store.playEffect('over')
})

const coverImage = computed(() => {
    if (store.coverType === 'uploaded' && store.coverFile)
        return URL.createObjectURL(store.coverFile)
    return DEFAULT_COVER_IMAGE
})
</script>
