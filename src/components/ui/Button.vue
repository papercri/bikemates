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
  base: 'inline-flex items-center justify-center gap-2 rounded-btn font-semibold transition-[color,background-color,border-color,transform] focus-visible:outline-2 focus-visible:outline-offset-2 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60 disabled:active:translate-y-0 sm:whitespace-nowrap',
  variants: {
    variant: {
      // Naranja con tinta negra: 5.9:1, cumple AA a 16px.
      primary: 'bg-trail text-ink border-2 border-ink hover:bg-ink hover:text-canvas focus-visible:outline-ink',
      sun: 'bg-canvas text-ink border-2 border-ink hover:bg-trail hover:text-ink focus-visible:outline-canvas',
      'sun-outline':
        'border-2 border-canvas bg-transparent text-canvas hover:bg-canvas hover:text-ink focus-visible:outline-canvas',
      outline:
        'border-2 border-ink bg-transparent text-ink hover:bg-ink hover:text-canvas focus-visible:outline-ink',
      destructive:
        'border-2 border-red-700 bg-canvas text-red-700 hover:bg-red-700 hover:text-canvas focus-visible:outline-red-700',
      // Acción destructiva de bajo peso: el color solo aparece al interactuar.
      'quiet-destructive': 'text-graphite hover:text-red-700 focus-visible:outline-red-600',
      link: 'text-trail-ink underline-offset-4 hover:underline focus-visible:outline-ink',
    },
    size: {
      xs: 'px-2.5 py-1 text-xs',
      sm: 'px-3.5 py-1.5 text-sm',
      md: 'px-4 py-2',
      lg: 'px-5 py-2.5',
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
