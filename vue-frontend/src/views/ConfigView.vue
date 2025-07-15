<template>
    <v-app>
        <v-main>
            <v-container class="d-flex flex-column align-center justify-center" style="min-height: 100vh;" fluid>
                <v-card class="pa-6 text-center" max-width="400" width="100%">
                    <h1 class="text-h5 mb-6">Game Configuration</h1>

                    <v-btn block class="mb-3" color="primary" @click="router.push('/config/profile')">
                        👤 Profile
                    </v-btn>
                    <v-btn block class="mb-3" color="primary" @click="router.push('/config/gameplay')">
                        👾 GamePlay
                    </v-btn>
                    <v-btn block class="mb-3" color="primary" @click="router.push('/config/cards')">
                        🃏 Cards
                    </v-btn>
                    <v-btn block class="mb-3" color="primary" @click="router.push('/config/controls')">
                        🎮 Controls
                    </v-btn>
                    <v-btn block class="mb-6" color="primary" @click="router.push('/config/sound')">
                        🔊 Sound
                    </v-btn>

                    <v-divider class="mb-6"></v-divider>

                    <v-btn block color="secondary" @click="router.push('/')">
                        ⬅ Back to Menu
                    </v-btn>
                </v-card>
            </v-container>
        </v-main>
    </v-app>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()

// ⎋ ESC to return to main menu
const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape')
        router.push('/')
}

onMounted(() => {
    window.addEventListener('keydown', handleEscape)
})

onBeforeUnmount(() => {
    window.removeEventListener('keydown', handleEscape)
})
</script>
