<script setup lang="ts">
import FormSelectField from '@/components/ui/FormSelectField.vue'
import Input from '@/components/ui/Input.vue'
import {
  RIDE_AUDIENCE_FILTER_OPTIONS,
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
</script>

<template>
  <!-- Sin labels visibles: el significado vive en el placeholder de cada control. -->
  <div
    class="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-2 [&_input]:text-sm [&_select]:text-sm"
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
</template>
