<script setup lang="ts">
import { watch } from 'vue'
import Button from '@/components/ui/Button.vue'
import FormHelp from '@/components/ui/FormHelp.vue'
import FormLabel from '@/components/ui/FormLabel.vue'
import Input from '@/components/ui/Input.vue'
import { usePlaceSearch } from '@/features/rides/composables/usePlaceSearch'
import type { GeocodingResult } from '@/features/rides/services/geocodingService'

const props = defineProps<{
  initialValue?: string
}>()

const emit = defineEmits<{
  (event: 'select', place: GeocodingResult | null): void
}>()

const {
  query,
  results,
  selectedPlace,
  isLoading,
  errorMessage,
  search,
  selectPlace,
  resetSelection,
} = usePlaceSearch(props.initialValue ?? '')

// Al editar la búsqueda a mano se descarta la selección anterior
// y se avisa al formulario para que limpie las coordenadas.
watch(query, (newQuery) => {
  if (newQuery === props.initialValue && !selectedPlace.value) return

  if (selectedPlace.value?.label === newQuery) return

  resetSelection()
  emit('select', null)
})

function handleSelectPlace(place: GeocodingResult): void {
  selectPlace(place)
  emit('select', place)
}
</script>

<template>
  <section class="space-y-2">
    <FormLabel id="meeting-point-search"> Punto de encuentro </FormLabel>

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
        @click="search"
      >
        {{ isLoading ? 'Buscando…' : 'Buscar' }}
      </Button>
    </div>

    <FormHelp id="meeting-point-help">
      Busca un lugar y selecciona un resultado para guardar sus coordenadas.
    </FormHelp>

    <p v-if="errorMessage" role="alert" class="text-sm text-red-700">
      {{ errorMessage }}
    </p>

    <ul
      v-if="results.length"
      aria-label="Resultados de lugares"
      class="divide-y divide-line overflow-hidden rounded-card border border-line bg-white"
    >
      <li v-for="place in results" :key="place.id">
        <button
          type="button"
          class="w-full px-3 py-2.5 text-left text-sm text-ink transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ink/60"
          @click="handleSelectPlace(place)"
        >
          {{ place.label }}
        </button>
      </li>
    </ul>

    <div
      v-if="selectedPlace"
      role="status"
      class="rounded-card border border-line bg-trail/10 p-3"
    >
      <p class="text-sm font-semibold text-ink">Lugar seleccionado</p>
      <p class="mt-1 text-sm text-ink">
        {{ selectedPlace.label }}
      </p>
      <p class="mt-1 font-mono text-xs text-graphite">
        {{ selectedPlace.latitude.toFixed(5) }},
        {{ selectedPlace.longitude.toFixed(5) }}
      </p>
    </div>

    <p class="text-xs text-graphite">Datos geográficos © OpenStreetMap contributors.</p>
  </section>
</template>
