<script setup lang="ts">
import FormLabel from '@/components/ui/FormLabel.vue'
import FormSelectField from '@/components/ui/FormSelectField.vue'
import Input from '@/components/ui/Input.vue'
import {
  RIDE_AUDIENCE_FILTER_OPTIONS,
  RIDE_LEVEL_FILTER_OPTIONS,
  type RideAudienceFilter,
  type RideLevelFilter,
} from '@/features/rides/constants/rideFilters'

const query = defineModel<string>('query', { required: true })
const level = defineModel<RideLevelFilter>('level', { required: true })
const audience = defineModel<RideAudienceFilter>('audience', { required: true })
</script>

<template>
  <div class="flex flex-col gap-3 sm:flex-row sm:items-end">
    <div class="min-w-0 flex-1 [&_input]:py-2.5 [&_input]:pl-3 [&_input]:pr-3 [&_input]:text-sm">
      <FormLabel
        id="ride-title-search"
        :margin="false"
        class="mb-1.5 text-xs font-semibold text-graphite"
      >
        Buscar
      </FormLabel>

      <Input
        id="ride-title-search"
        v-model="query"
        type="search"
        name="ride-title-search"
        placeholder="Título de la ruta"
      />
    </div>

    <FormSelectField
      id="ride-level-filter"
      v-model="level"
      class="sm:w-40"
      label="Nivel"
      :options="RIDE_LEVEL_FILTER_OPTIONS"
    />

    <FormSelectField
      id="ride-audience-filter"
      v-model="audience"
      class="sm:w-56"
      label="Público"
      :options="RIDE_AUDIENCE_FILTER_OPTIONS"
    />
  </div>
</template>
