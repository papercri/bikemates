<script setup lang="ts">
const ARROW_PATHS = {
  left: 'M13 8 H4 M7.5 3.5 L3 8 L7.5 12.5',
  right: 'M3 8 H12 M8.5 3.5 L13 8 L8.5 12.5',
} as const

withDefaults(
  defineProps<{
    direction?: keyof typeof ARROW_PATHS
  }>(),
  {
    direction: 'right',
  },
)
</script>

<template>
  <svg viewBox="0 0 16 16" class="h-3.5 w-3.5 shrink-0" aria-hidden="true" focusable="false">
    <path
      :d="ARROW_PATHS[direction]"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</template>
