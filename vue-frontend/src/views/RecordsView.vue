<!-- src/views/RecordsView.vue -->
<style scoped>
th,
td {
    padding: 8px 12px;
    white-space: nowrap;
}

.hoverable {
    cursor: pointer;
    background-color: #f0f8ff;
}

.hoverable:hover {
    background-color: #e6f2ff;
}

.disabled-row {
    opacity: 0.5;
    cursor: not-allowed;
}
</style>

<template>
    <v-app>
        <v-main>
            <v-container class="py-8" fluid>
                <v-card class="mx-auto pa-6" max-width="800">
                    <h1 class="text-h5 font-weight-bold text-center mb-6">🏆 Top 20 Records</h1>
                    <v-table dense>
                        <thead>
                            <tr>
                                <th class="text-left"></th>
                                <th class="text-left">#</th>
                                <th class="text-left">Name</th>
                                <th class="text-left">Difficulty</th>
                                <th class="text-left">Cards</th>
                                <th class="text-left">Time</th>
                                <th class="text-left">Mistakes</th>
                                <th class="text-left">Effectiveness</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(record, index) in records" :key="record._id" :class="{
                                'hoverable': isRecordSelectable(index),
                                'disabled-row': !isRecordSelectable(index)
                            }" @click="isRecordSelectable(index) ? startTimeAttack(record) : null">
                                <td>
                                    <v-icon v-if="isRecordSelectable(index)" small
                                        color="primary">mdi-flag-checkered</v-icon>
                                </td>
                                <td>{{ index + 1 }}</td>
                                <td>{{ record.name }}</td>
                                <td>{{ difficultyLabel(record.difficulty) }}</td>
                                <td>{{ record.totalCards }}</td>
                                <td>{{ formatTime(record.time) }}</td>
                                <td>{{ record.mistakes }}</td>
                                <td>{{ record.effectiveness?.toFixed(2) ?? 'N/A' }}%</td>
                            </tr>
                        </tbody>
                    </v-table>

                    <v-btn ref="backButton" class="mt-6" color="secondary" @click="goBack">
                        ⬅ BACK TO MENU
                    </v-btn>
                </v-card>
            </v-container>
        </v-main>
    </v-app>
</template>

<script setup lang="ts">
import { onMounted, ref, onBeforeUnmount, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getBestRecordForUser, getTopRecords } from '../api/backend/records'
import { usePlayerStore } from '../store/playerStore'
import { useAudioStore } from '../store/audioStore'
import { GAME_EFFECTS, OTHER_MUSICAL_BACKGROUNDS } from '../constants/assets'
import type { IGameRecordWithId } from '../interfaces/IGameRecord'

const router = useRouter()
const route = useRoute()
const records = ref<IGameRecordWithId[]>([])
const playerStore = usePlayerStore()
const myBestRecord = ref<IGameRecordWithId | null>(null)
const selectableIndex = ref<number | null>(null)

const audioStore = useAudioStore()
import type { ComponentPublicInstance } from 'vue'
const backButton = ref<HTMLElement | ComponentPublicInstance | null>(null)

/**
 * Checks if the record at index is selectable for the time attack.
 */
const isRecordSelectable = (index: number): boolean => {
    return selectableIndex.value !== null && index <= selectableIndex.value
}

/**
 * Returns the label for a given difficulty value.
 */
const difficultyLabel = (value: number): string =>
    ['Easy', 'Medium', 'Hard'][value] || 'Unknown'

/**
 * Formats time in milliseconds as mm:ss.mmm
 */
const formatTime = (ms: number): string => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    const millis = ms % 1000
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(millis).padStart(3, '0')}`
}

/**
 * Navigates back to the main menu and plays sound effect.
 */
const goBack = () => {
    audioStore.playEffect(GAME_EFFECTS.EFFECT_SUCCESS)
    void router.push('/menu')
}

/**
 * Starts a time attack challenge based on the selected record.
 */
const startTimeAttack = (record: IGameRecordWithId) => {
    void router.push({
        path: '/game',
        query: {
            timeAttack: '1',
            timeLimit: record.time.toString(),
            totalCards: record.totalCards.toString(),
            difficulty: record.difficulty.toString(),
            mistakes: record.mistakes.toString(),
            targetTime: record.time.toString()
        }
    })
}

/**
 * Plays the fixed background track for records view, using the audioStore central function.
 */
const playRecordsBackground = () => {
    audioStore.playBackgroundForView({
        type: 'fixed',
        file: OTHER_MUSICAL_BACKGROUNDS.records,
        loop: true
    })
}

/**
 * Loads top records and determines which record is selectable.
 */
const loadRecords = async () => {
    try {
        records.value = await getTopRecords() as IGameRecordWithId[]
    } catch (err) {
        console.error('Failed to load records:', err)
    }

    if (playerStore.name) {
        try {
            myBestRecord.value = await getBestRecordForUser(playerStore.name) as IGameRecordWithId
            const idx = records.value.findIndex(r => r._id === myBestRecord.value!._id)
            selectableIndex.value = idx >= 0 ? idx : null
        } catch {
            myBestRecord.value = null
            selectableIndex.value = null
        }
    }
}

// Watch to reload every time you enter /records
watch(
    () => route.fullPath,
    (newPath) => {
        if (newPath === '/records') void loadRecords()
    },
    { immediate: true }
)

onMounted(() => {
    if (route.path === '/records') playRecordsBackground()
    void nextTick(() => {
        const el = backButton.value
        if (el instanceof HTMLElement && typeof el.focus === 'function')
            el.focus()
        else if (
            el &&
            typeof el === 'object' &&
            '$el' in el &&
            el.$el instanceof HTMLElement &&
            typeof el.$el.focus === 'function'
        )
            el.$el.focus()
    })
    window.addEventListener('keydown', handleKeydown)
})


/**
 * Handles Escape key to return to menu.
 */
const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') goBack()
}

onBeforeUnmount(() => {
    window.removeEventListener('keydown', handleKeydown)
})
</script>
