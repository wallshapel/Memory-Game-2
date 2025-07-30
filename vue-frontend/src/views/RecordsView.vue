<style scoped>
th,
td {
    padding: 8px 12px;
    white-space: nowrap;
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
                                <th class="text-left">#</th>
                                <th class="text-left">Name</th>
                                <th class="text-left">Difficulty</th>
                                <th class="text-left">Cards</th>
                                <th class="text-left">Time</th>
                                <th class="text-left">Hits</th>
                                <th class="text-left">Mistakes</th>
                                <th class="text-left">Effectiveness</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(record, index) in records" :key="record._id">
                                <td>{{ index + 1 }}</td>
                                <td>{{ record.name }}</td>
                                <td>{{ difficultyLabel(record.difficulty) }}</td>
                                <td>{{ record.totalCards }}</td>
                                <td>{{ formatTime(record.time) }}</td>
                                <td>{{ record.hits }}</td>
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
import { onMounted, ref, onBeforeUnmount, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { getTopRecords } from '../api/backend/records'
import { useAudioStore } from '../store/audioStore'
import { GAME_EFFECTS } from '../constants/assets'

const router = useRouter()
const records = ref<any[]>([])
const audioStore = useAudioStore()
const backButton = ref<any>(null)

const difficultyLabel = (value: number): string => {
    return ['Easy', 'Medium', 'Hard'][value] || 'Unknown'
}

const formatTime = (ms: number): string => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    const millis = ms % 1000
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(millis).padStart(3, '0')}`
}

const goBack = () => {
    audioStore.playEffect(GAME_EFFECTS.EFFECT_SUCCESS)
    router.push('/menu')
}

onMounted(async () => {
    try {
        records.value = await getTopRecords()
    } catch (err) {
        console.error('Failed to load records:', err)
    }

    nextTick(() => {
        backButton.value?.$el?.focus()
    })

    window.addEventListener('keydown', handleKeydown)
})

const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape')
        goBack()
}

onBeforeUnmount(() => {
    window.removeEventListener('keydown', handleKeydown)
})

</script>