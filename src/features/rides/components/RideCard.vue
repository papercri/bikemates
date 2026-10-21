<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { faBicycle, faCalendar, faUser } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import Badge from '@/components/ui/Badge.vue'
import IconArrow from '@/components/icons/IconArrow.vue'
import IconHeart from '@/components/icons/IconHeart.vue'
import RideAudienceBadge from '@/features/rides/components/RideAudienceBadge.vue'
import { RIDE_LEVEL_BADGE_COLORS } from '@/features/rides/constants/rideLevels'
import { RIDE_BIKE_TYPE_LABELS } from '@/features/rides/constants/rideOptions'
import type { Ride } from '@/features/rides/types'
import { formatRideShortDate } from '@/utils/dates'

const props = defineProps<{
  ride: Ride
  /** La salida ya se celebró: se atenúa el contraste frente a las próximas rutas. */
  past?: boolean
  /** Sin borde ni redondeado: la tarjeta se integra en un contenedor propio. */
  bare?: boolean
  /** El usuario actual participa en esta salida: muestra la insignia "Participaré". */
  participating?: boolean
  /** La ruta está en favoritos del usuario actual. */
  saved?: boolean
  /** Muestra el botón de favoritos (solo donde el gestor de guardados está disponible). */
  showSaveToggle?: boolean
}>()

const emit = defineEmits<{
  'toggle-save': []
}>()

/** Confirmación efímera tras guardar: desaparece sola y respeta movimiento reducido. */
const showSavedToast = ref(false)
let toastTimer: ReturnType<typeof setTimeout> | undefined

watch(
  () => props.saved,
  (saved, previous) => {
    if (saved === previous || !saved) return

    showSavedToast.value = true
    clearTimeout(toastTimer)
    toastTimer = setTimeout(() => {
      showSavedToast.value = false
    }, 2000)
  },
)


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

/** Fecha corta `dd/MM` para el raíl superior de la tarjeta. */
const shortDate = computed(() => formatRideShortDate(props.ride.startsAt))
</script>

<template>
  <article
    class="relative h-full overflow-hidden sm:aspect-square"
    :class="[props.bare ? '' : 'rounded-photo border border-line', past ? 'opacity-75' : '']"
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

      <!-- Raíl de fecha + insignia de participación: degradado oscuro solo detrás del raíl. -->
      <div
        class="relative flex items-start justify-between gap-3 bg-gradient-to-b from-ink/70 via-ink/30 to-transparent p-4 sm:p-5"
      >
        <!-- Raíl de fecha: fecha compacta `dd/MM` con fecha legible para lectores de pantalla. -->
        <time
          :datetime="ride.startsAt"
          class="inline-flex items-center gap-1 rounded-full bg-ink px-2 py-0.5 font-mono text-[0.7rem] font-semibold tabular-nums text-canvas"
        >
          <FontAwesomeIcon :icon="faCalendar" aria-hidden="true" class="size-3" />
          {{ shortDate }}
        </time>
      </div>

      <!-- Entrada: capa oscura a sangre, pegada a los bordes de la foto -->
      <div
        class="relative bg-ink/70 pt-3 pb-4 [padding-inline:calc(var(--spacing)*3)] sm:pt-3.5 sm:pb-5"
      >
        <!-- Reserva exactamente dos líneas: todas las tarjetas alinean el bloque de
             título por igual aunque el texto ocupe una sola línea. -->
        <h2
          class="line-clamp-2 min-h-[2lh] font-display text-lg leading-[1.15] font-medium tracking-[-0.01em] text-canvas sm:text-xl"
        >
          {{ ride.title }}
        </h2>

        <div class="mt-3 flex flex-wrap items-center gap-1.5">
          <Badge variant="inverse" :color="RIDE_LEVEL_BADGE_COLORS[ride.level]" dot>
            {{ ride.level }}
          </Badge>
          <Badge variant="inverse">
            <FontAwesomeIcon :icon="faBicycle" aria-hidden="true" class="size-3" />
            {{ RIDE_BIKE_TYPE_LABELS[ride.bikeType] }}
          </Badge>
          <RideAudienceBadge :audience="ride.audience" variant="inverse" icon-only />

          <IconArrow
            class="ml-auto text-canvas/75 transition-transform duration-200 group-hover:translate-x-1"
            aria-hidden="true"
          />

          <span class="sr-only">Ver detalles</span>
        </div>
      </div>

      <!-- Confirmación efímera al activar favoritos. -->
      <Transition
        enter-active-class="motion-safe:transition-all motion-safe:duration-200"
        enter-from-class="translate-y-1 opacity-0"
        leave-active-class="motion-safe:transition-all motion-safe:duration-300"
        leave-to-class="opacity-0"
      >
        <p
          v-if="showSavedToast"
          class="pointer-events-none absolute bottom-20 left-1/2 z-10 -translate-x-1/2 rounded-full bg-ink/90 px-3 py-1 text-xs font-semibold whitespace-nowrap text-canvas"
          role="status"
        >
          <IconHeart filled class="me-1 inline-block size-3 text-red-500" />
          Agregado a tus favoritos
        </p>
      </Transition>
    </RouterLink>

    <!-- Pila de acciones fuera del enlace: un <button> dentro de un <a> no es HTML válido.
         Corazón de favoritos arriba; debajo, el círculo de participación. -->
    <div
      v-if="showSaveToggle || participating"
      class="absolute top-3.5 right-3.5 z-10 flex flex-col items-end gap-1.5 sm:top-4.5 sm:right-4.5"
    >
      <button
        v-if="showSaveToggle"
        type="button"
        class="flex size-7 items-center justify-center rounded-full bg-ink/70 text-canvas transition-colors hover:bg-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
        :aria-pressed="saved ?? false"
        :aria-label="saved ? 'Quitar de favoritos' : 'Agregar a favoritos'"
        @click.stop.prevent="emit('toggle-save')"
      >
        <IconHeart :filled="saved" class="size-3.5" :class="saved ? 'text-red-500' : 'text-canvas'" />
      </button>

      <span
        v-if="participating"
        class="flex size-7 items-center justify-center rounded-full bg-ink/70 text-trail"
      >
        <FontAwesomeIcon :icon="faUser" aria-hidden="true" class="size-3" />
        <span class="sr-only">Participaré</span>
      </span>
    </div>
  </article>
</template>
