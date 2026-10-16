<script setup lang="ts">
import { computed } from 'vue'
import {
  cn,
  type TypographyElement,
  type TypographyTone,
  type TypographyVariant,
} from '@/design-system'

const props = withDefaults(
  defineProps<{
    as?: TypographyElement
    variant?: TypographyVariant
    tone?: TypographyTone
  }>(),
  {
    as: 'p',
    variant: 'body',
    tone: 'default',
  },
)

const variantClasses: Record<TypographyVariant, string> = {
  display: 'text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl',
  'heading-xl': 'text-3xl font-bold tracking-tight sm:text-4xl',
  'heading-lg': 'text-2xl font-bold tracking-tight sm:text-3xl',
  'heading-md': 'text-xl font-bold tracking-tight sm:text-2xl',
  'heading-sm': 'text-lg font-semibold tracking-tight sm:text-xl',
  'heading-xs': 'text-base font-semibold sm:text-lg',
  body: '',
  'body-sm': 'text-sm',
  caption: 'text-xs leading-5',
  eyebrow: 'text-sm font-semibold uppercase tracking-widest',
  'eyebrow-wide': 'text-sm font-semibold uppercase tracking-[0.2em]',
  'label-xs': 'text-xs font-semibold uppercase tracking-widest',
  'numeric-xl': 'font-mono text-4xl font-bold leading-none tracking-tight',
  'numeric-lg': 'font-mono text-2xl font-bold tracking-tight sm:text-3xl',
  'numeric-md': 'font-mono text-xl font-bold leading-none tracking-tight',
  'numeric-inline': 'font-mono font-bold',
}

const toneClasses: Record<TypographyTone, string> = {
  default: '',
  muted: 'text-graphite',
  accent: 'text-trail-ink',
}

const classes = computed(() => cn(variantClasses[props.variant], toneClasses[props.tone]))
</script>

<template>
  <component :is="as" :class="classes"><slot /></component>
</template>
