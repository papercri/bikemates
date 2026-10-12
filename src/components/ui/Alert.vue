<script setup lang="ts">
import { computed } from 'vue'
import type { AlertVariant } from '@/design-system'

const props = withDefaults(
  defineProps<{
    variant?: AlertVariant
  }>(),
  {
    variant: 'error',
  },
)

const role = computed(() => (props.variant === 'error' ? 'alert' : 'status'))

const classes = computed(() =>
  props.variant === 'error' ? 'text-sm text-red-600' : 'text-sm text-trail-ink',
)
</script>

<template>
  <p :role="role" :class="classes">
    <slot />
  </p>
</template>
