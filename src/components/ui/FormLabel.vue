<script setup lang="ts">
import { cn } from '@/design-system'

withDefaults(
  defineProps<{
    id: string
    margin?: boolean
  }>(),
  {
    margin: true,
  },
)

const classes = cn('block text-sm font-medium')
</script>

<template>
  <label :for="id" :class="[classes, margin ? 'mb-2' : undefined]">
    <slot />
  </label>
</template>
