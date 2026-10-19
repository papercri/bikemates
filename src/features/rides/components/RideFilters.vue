<script setup lang="ts">
import { computed, ref } from 'vue'
import { faMagnifyingGlass, faSliders } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import FormSelectField from '@/components/ui/FormSelectField.vue'
import Input from '@/components/ui/Input.vue'
import {
  RIDE_AUDIENCE_FILTER_OPTIONS,
  RIDE_BIKE_FILTER_OPTIONS,
  RIDE_FILTER_ALL,
  RIDE_LEVEL_FILTER_OPTIONS,
  RIDE_SORT_OPTIONS,
  type RideAudienceFilter,
  type RideBikeFilter,
  type RideLevelFilter,
  type RideSortOption,
} from '@/features/rides/constants/rideFilters'

const query = defineModel<string>('query', { required: true })
const level = defineModel<RideLevelFilter>('level', { required: true })
const bike = defineModel<RideBikeFilter>('bike', { required: true })
const audience = defineModel<RideAudienceFilter>('audience', { required: true })
const sort = defineModel<RideSortOption>('sort', { required: true })

/** En móvil los controles se pliegan detrás del botón; en sm+ permanecen visibles. */
const isExpanded = ref(false)

const activeFilterCount = computed(() => {
  let count = 0
  if (query.value.trim() !== '') count += 1
  if (level.value !== RIDE_FILTER_ALL) count += 1
  if (bike.value !== RIDE_FILTER_ALL) count += 1
  if (audience.value !== RIDE_FILTER_ALL) count += 1
  if (sort.value !== 'date') count += 1
  return count
})
</script>

<template>
  <div>
    <!-- Botón de filtros en móvil: circular, a la izquierda y sticky bajo la header. -->
    <button
      type="button"
      class="sticky top-[4.5rem] z-30 flex size-10 items-center justify-center rounded-full shadow-card transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink sm:hidden"
      :class="
        isExpanded ? 'bg-trail-ink text-canvas' : 'bg-canvas/90 text-ink backdrop-blur-sm hover:bg-snow'
      "
      :aria-expanded="isExpanded"
      aria-controls="ride-filters-panel"
      @click="isExpanded = !isExpanded"
    >
      <span class="sr-only">Filtros</span>
      <FontAwesomeIcon :icon="faSliders" aria-hidden="true" class="size-4" />

      <span
        v-if="activeFilterCount > 0"
        class="absolute -top-0.5 -right-0.5 flex min-w-4 items-center justify-center rounded-full px-0.5 font-mono text-[0.6rem] font-semibold tabular-nums"
        :class="isExpanded ? 'bg-canvas text-ink' : 'bg-trail text-ink'"
        aria-hidden="true"
      >
        {{ activeFilterCount }}
      </span>
      <span v-if="activeFilterCount > 0" class="sr-only">
        ({{ activeFilterCount }} {{ activeFilterCount === 1 ? 'activo' : 'activos' }})
      </span>
    </button>

    <!-- Sin labels visibles: el significado vive en el placeholder de cada control. -->
    <div
      id="ride-filters-panel"
      class="mt-2 grid-cols-2 gap-2 [&_input]:text-sm [&_select]:text-sm sm:mt-0 sm:flex sm:items-center sm:gap-2"
      :class="isExpanded ? 'grid' : 'hidden'"
    >
      <div class="relative col-span-2 sm:w-56">
        <label for="ride-title-search" class="sr-only"> Buscar por título </label>

        <FontAwesomeIcon
          :icon="faMagnifyingGlass"
          aria-hidden="true"
          class="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-graphite"
        />

        <Input
          id="ride-title-search"
          v-model="query"
          type="search"
          name="ride-title-search"
          class="pl-9"
        />
      </div>

      <FormSelectField
        id="ride-level-filter"
        v-model="level"
        class="sm:w-44"
        label="Nivel"
        label-hidden
        :options="RIDE_LEVEL_FILTER_OPTIONS"
      />

      <FormSelectField
        id="ride-bike-filter"
        v-model="bike"
        class="sm:w-44"
        label="Tipo de bici"
        label-hidden
        :options="RIDE_BIKE_FILTER_OPTIONS"
      />

      <FormSelectField
        id="ride-audience-filter"
        v-model="audience"
        class="sm:w-44"
        label="Público"
        label-hidden
        :options="RIDE_AUDIENCE_FILTER_OPTIONS"
      />

      <FormSelectField
        id="ride-sort-filter"
        v-model="sort"
        class="col-span-2 sm:w-40"
        label="Ordenar"
        label-hidden
        :options="RIDE_SORT_OPTIONS"
      />
    </div>
  </div>
</template>
