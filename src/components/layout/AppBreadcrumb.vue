<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute, type RouteLocationRaw } from 'vue-router'

interface BreadcrumbItem {
  label: string
  to?: RouteLocationRaw
}

const props = defineProps<{
  /** Sobrescribe las migas derivadas de la ruta (p. ej. con el título de una ruta). */
  items?: BreadcrumbItem[]
}>()

function isBreadcrumbItem(value: unknown): value is BreadcrumbItem {
  if (typeof value !== 'object' || value === null || !('label' in value)) return false
  return typeof value.label === 'string'
}

const route = useRoute()

const items = computed<BreadcrumbItem[]>(() => {
  if (props.items) return props.items

  // En vue-router v5 meta se tipa como unknown: se estrecha en runtime.
  const meta: unknown = route.meta.breadcrumb
  const trail = Array.isArray(meta) ? meta.filter(isBreadcrumbItem) : []

  // La pestaña activa del perfil vive en la URL y también se refleja en las migas.
  if (route.name === 'profile' && route.query.tab === 'my-rides') {
    return [...trail, { label: 'Mis rutas' }]
  }

  return trail
})
</script>

<template>
  <nav v-if="items.length > 0" aria-label="Migas de pan" class="mb-4">
    <ol class="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-graphite">
      <li
        v-for="(item, index) in items"
        :key="`${item.label}-${index}`"
        class="flex items-center gap-1.5"
      >
        <RouterLink
          v-if="item.to"
          :to="item.to"
          class="transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        >
          {{ item.label }}
        </RouterLink>

        <span
          v-else
          :aria-current="index === items.length - 1 ? 'page' : undefined"
          :class="index === items.length - 1 ? 'text-ink' : 'text-graphite'"
        >
          {{ item.label }}
        </span>

        <span v-if="index < items.length - 1" aria-hidden="true" class="text-line-strong">/</span>
      </li>
    </ol>
  </nav>
</template>
