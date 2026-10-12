<script setup lang="ts">
import { computed } from 'vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import AppHeader from '@/components/layout/AppHeader.vue'

const props = withDefaults(
  defineProps<{
    size?: 'narrow' | 'detail' | 'profile' | 'wide' | 'full'
    spacing?: 'none' | 'compact' | 'default'
  }>(),
  {
    size: 'wide',
    spacing: 'default',
  },
)

const sizeClasses: Record<string, string> = {
  narrow: 'max-w-lg',
  detail: 'max-w-4xl',
  profile: 'max-w-5xl',
  wide: 'max-w-7xl',
  full: '',
}

const spacingClasses: Record<string, string> = {
  none: '',
  compact: 'py-8',
  default: 'py-12',
}

const mainClasses = computed(() =>
  [
    'mx-auto w-full px-4 sm:px-6 lg:px-8',
    'flex-1',
    sizeClasses[props.size],
    spacingClasses[props.spacing],
  ]
    .filter(Boolean)
    .join(' '),
)
</script>

<template>
  <div class="flex min-h-screen flex-col bg-snow text-ink">
    <AppHeader />

    <main :class="mainClasses">
      <slot />
    </main>

    <AppFooter />
  </div>
</template>
