<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, type RouteLocationRaw } from 'vue-router'
import { createVariant, type ButtonSize, type ButtonVariant } from '@/design-system'

const props = withDefaults(
  defineProps<{
    variant?: ButtonVariant
    size?: ButtonSize
    type?: 'button' | 'submit' | 'reset'
    disabled?: boolean
    loading?: boolean
    block?: boolean
    to?: RouteLocationRaw
    href?: string
  }>(),
  {
    variant: 'primary',
    size: 'md',
    type: 'button',
    disabled: false,
    loading: false,
    block: false,
    to: undefined,
    href: undefined,
  },
)

const classes = createVariant({
  base: 'inline-flex items-center justify-center gap-2 rounded-btn font-semibold transition-[color,background-color,border-color,transform] focus-visible:outline-2 focus-visible:outline-offset-2 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100 sm:whitespace-nowrap',
  variants: {
    variant: {
      // CTA principal: verde profundo de marca con texto blanco (AA 5:1);
      // el hover oscurece un paso más.
      primary: 'bg-trail-ink text-canvas hover:bg-trail-dark focus-visible:outline-ink',
      // Sobre fotos y fondos oscuros: botón blanco con texto tinta.
      sun: 'bg-canvas text-ink hover:bg-canvas/90 focus-visible:outline-canvas',
      'sun-outline':
        'border border-canvas/50 bg-transparent text-canvas hover:bg-canvas hover:text-ink focus-visible:outline-canvas',
      // Sobre foto: como la navegación en overlay, sin relleno; solo leve realce al hover.
      'sun-quiet':
        'border border-transparent bg-transparent text-white/90 hover:bg-white/10 hover:text-white focus-visible:outline-canvas',
      // Acción secundaria: filete neutro fino, sin borde negro.
      outline:
        'border border-line-strong bg-white text-ink hover:border-graphite hover:bg-snow focus-visible:outline-ink',
      destructive:
        'border border-red-300 bg-white text-red-700 hover:bg-red-700 hover:text-white focus-visible:outline-red-700',
      // Acción destructiva de bajo peso: el color solo aparece al interactuar.
      'quiet-destructive': 'text-graphite hover:text-red-700 focus-visible:outline-red-600',
      link: 'text-ink underline-offset-4 hover:underline focus-visible:outline-ink',
    },
    size: {
      xs: 'px-2.5 py-1 text-xs',
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-1.5 text-sm',
      lg: 'px-5 py-2 text-sm',
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'md',
  },
})

// La variante `link` no aplica padding de tamaño: es un enlace de texto.
const rootClasses = computed(() => [
  classes({
    variant: props.variant,
    size: props.variant === 'link' ? undefined : props.size,
  }),
  props.block ? 'w-full' : undefined,
])
</script>

<template>
  <RouterLink v-if="to" :to="to" :class="rootClasses" :aria-disabled="loading || undefined">
    <slot />
  </RouterLink>

  <a v-else-if="href" :href="href" :class="rootClasses">
    <slot />
  </a>

  <button
    v-else
    :type="type"
    :disabled="disabled || loading"
    :aria-busy="loading || undefined"
    :class="rootClasses"
  >
    <span
      v-if="loading"
      aria-hidden="true"
      class="size-4 shrink-0 rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none motion-safe:animate-spin"
    />
    <slot />
  </button>
</template>
