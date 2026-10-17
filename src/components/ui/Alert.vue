<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/design-system'
import type { AlertVariant } from '@/design-system'

const props = withDefaults(
  defineProps<{
    variant?: AlertVariant
    /** Renderiza el error como caja con fondo, para mensajes destacados de formulario. */
    boxed?: boolean
  }>(),
  {
    variant: 'error',
    boxed: false,
  },
)

const role = computed(() => (props.variant === 'error' ? 'alert' : 'status'))

const classes = computed(() =>
  cn(
    'text-sm',
    props.variant === 'error'
      ? props.boxed
        ? 'rounded-card border-2 border-red-700 bg-red-50 p-3 text-red-700'
        : 'text-red-700'
      : 'text-trail-ink',
  ),
)
</script>

<template>
  <p :role="role" :class="classes">
    <slot />
  </p>
</template>
