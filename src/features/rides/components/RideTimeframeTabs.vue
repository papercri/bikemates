<script setup lang="ts">
import type { RideTimeframe } from '../constants/rideFilters'

defineProps<{
  upcomingCount: number
  pastCount: number
}>()
const timeframe = defineModel<RideTimeframe>({ required: true })

const options = [
  { value: 'upcoming' as const, label: 'Próximas' },
  { value: 'past' as const, label: 'Pasadas' },
] as const
</script>

<template>
  <!-- Dos páginas del listado: cada botón alterna la ventana temporal mostrada. -->
  <div role="group" aria-label="Salidas por fecha" class="flex gap-4 border-b border-line">
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      :aria-pressed="timeframe === option.value"
      class="-mb-px border-b-2 px-1 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-trail"
      :class="
        timeframe === option.value
          ? 'border-trail text-ink'
          : 'border-transparent text-graphite hover:text-ink'
      "
      @click="timeframe = option.value"
    >
      {{ option.label }}
      <span class="tabular-nums text-graphite">
        ({{ option.value === 'upcoming' ? upcomingCount : pastCount }})
      </span>
    </button>
  </div>
</template>
