<script setup lang="ts">
import { computed } from 'vue'
import Badge from '@/components/ui/Badge.vue'
import IconArrow from '@/components/icons/IconArrow.vue'
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

/** Fotografías propias del proyecto para las salidas sin imagen en la base de datos. */
const FALLBACK_COVERS = [
  '/photos/grupeta-camino.webp',
  '/photos/grupeta-sepia.webp',
  '/photos/hero-bosque.webp',
]

function pickFallbackCover(rideId: string): string {
  const hash = [...rideId].reduce((total, char) => total + char.charCodeAt(0), 0)
  return FALLBACK_COVERS[hash % FALLBACK_COVERS.length] ?? '/photos/grupeta-camino.webp'
}

const cover = computed(() => props.ride.imageUrl ?? pickFallbackCover(props.ride.id))

const dateParts = computed(() => getRideDateParts(props.ride.startsAt))
</script>

<template>
  <article
    class="h-full overflow-hidden rounded-photo border border-line sm:aspect-square"
    :class="past ? 'opacity-75' : ''"
  >
    <RouterLink
      :to="{ name: 'ride-detail', params: { id: ride.id } }"
      class="group relative flex h-full min-h-[16rem] flex-col justify-between gap-4 bg-ink focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-trail"
    >
      <img
        :src="cover"
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
        class="absolute inset-0 h-full w-full object-cover transition-transform duration-500 motion-safe:group-hover:scale-[1.03]"
      />
      <div class="absolute inset-0 bg-ink/60" aria-hidden="true" />

      <!-- Raíl de fecha + cifras -->
      <div class="relative flex items-start justify-between gap-3 p-4 sm:p-5">
        <span
          class="rounded-full bg-canvas px-2.5 py-1 font-mono text-xs font-semibold tracking-[0.08em] text-ink uppercase tabular-nums"
        >
          {{ dateParts.day }} {{ dateParts.month }}
        </span>

        <div class="flex items-baseline gap-4 text-canvas">
          <span class="flex items-baseline gap-1">
            <span class="font-display text-xl font-semibold tabular-nums">
              {{ ride.distanceKm }}
            </span>
            <span class="text-xs font-semibold text-canvas/80">km</span>
          </span>
          <span class="flex items-baseline gap-1">
            <span class="font-display text-xl font-semibold tabular-nums">
              +{{ ride.elevationM }}
            </span>
            <span class="text-xs font-semibold text-canvas/80">m</span>
          </span>
        </div>
      </div>

      <!-- Entrada: capa oscura a sangre, pegada a los bordes de la foto -->
      <div class="relative bg-ink/55 px-4 pt-3 pb-4 sm:px-5 sm:pt-3.5 sm:pb-5">
        <h2
          class="line-clamp-2 font-display text-lg leading-[1.15] font-medium tracking-[-0.01em] text-canvas sm:text-xl"
        >
          {{ ride.title }}
        </h2>

        <p class="mt-1 text-sm text-canvas/85">
          <time :datetime="ride.startsAt">{{ formatRideDate(ride.startsAt) }}</time>
        </p>

        <div class="mt-3 flex flex-wrap items-center gap-1.5">
          <Badge variant="inverse" :color="RIDE_LEVEL_BADGE_COLORS[ride.level]" dot>
            {{ ride.level }}
          </Badge>
          <Badge variant="inverse">{{ RIDE_BIKE_TYPE_LABELS[ride.bikeType] }}</Badge>
          <RideAudienceBadge :audience="ride.audience" variant="inverse" />

          <IconArrow
            class="ml-auto text-canvas/75 transition-transform duration-200 group-hover:translate-x-1"
            aria-hidden="true"
          />

          <span class="sr-only">Ver detalles</span>
        </div>
      </div>
    </RouterLink>
  </article>
</template>
