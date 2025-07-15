<template>
  <v-app>
    <v-main>
      <v-container class="d-flex flex-column align-center justify-center" style="min-height: 100vh;" fluid>
        <v-card class="pa-6 text-center" max-width="400" width="100%">
          <h1 class="text-h4 font-weight-bold mb-6">Memory Game</h1>

          <v-btn ref="playButton" block class="mb-4" color="primary" @click="handlePlay">
            ▶️ Play
          </v-btn>

          <v-btn block class="mb-4" color="secondary" @click="handleOptions">
            ⚙️ Options
          </v-btn>

          <!-- Modal profile -->
          <AlertModal v-model="showModal" title="Missing Profile"
            message="Please enter your name in the Profile section before playing." actionLabel="Go to Profile"
            @confirm="goToProfile" />
        </v-card>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref, defineAsyncComponent, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { usePlayerStore } from '../store/playerStore'

const AlertModal = defineAsyncComponent(() => import('../components/AlertModal.vue'))

const router = useRouter()
const store = usePlayerStore()
const showModal = ref(false)
const playButton = ref<any>(null)
const playerStore = usePlayerStore()

const handlePlay = () => {
  if (!store.name.trim())
    showModal.value = true
  else
    router.push('/game')
}

const handleOptions = () => {
  router.push('/config')
}

const goToProfile = () => {
  showModal.value = false
  router.push('/config/profile')
}

onMounted(() => {
  nextTick(() => {
    playButton.value?.$el?.focus()
  })
   playerStore.playMusic()
})
</script>
