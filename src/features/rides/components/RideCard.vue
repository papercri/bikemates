<script setup lang="ts">
import { computed } from 'vue'
import Badge from '@/components/ui/Badge.vue'
import IconArrow from '@/components/icons/IconArrow.vue'
import ElevationSparkline from '@/features/rides/components/ElevationSparkline.vue'
import RideAudienceBadge from '@/features/rides/components/RideAudienceBadge.vue'
import { RIDE_LEVEL_BADGE_COLORS } from '@/features/rides/constants/rideLevels'
import { RIDE_BIKE_TYPE_LABELS } from '@/features/rides/constants/rideOptions'
import type { Ride } from '@/features/rides/types'
import { formatRideDate, getRideDateParts } from '@/utils/dates'

const props = defineProps<{
  ride: Ride
  /** La salida ya se celebró: se atenúa el contraste frente a las próximas rutas. */
  past?: boolean
}>()

const dateParts = computed(() => getRideDateParts(props.ride.startsAt))

// En salidas pasadas la cifra grande y el título bajan de contraste sin perder legibilidad.
const dayClasses = computed(() => (props.past ? 'text-graphite' : 'text-ink'))

const titleClasses = computed(() =>
  props.past ? 'text-graphite group-hover:text-trail-ink' : 'text-ink group-hover:text-trail-ink',
)

const figureClasses = computed(() => (props.past ? 'text-graphite' : 'text-ink'))
</script>

<template>
  <article class="border-b border-line">
    <RouterLink
      :to="{ name: 'ride-detail', params: { id: ride.id } }"
      class="group grid gap-3 px-2 py-4 transition-colors duration-200 hover:bg-canvas focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-trail sm:px-4 lg:grid-cols-[4rem_minmax(0,1fr)_auto] lg:items-start lg:gap-6"
    >
      <!-- Raíl de fecha -->
      <div class="flex items-baseline gap-2 lg:block">
        <span
          class="font-display text-2xl font-extrabold leading-none tracking-tight tabular-nums lg:text-3xl"
          :class="dayClasses"
        >
          {{ dateParts.day }}
        </span>
        <span class="text-sm text-graphite lg:mt-0.5 lg:block">{{ dateParts.month }}</span>
      </div>

      <!-- Entrada -->
      <div class="min-w-0">
        <h2
          class="font-display text-base font-bold tracking-tight transition-colors sm:text-lg"
          :class="titleClasses"
        >
          {{ ride.title }}
        </h2>

        <p class="mt-0.5 text-sm text-graphite">{{ ride.meetingPoint }}</p>

        <p class="text-sm text-graphite">
          <time :datetime="ride.startsAt">{{ formatRideDate(ride.startsAt) }}</time>
        </p>

        <div class="mt-2 flex flex-wrap gap-1.5">
          <Badge :color="RIDE_LEVEL_BADGE_COLORS[ride.level]" dot>
            {{ ride.level }}
          </Badge>
          <Badge variant="muted">
            {{ RIDE_BIKE_TYPE_LABELS[ride.bikeType] }}
          </Badge>
          <RideAudienceBadge :audience="ride.audience" />
        </div>
      </div>

      <!-- Cifras de la ruta -->
      <div class="flex items-end gap-5 lg:items-start lg:gap-8">
        <div class="flex items-baseline gap-1">
          <span
            class="font-display text-xl font-extrabold leading-none tracking-tight tabular-nums sm:text-2xl"
            :class="figureClasses"
          >
            {{ ride.distanceKm }}
          </span>
          <span class="text-xs font-semibold text-graphite">km</span>
        </div>

        <div class="flex items-baseline gap-1">
          <span
            class="font-display text-xl font-extrabold leading-none tracking-tight tabular-nums sm:text-2xl"
            :class="figureClasses"
          >
            +{{ ride.elevationM }}
          </span>
          <span class="text-xs font-semibold text-graphite">m</span>
        </div>

        <IconArrow
          class="ml-auto hidden text-graphite transition-transform duration-200 group-hover:translate-x-1 group-hover:text-trail-ink lg:block"
          aria-hidden="true"
        />

        <span class="sr-only">Ver detalles</span>
      </div>
    </RouterLink>

    <div class="px-2 pb-2 sm:px-4" aria-hidden="true">
      <ElevationSparkline
        :distance-km="ride.distanceKm"
        :elevation-m="ride.elevationM"
        :class="past ? 'opacity-30' : 'opacity-50'"
      />
    </div>
  </article>
</template>
