<script setup lang="ts">
import { createVariant, type BadgeColor, type BadgeVariant } from '@/design-system'

withDefaults(
  defineProps<{
    variant?: BadgeVariant
    color?: BadgeColor
    dot?: boolean
  }>(),
  {
    variant: 'soft',
    color: 'trail',
    dot: false,
  },
)

const classes = createVariant({
  base: 'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
  variants: {
    variant: { soft: '', muted: '' },
    color: { trail: '', route: '', ink: '' },
  },
  defaultVariants: {
    variant: 'soft',
    color: 'trail',
  },
  compoundVariants: [
    { variant: 'soft', color: 'trail', class: 'bg-trail/15 text-trail-dark' },
    { variant: 'soft', color: 'route', class: 'bg-route/15 text-route-dark' },
    { variant: 'soft', color: 'ink', class: 'bg-ink/10 text-ink' },
    { variant: 'muted', color: 'trail', class: 'bg-surface text-graphite' },
    { variant: 'muted', color: 'route', class: 'bg-surface text-graphite' },
    { variant: 'muted', color: 'ink', class: 'bg-surface text-graphite' },
  ],
})

const dotColorClasses: Record<BadgeColor, string> = {
  trail: 'bg-trail',
  route: 'bg-route',
  ink: 'bg-ink',
}
</script>

<template>
  <span :class="classes({ variant, color })">
    <span
      v-if="dot"
      aria-hidden="true"
      class="h-1.5 w-1.5 rounded-full"
      :class="dotColorClasses[color]"
    />
    <slot />
  </span>
</template>
