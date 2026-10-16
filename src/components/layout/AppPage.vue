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
    <a
      href="#main-content"
      class="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-btn focus:bg-ink focus:px-4 focus:py-3 focus:text-sm focus:font-semibold focus:text-canvas"
    >
      Saltar al contenido
    </a>

    <AppHeader />

    <main id="main-content" :class="mainClasses">
      <slot />
    </main>

    <AppFooter />
  </div>
</template>
