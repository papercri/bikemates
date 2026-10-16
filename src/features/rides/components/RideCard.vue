<script setup lang="ts">
import { computed } from 'vue'
import Badge from '@/components/ui/Badge.vue'
import IconArrow from '@/components/icons/IconArrow.vue'
import ElevationSparkline from '@/features/rides/components/ElevationSparkline.vue'
import { RIDE_LEVEL_BADGE_COLORS } from '@/features/rides/constants/rideLevels'
import { RIDE_BIKE_TYPE_LABELS } from '@/features/rides/constants/rideOptions'
import type { Ride } from '@/features/rides/types'
import { formatRideDate, getRideDateParts } from '@/utils/dates'

const props = defineProps<{
  ride: Ride
}>()

const dateParts = computed(() => getRideDateParts(props.ride.startsAt))
</script>

<template>
  <article class="border-b border-line">
    <RouterLink
      :to="{ name: 'ride-detail', params: { id: ride.id } }"
      class="group grid gap-4 px-2 py-6 transition-colors duration-200 hover:bg-canvas focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-trail sm:px-4 lg:grid-cols-[4.5rem_minmax(0,1fr)_auto] lg:items-start lg:gap-8"
    >
      <!-- Raíl de fecha -->
      <div class="flex items-baseline gap-2 lg:block">
        <span
          class="font-display text-3xl font-extrabold leading-none tracking-tight tabular-nums text-ink lg:text-4xl"
        >
          {{ dateParts.day }}
        </span>
        <span class="text-sm text-graphite lg:mt-1 lg:block">{{ dateParts.month }}</span>
      </div>

      <!-- Entrada -->
      <div class="min-w-0">
        <h2
          class="font-display text-lg font-bold tracking-tight text-ink transition-colors group-hover:text-trail-ink sm:text-xl"
        >
          {{ ride.title }}
        </h2>

        <p class="mt-1 text-sm text-graphite">{{ ride.meetingPoint }}</p>

        <p class="mt-1 text-sm text-graphite">
          <time :datetime="ride.startsAt">{{ formatRideDate(ride.startsAt) }}</time>
        </p>

        <div class="mt-3 flex flex-wrap gap-2">
          <Badge :color="RIDE_LEVEL_BADGE_COLORS[ride.level]" dot>
            {{ ride.level }}
          </Badge>
          <Badge variant="muted">
            {{ RIDE_BIKE_TYPE_LABELS[ride.bikeType] }}
          </Badge>
        </div>
      </div>

      <!-- Cifras de la ruta -->
      <div class="flex items-end gap-7 lg:items-start lg:gap-10">
        <div class="flex items-baseline gap-1">
          <span
            class="font-display text-2xl font-extrabold leading-none tracking-tight tabular-nums text-ink sm:text-3xl"
          >
            {{ ride.distanceKm }}
          </span>
          <span class="text-sm font-semibold text-graphite">km</span>
        </div>

        <div class="flex items-baseline gap-1">
          <span
            class="font-display text-2xl font-extrabold leading-none tracking-tight tabular-nums text-ink sm:text-3xl"
          >
            +{{ ride.elevationM }}
          </span>
          <span class="text-sm font-semibold text-graphite">m</span>
        </div>

        <IconArrow
          class="ml-auto hidden text-graphite transition-transform duration-200 group-hover:translate-x-1 group-hover:text-trail-ink lg:block"
          aria-hidden="true"
        />

        <span class="sr-only">Ver detalles</span>
      </div>
    </RouterLink>

    <div class="px-2 pb-3 sm:px-4" aria-hidden="true">
      <ElevationSparkline
        :distance-km="ride.distanceKm"
        :elevation-m="ride.elevationM"
        class="opacity-50"
      />
    </div>
  </article>
</template>
