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
  // Pastel apagado en píldora: el color es escaso y solo marca significado.
  base: 'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium tracking-[0.03em]',
  variants: {
    variant: { soft: '', muted: '', inverse: '' },
    color: { trail: '', route: '', ink: '' },
  },
  defaultVariants: {
    variant: 'soft',
    color: 'trail',
  },
  compoundVariants: [
    { variant: 'soft', color: 'trail', class: 'bg-trail/15 text-trail-ink' },
    // Escalera de intensidad creciente sin depender solo del color: naranja pálido, gris y losa negra.
    { variant: 'soft', color: 'route', class: 'bg-ink/8 text-ink' },
    { variant: 'soft', color: 'ink', class: 'bg-ink text-canvas' },
    { variant: 'muted', color: 'trail', class: 'bg-surface text-graphite' },
    { variant: 'muted', color: 'route', class: 'bg-surface text-graphite' },
    { variant: 'muted', color: 'ink', class: 'bg-surface text-graphite' },
    // Sobre fotografía: chip translúcido oscuro que nunca depende del tono de la foto.
    { variant: 'inverse', color: 'trail', class: 'bg-ink/55 text-canvas' },
    { variant: 'inverse', color: 'route', class: 'bg-ink/55 text-canvas' },
    { variant: 'inverse', color: 'ink', class: 'bg-ink/55 text-canvas' },
  ],
})

const dotColorClasses: Record<BadgeColor, string> = {
  trail: 'bg-trail',
  route: 'bg-route',
  // El punto nunca puede fundirse con la losa negra del color `ink`.
  ink: 'bg-canvas',
}
</script>

<template>
  <span :class="classes({ variant, color })">
    <span
      v-if="dot"
      aria-hidden="true"
      class="h-1.5 w-1.5 rounded-full"
      :class="variant === 'inverse' ? 'bg-trail' : dotColorClasses[color]"
    />
    <slot />
  </span>
</template>
