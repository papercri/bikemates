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
    props.variant === 'danger' ? 'border border-red-200 bg-red-50' : 'border border-line bg-white',
    // Cowboy: planitud editorial; el hover solo refuerza el filete, sin sombras.
    props.interactive && 'transition-colors duration-200 hover:border-line-strong',
  ),
)
</script>

<template>
  <component :is="as" :class="classes">
    <slot />
  </component>
</template>
