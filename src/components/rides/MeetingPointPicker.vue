
<script setup lang="ts">
import { onUnmounted, ref, watch } from 'vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import FormLabel from '@/components/forms/FormLabel.vue'
import { searchPlaces } from '@/features/rides/services/geocodingService'
import type { GeocodingResult } from '@/features/rides/services/geocodingService'

const emit = defineEmits<{
  (event: 'select', place: GeocodingResult | null): void
}>()

const query = ref('')
const results = ref<GeocodingResult[]>([])
const selectedPlace = ref<GeocodingResult | null>(null)
const isLoading = ref(false)
const errorMessage = ref<string | null>(null)

let controller: AbortController | null = null

watch(query, (newQuery) => {
  // No borrar la selección cuando el propio componente
  // actualiza el campo al seleccionar un resultado.
  if (selectedPlace.value?.label === newQuery) return

  controller?.abort()
  selectedPlace.value = null
  results.value = []
  errorMessage.value = null
  emit('select', null)
})

async function handleSearch(): Promise<void> {
  const searchTerm = query.value.trim()

  if (isLoading.value || searchTerm.length < 3) return

  controller?.abort()
  const searchController = new AbortController()
  controller = searchController

  isLoading.value = true
  errorMessage.value = null
  results.value = []

  try {
    const places = await searchPlaces(searchTerm, searchController.signal)

    // Ignorar resultados de búsquedas canceladas o antiguas.
    if (searchController.signal.aborted) return

    results.value = places

    if (places.length === 0) {
      errorMessage.value = 'No se han encontrado lugares.'
    }
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      error.name === 'AbortError'
    ) {
      return
    }

    errorMessage.value =
      error instanceof Error
        ? error.message
        : 'No se ha podido buscar el lugar.'
  } finally {
    if (controller === searchController) {
      isLoading.value = false
      controller = null
    }
  }
}

function selectPlace(place: GeocodingResult): void {
  selectedPlace.value = place
  query.value = place.label
  results.value = []
  errorMessage.value = null
  emit('select', place)
}

onUnmounted(() => {
  controller?.abort()
})
</script>

<template>
  <section class="space-y-2">
    <FormLabel id="meeting-point-search">
      Punto de encuentro
    </FormLabel>

    <div class="flex items-start gap-2">
      <div class="min-w-0 flex-1">
        <Input
          id="meeting-point-search"
          v-model="query"
          type="search"
          name="meetingPointSearch"
          placeholder="Ej. Monistrol de Montserrat"
          autocomplete="off"
          :aria-invalid="Boolean(errorMessage)"
          aria-describedby="meeting-point-help"
        />
      </div>

      <Button
        type="button"
        variant="primary"
        size="md"
        :disabled="isLoading || query.trim().length < 3"
        :loading="isLoading"
        @click="handleSearch"
      >
        {{ isLoading ? 'Buscando…' : 'Buscar' }}
      </Button>
    </div>

    <p id="meeting-point-help" class="text-xs text-graphite">
      Busca un lugar y selecciona un resultado para guardar sus coordenadas.
    </p>

    <p
      v-if="errorMessage"
      role="status"
      class="text-sm text-red-700"
    >
      {{ errorMessage }}
    </p>

    <ul
      v-if="results.length"
      aria-label="Resultados de lugares"
      class="divide-y divide-line overflow-hidden rounded-xl border border-line bg-canvas"
    >
      <li v-for="place in results" :key="place.id">
        <button
          type="button"
          class="w-full px-3 py-2.5 text-left text-sm text-ink transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-trail"
          @click="selectPlace(place)"
        >
          {{ place.label }}
        </button>
      </li>
    </ul>

    <div
      v-if="selectedPlace"
      role="status"
      class="rounded-xl border border-trail/30 bg-trail/5 p-3"
    >
      <p class="text-sm font-semibold text-ink">
        Lugar seleccionado
      </p>
      <p class="mt-1 text-sm text-ink">
        {{ selectedPlace.label }}
      </p>
      <p class="mt-1 font-mono text-xs text-graphite">
        {{ selectedPlace.latitude.toFixed(5) }},
        {{ selectedPlace.longitude.toFixed(5) }}
      </p>
    </div>

    <p class="text-xs text-graphite">
      Datos geográficos © OpenStreetMap contributors.
    </p>
  </section>
</template>
