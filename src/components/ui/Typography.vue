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
  display: 'font-display text-4xl font-extrabold leading-[0.95] tracking-[-0.035em] sm:text-6xl',
  'heading-xl':
    'font-display text-3xl font-extrabold leading-[1.02] tracking-[-0.03em] sm:text-4xl',
  'heading-lg':
    'font-display text-2xl font-extrabold leading-[1.05] tracking-[-0.02em] sm:text-3xl',
  'heading-md': 'font-display text-xl font-bold leading-tight tracking-[-0.02em] sm:text-2xl',
  'heading-sm': 'text-lg font-semibold tracking-tight sm:text-xl',
  'heading-xs': 'text-base font-semibold sm:text-lg',
  body: '',
  'body-sm': 'text-sm',
  caption: 'text-xs leading-5',
  eyebrow: 'font-mono text-xs font-semibold uppercase tracking-[0.18em]',
  'eyebrow-wide': 'font-mono text-xs font-semibold uppercase tracking-[0.22em]',
  'label-xs': 'font-mono text-[0.7rem] font-semibold uppercase tracking-[0.18em]',
  'numeric-xl': 'font-display text-4xl font-extrabold leading-none tracking-tight tabular-nums',
  'numeric-lg': 'font-display text-2xl font-extrabold tracking-tight tabular-nums sm:text-3xl',
  'numeric-md': 'font-display text-xl font-extrabold leading-none tracking-tight tabular-nums',
  'numeric-inline': 'font-display font-bold tabular-nums',
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
