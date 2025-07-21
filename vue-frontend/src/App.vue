<template>
  <router-view />
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { usePlayerStore } from "../src/store/playerStore";

const playerStore = usePlayerStore();

onMounted(() => {
  playerStore.loadInitialSettings();
});
</script>
