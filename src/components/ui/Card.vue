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
    props.variant === 'danger' ? 'border-2 border-red-600 bg-red-50' : 'border-2 border-ink bg-canvas',
    // Sin sombras suaves: la jerarquía la marcan el filete negro y el tono de fondo.
    props.interactive && 'transition-colors duration-200 hover:border-ink hover:bg-surface',
  ),
)
</script>

<template>
  <component :is="as" :class="classes">
    <slot />
  </component>
</template>
