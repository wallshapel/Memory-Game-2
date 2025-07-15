<template>
  <v-dialog v-model="internalModelValue" max-width="400" @keydown.esc="handleClose">
    <v-card rounded="xl">
      <v-card-title class="d-flex justify-space-between align-center text-h6">
        <span class="text-center w-100">{{ title }}</span>
        <v-btn icon @click="handleClose" variant="text" size="small">
          ❌
        </v-btn>
      </v-card-title>

      <v-card-text class="text-center">
        {{ message }}
      </v-card-text>

      <v-card-actions class="justify-center">
        <v-btn color="primary" @click="emitConfirm" ref="actionButton">
          {{ actionLabel }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick } from 'vue'

const props = defineProps<{
  title: string
  message: string
  actionLabel: string
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm'): void
}>()

const internalModelValue = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit('update:modelValue', val),
})

const emitConfirm = () => {
  emit('confirm')
}

const handleClose = () => {
  emit('update:modelValue', false)
}

// 👉 Focus logic
const actionButton = ref<any>(null)

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      nextTick(() => {
        actionButton.value?.$el?.focus()
      })
    }
  }
)
</script>
