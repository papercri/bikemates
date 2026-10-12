<script setup lang="ts">
import Typography from '@/components/ui/Typography.vue'

withDefaults(
  defineProps<{
    title?: string
    description: string
    titleAs?: 'h1' | 'h2' | 'h3'
  }>(),
  {
    title: undefined,
    titleAs: 'h2',
  },
)
</script>

<template>
  <div>
    <Typography v-if="title" :as="titleAs" variant="heading-md">{{ title }}</Typography>
    <Typography :class="title ? 'mt-3' : undefined" tone="muted">{{ description }}</Typography>
    <div v-if="$slots.default" class="mt-6">
      <slot />
    </div>
  </div>
</template>
