<script setup lang="ts">
import { computed } from 'vue'
import { cn, type CardVariant } from '@/design-system'

const props = withDefaults(
  defineProps<{
    as?: 'div' | 'article' | 'section' | 'header'
    variant?: CardVariant
    interactive?: boolean
  }>(),
  {
    as: 'div',
    variant: 'default',
    interactive: false,
  },
)

const classes = computed(() =>
  cn(
    'overflow-hidden rounded-card',
    props.variant === 'danger'
      ? 'border border-red-200 bg-red-50'
      : 'border border-line bg-canvas shadow-card',
    props.interactive && 'transition-shadow duration-300 hover:shadow-lg',
  ),
)
</script>

<template>
  <component :is="as" :class="classes">
    <slot />
  </component>
</template>
