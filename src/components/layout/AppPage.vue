<script setup lang="ts">
import { computed } from 'vue'
import AppBreadcrumb, { type BreadcrumbItem } from '@/components/layout/AppBreadcrumb.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import AppHeader from '@/components/layout/AppHeader.vue'

const props = withDefaults(
  defineProps<{
    /** Ancho de viewport sin contenedor, reservado a bandas a sangre (landing). */
    bleed?: boolean
    spacing?: 'none' | 'compact' | 'default'
    /** Migas propias de la vista; si faltan se usan las de la meta de la ruta. */
    breadcrumb?: BreadcrumbItem[]
  }>(),
  {
    bleed: false,
    spacing: 'default',
  },
)

const spacingClasses: Record<string, string> = {
  none: '',
  compact: 'py-8',
  default: 'py-12',
}

const mainClasses = computed(() =>
  [
    // Mismo contenedor que el header y el footer en todas las páginas.
    props.bleed ? 'w-full px-4 sm:px-6 lg:px-8' : 'mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8',
    'flex-1',
    spacingClasses[props.spacing],
  ]
    .filter(Boolean)
    .join(' '),
)
</script>

<template>
  <div class="flex min-h-screen flex-col bg-canvas text-ink">
    <a
      href="#main-content"
      class="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-btn focus:bg-ink focus:px-4 focus:py-3 focus:text-sm focus:font-semibold focus:text-canvas"
    >
      Saltar al contenido
    </a>

    <AppHeader />

    <main id="main-content" :class="mainClasses">
      <AppBreadcrumb :items="breadcrumb" />
      <slot />
    </main>

    <AppFooter />
  </div>
</template>
