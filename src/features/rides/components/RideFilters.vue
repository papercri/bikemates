<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  faArrowDownWideShort,
  faBicycle,
  faGaugeHigh,
  faMagnifyingGlass,
  faSliders,
  faUser,
  faUsers,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import Input from '@/components/ui/Input.vue'
import SelectMenu from '@/components/ui/SelectMenu.vue'
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
const participating = defineModel<boolean>('participating', { default: false })

/** Solo se ofrece el filtro de participación a quienes tienen sesión. */
const props = withDefaults(defineProps<{ showParticipation?: boolean }>(), {
  showParticipation: false,
})

/** En móvil los controles se pliegan detrás del botón; en sm+ permanecen visibles. */
const isExpanded = ref(false)

const activeFilterCount = computed(() => {
  let count = 0
  if (query.value.trim() !== '') count += 1
  if (level.value !== RIDE_FILTER_ALL) count += 1
  if (bike.value !== RIDE_FILTER_ALL) count += 1
  if (audience.value !== RIDE_FILTER_ALL) count += 1
  if (sort.value !== 'default') count += 1
  if (props.showParticipation && participating.value) count += 1
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
        isExpanded
          ? 'bg-trail-ink text-canvas'
          : 'bg-canvas/90 text-ink backdrop-blur-sm hover:bg-snow'
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

    <!-- En móvil los controles se pliegan en rejilla; en sm+ se alinean en fila y en
         desktop se estiran para ocupar todo el ancho disponible. -->
    <div
      id="ride-filters-panel"
      class="mt-2 grid-cols-2 gap-2 [&_input]:text-sm sm:mt-0 sm:flex sm:items-center sm:gap-2"
      :class="isExpanded ? 'grid' : 'hidden'"
    >
      <div class="relative col-span-2 sm:w-56 lg:flex-1 lg:min-w-0">
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

      <SelectMenu
        v-model="level"
        class="min-w-0 sm:w-44 lg:flex-1 lg:min-w-0"
        label="Nivel"
        :icon="faGaugeHigh"
        :options="RIDE_LEVEL_FILTER_OPTIONS"
      />

      <SelectMenu
        v-model="bike"
        class="min-w-0 sm:w-44 lg:flex-1 lg:min-w-0"
        label="Tipo de bici"
        :icon="faBicycle"
        :options="RIDE_BIKE_FILTER_OPTIONS"
      />

      <SelectMenu
        v-model="audience"
        class="min-w-0 sm:w-44 lg:flex-1 lg:min-w-0"
        label="Público"
        :icon="faUsers"
        :options="RIDE_AUDIENCE_FILTER_OPTIONS"
      />

      <SelectMenu
        v-model="sort"
        class="min-w-0 sm:w-44 lg:flex-1 lg:min-w-0"
        label="Ordenar por"
        :icon="faArrowDownWideShort"
        :options="RIDE_SORT_OPTIONS"
      />

      <!-- Interrupción "Voy": solo icono, gris en reposo y verde al activarse. -->
      <div v-if="showParticipation" class="col-span-2 flex items-center sm:col-span-1">
        <button
          type="button"
          class="group relative inline-flex size-9 items-center justify-center rounded-full border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          :class="
            participating
              ? 'border-trail bg-trail/15 text-trail-ink'
              : 'border-line-strong bg-white text-graphite hover:border-graphite hover:bg-snow'
          "
          :aria-pressed="participating"
          aria-label="Voy"
          @click="participating = !participating"
        >
          <FontAwesomeIcon :icon="faUser" aria-hidden="true" class="size-4" />

          <span
            role="tooltip"
            class="pointer-events-none absolute -top-8 left-1/2 z-10 -translate-x-1/2 rounded-btn bg-ink px-2 py-1 text-xs font-medium whitespace-nowrap text-canvas opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
          >
            Voy
          </span>
        </button>
      </div>
    </div>
  </div>
</template>
