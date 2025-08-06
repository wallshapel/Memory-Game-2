<!-- src/components/AlertModal.vue -->
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
/**
 * AlertModal.vue
 * --------------
 * Simple modal dialog component for confirmations, errors, or alerts.
 * Shows a title, a message, and a single action button. Supports closing with Escape key
 * or close button. Focuses the action button on open.
 *
 * Props:
 *  - title:       The dialog title.
 *  - message:     The message or body content.
 *  - actionLabel: The label of the main action button.
 *  - modelValue:  Whether the dialog is open (v-model).
 *
 * Emits:
 *  - update:modelValue (boolean): When modal open/close state changes.
 *  - confirm: When the action button is pressed.
 */

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

// Internal v-model binding for dialog open/close state
const internalModelValue = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit('update:modelValue', val),
})

// Emits the confirm event when the action button is pressed
const emitConfirm = () => emit('confirm')

// Handles modal close (Escape key or close button)
const handleClose = () => emit('update:modelValue', false)

// Focus the action button whenever the dialog is opened
const actionButton = ref<HTMLElement | null>(null)

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen)
      void nextTick(() => actionButton.value?.focus())
  }
)
</script>
