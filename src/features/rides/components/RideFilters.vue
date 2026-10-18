<script setup lang="ts">
import { computed, ref } from 'vue'
import { faSliders } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import FormSelectField from '@/components/ui/FormSelectField.vue'
import Input from '@/components/ui/Input.vue'
import {
  RIDE_AUDIENCE_FILTER_OPTIONS,
  RIDE_FILTER_ALL,
  RIDE_LEVEL_FILTER_OPTIONS,
  RIDE_SORT_OPTIONS,
  type RideAudienceFilter,
  type RideLevelFilter,
  type RideSortOption,
} from '@/features/rides/constants/rideFilters'

const query = defineModel<string>('query', { required: true })
const level = defineModel<RideLevelFilter>('level', { required: true })
const audience = defineModel<RideAudienceFilter>('audience', { required: true })
const sort = defineModel<RideSortOption>('sort', { required: true })

/** En móvil los controles se pliegan detrás del botón; en sm+ permanecen visibles. */
const isExpanded = ref(false)

const activeFilterCount = computed(() => {
  let count = 0
  if (query.value.trim() !== '') count += 1
  if (level.value !== RIDE_FILTER_ALL) count += 1
  if (audience.value !== RIDE_FILTER_ALL) count += 1
  if (sort.value !== 'date') count += 1
  return count
})
</script>

<template>
  <div>
    <button
      type="button"
      class="flex w-full items-center justify-center gap-2 rounded-btn border border-ink bg-white px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-snow focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink sm:hidden"
      :aria-expanded="isExpanded"
      aria-controls="ride-filters-panel"
      @click="isExpanded = !isExpanded"
    >
      <FontAwesomeIcon :icon="faSliders" aria-hidden="true" class="size-4" />
      Filtros
      <span
        v-if="activeFilterCount > 0"
        class="inline-flex size-5 items-center justify-center rounded-full bg-ink font-mono text-[0.65rem] font-semibold text-canvas tabular-nums"
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
      class="grid-cols-2 gap-2 [&_input]:text-sm [&_select]:text-sm sm:flex sm:items-center sm:gap-2"
      :class="isExpanded ? 'grid' : 'hidden'"
    >
      <div class="col-span-2 sm:w-44">
        <label for="ride-title-search" class="sr-only"> Buscar por título </label>

        <Input
          id="ride-title-search"
          v-model="query"
          type="search"
          name="ride-title-search"
          placeholder="Buscar por título"
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
