<script setup lang="ts">
import { cn } from '@/design-system'

withDefaults(
  defineProps<{
    id: string
    required?: boolean
  }>(),
  {
    required: false,
  },
)

const classes = cn('block text-xs font-semibold')
</script>

<template>
  <label :for="id" :class="classes">
    <slot />
    <span v-if="required" class="ml-0.5 text-red-600" aria-hidden="true">*</span>
    <span v-if="required" class="sr-only"> (obligatorio)</span>
  </label>
</template>
