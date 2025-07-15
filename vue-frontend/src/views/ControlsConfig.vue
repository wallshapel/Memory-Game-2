<template>
    <v-app>
        <v-main>
            <v-container class="d-flex flex-column align-center justify-center" style="min-height: 100vh" fluid>
                <h1 class="text-h5 mb-6">Control Settings</h1>

                <v-card class="pa-6" width="100%" max-width="500" rounded="xl">
                    <v-radio-group v-model="store.controlMethod" label="Select Control Method" class="mb-4">
                        <v-radio label="🖱 Mouse (click to flip cards)" value="mouse" />
                        <v-radio label="⌨️ Keyboard (arrow keys to move, Enter/Space to flip)" value="keyboard" />
                    </v-radio-group>

                    <v-alert type="info" class="mb-4" border="start" variant="tonal"
                        v-if="store.controlMethod === 'keyboard'">
                        Use arrow keys (← ↑ → ↓) to move, and Enter or Space to flip the selected card.
                    </v-alert>

                    <v-btn class="mt-6" color="secondary" @click="router.push('/config')" block>
                        ⬅ Back to Config
                    </v-btn>
                </v-card>
            </v-container>
        </v-main>
    </v-app>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { usePlayerStore } from '../store/playerStore'

const router = useRouter()
const store = usePlayerStore()

// ⎋ ESC to return to config
const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape')
        router.push('/config')
}

onMounted(() => {
    window.addEventListener('keydown', handleEscape)
})

onBeforeUnmount(() => {
    window.removeEventListener('keydown', handleEscape)
})
</script>