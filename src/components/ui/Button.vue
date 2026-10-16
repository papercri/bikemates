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
  base: 'inline-flex items-center justify-center gap-2 rounded-btn font-semibold transition-[color,background-color,border-color,transform] focus-visible:outline-2 focus-visible:outline-offset-2 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60 disabled:active:translate-y-0',
  variants: {
    variant: {
      primary: 'bg-trail text-ink hover:bg-trail-deep focus-visible:outline-ink',
      outline:
        'border border-line-strong bg-canvas text-ink hover:border-trail hover:text-trail-ink focus-visible:outline-trail',
      destructive:
        'border border-red-300 bg-canvas text-red-700 hover:bg-red-100 focus-visible:outline-red-600',
      link: 'text-trail-ink hover:text-trail-dark focus-visible:outline-trail',
    },
    size: {
      sm: 'px-4 py-2.5 text-sm',
      md: 'px-5 py-3',
      lg: 'px-6 py-3.5',
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
