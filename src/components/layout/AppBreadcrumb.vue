<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute, type RouteLocationRaw } from 'vue-router'

export interface BreadcrumbItem {
  label: string
  to?: RouteLocationRaw
}

const props = defineProps<{
  /** Sobrescribe las migas derivadas de la ruta (p. ej. con el título de una ruta). */
  items?: BreadcrumbItem[]
}>()

const route = useRoute()

const items = computed<BreadcrumbItem[]>(() => {
  if (props.items) return props.items

  const meta = route.meta.breadcrumb
  if (!meta) return []

  // La pestaña activa del perfil vive en la URL y también se refleja en las migas.
  if (route.name === 'profile' && route.query.tab === 'my-rides') {
    return [...meta, { label: 'Mis rutas' }]
  }

  return [...meta]
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

        <span v-else aria-current="page" class="text-ink">
          {{ item.label }}
        </span>

        <span v-if="index < items.length - 1" aria-hidden="true" class="text-line-strong">/</span>
      </li>
    </ol>
  </nav>
</template>
