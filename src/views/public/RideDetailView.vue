<script setup lang="ts">
import { faCalendarPlus, faClock, faMap, faShareNodes } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { useHead } from '@unhead/vue'
import { computed, onBeforeUnmount, ref } from 'vue'
import { useRoute } from 'vue-router'
import AppBackBar from '@/components/layout/AppBackBar.vue'
import type { BreadcrumbItem } from '@/components/layout/AppBreadcrumb.vue'
import AppPage from '@/components/layout/AppPage.vue'
import Badge from '@/components/ui/Badge.vue'
import BikeLoader from '@/components/ui/BikeLoader.vue'
import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import Typography from '@/components/ui/Typography.vue'
import { useAuthStore } from '@/features/auth/stores/authStore'
import RideMap from '@/features/rides/components/RideMap.vue'
import RideAudienceBadge from '@/features/rides/components/RideAudienceBadge.vue'
import { useRideDetail } from '@/features/rides/composables/useRideDetail'
import { RIDE_LEVEL_BADGE_COLORS } from '@/features/rides/constants/rideLevels'
import { RIDE_BIKE_TYPE_LABELS } from '@/features/rides/constants/rideOptions'
import { buildRideIcs } from '@/features/rides/utils/rideCalendar'
import { formatRideDate } from '@/utils/dates'
import RideParticipants from '@/features/rides/components/RideParticipants.vue'
import { useRideParticipantCount } from '@/features/rides/composables/useRideParticipantCount'
import { useRideParticipants } from '@/features/rides/composables/useRideParticipants'

const route = useRoute()
const authStore = useAuthStore()

/** Máximo de palabras del extracto de descripción; el resto se despliega con "Leer más". */
const DESCRIPTION_PREVIEW_WORDS = 70

const showFullDescription = ref(false)

const rideId = computed(() => {
  const id = route.params.id
  return typeof id === 'string' ? id : null
})

const { ride, isLoading, errorMessage } = useRideDetail(rideId)

const isAuthenticated = computed(() => authStore.user !== null)

const { participantCount, isLoadingCount, countError } = useRideParticipantCount(rideId)

const {
  participants,
  isLoading: isLoadingParticipants,
  isSubmitting,
  errorMessage: participantsError,
  join,
  leave,
} = useRideParticipants(
  rideId,
  computed(() => ride.value?.organizerId ?? null),
  isAuthenticated,
)

const isOrganizer = computed(
  () => ride.value !== null && authStore.user?.id === ride.value.organizerId,
)

const durationHours = computed(() => (ride.value ? Math.floor(ride.value.durationMinutes / 60) : 0))

const durationMinutesRemainder = computed(() => (ride.value ? ride.value.durationMinutes % 60 : 0))

// Enlace directo a Google Maps por coordenadas, sin API key.
const googleMapsUrl = computed(() =>
  ride.value
    ? `https://www.google.com/maps?q=${ride.value.latitude},${ride.value.longitude}`
    : null,
)

const descriptionWords = computed(() =>
  (ride.value?.description ?? '').trim().split(/\s+/).filter(Boolean),
)

const isDescriptionTruncated = computed(
  () => descriptionWords.value.length > DESCRIPTION_PREVIEW_WORDS,
)

const visibleDescription = computed(() => {
  if (!isDescriptionTruncated.value || showFullDescription.value) {
    return descriptionWords.value.join(' ')
  }
  return `${descriptionWords.value.slice(0, DESCRIPTION_PREVIEW_WORDS).join(' ')}…`
})

interface RideStatItem {
  label: string
  value: string
  unit?: string
}

const statItems = computed<RideStatItem[]>(() => {
  if (!ride.value) return []

  const duration =
    durationMinutesRemainder.value > 0
      ? `${durationHours.value} h ${durationMinutesRemainder.value} min`
      : `${durationHours.value} h`

  return [
    { label: 'Distancia', value: String(ride.value.distanceKm), unit: 'km' },
    { label: 'Desnivel', value: `+${ride.value.elevationM}`, unit: 'm' },
    { label: 'Duración', value: duration },
  ]
})

useHead({
  title: computed(() =>
    ride.value ? `${ride.value.title} | BikeMates` : 'Detalle de ruta | BikeMates',
  ),
})

// La última miga es el título real de la ruta; AppBreadcrumb la muestra acortada.
const rideBreadcrumb = computed<BreadcrumbItem[] | undefined>(() =>
  ride.value
    ? [{ label: 'Inicio', to: '/' }, { label: 'Rutas', to: '/rides' }, { label: ride.value.title }]
    : undefined,
)

/** Confirmación visible y anunciada de las acciones de compartir/calendario. */
const actionStatus = ref<string | null>(null)
let actionStatusTimer: ReturnType<typeof setTimeout> | null = null

function setActionStatus(message: string): void {
  actionStatus.value = message

  if (actionStatusTimer !== null) clearTimeout(actionStatusTimer)
  actionStatusTimer = setTimeout(() => {
    actionStatus.value = null
    actionStatusTimer = null
  }, 5000)
}

onBeforeUnmount(() => {
  if (actionStatusTimer !== null) clearTimeout(actionStatusTimer)
})

/**
 * Web Share API con respaldo de copia al portapapeles: compartir no puede
 * depender de que el navegador exponga `navigator.share`.
 */
async function handleShare(): Promise<void> {
  if (!ride.value) return

  const shareData = {
    title: ride.value.title,
    text: ride.value.title,
    url: window.location.href,
  }

  if (typeof navigator.share === 'function') {
    try {
      await navigator.share(shareData)
      return
    } catch (error) {
      // Cancelar el diálogo nativo no es un error para la usuaria.
      if (error instanceof DOMException && error.name === 'AbortError') return
    }
  }

  try {
    await navigator.clipboard.writeText(shareData.url)
    setActionStatus('Enlace copiado al portapapeles')
  } catch {
    setActionStatus('No se ha podido copiar el enlace')
  }
}

function downloadCalendarFile(rideId: string, contents: string): void {
  const blob = new Blob([contents], { type: 'text/calendar;charset=utf-8' })
  const objectUrl = URL.createObjectURL(blob)
  const anchor = document.createElement('a')

  anchor.href = objectUrl
  anchor.download = `bikemates-${rideId}.ics`
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()

  setTimeout(() => URL.revokeObjectURL(objectUrl), 0)
}

function handleAddToCalendar(): void {
  if (!ride.value) return

  try {
    const ics = buildRideIcs({
      id: ride.value.id,
      title: ride.value.title,
      description: ride.value.description,
      startsAt: ride.value.startsAt,
      durationMinutes: ride.value.durationMinutes,
      meetingPoint: ride.value.meetingPoint,
      url: window.location.href,
    })

    downloadCalendarFile(ride.value.id, ics)
    setActionStatus('Archivo de calendario descargado')
  } catch {
    setActionStatus('No se ha podido crear el archivo de calendario')
  }
}
</script>

<template>
  <AppPage :breadcrumb="rideBreadcrumb">
    <AppBackBar fallback="/rides" show-all-rides-link />

    <BikeLoader v-if="isLoading" class="mt-8" label="Cargando los detalles de la ruta…" />

    <EmptyState
      v-else-if="errorMessage"
      class="mt-6"
      title-as="h1"
      title="No se ha podido cargar la ruta"
      :description="errorMessage"
    >
      <Button to="/rides">Ver todas las rutas</Button>
    </EmptyState>

    <template v-else-if="ride">
      <header class="mt-4">
        <div class="flex flex-wrap items-center gap-2">
          <Badge variant="muted" :color="RIDE_LEVEL_BADGE_COLORS[ride.level]" dot>
            {{ ride.level }}
          </Badge>

          <Badge variant="muted">
            {{ RIDE_BIKE_TYPE_LABELS[ride.bikeType] }}
          </Badge>

          <RideAudienceBadge :audience="ride.audience" />
        </div>

        <Typography as="h1" variant="heading-lg" class="mt-2 tracking-tight">
          {{ ride.title }}
        </Typography>

        <div class="mt-1.5 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <div class="flex items-center gap-2.5">
            <Typography as="p" variant="body-sm" tone="muted" class="flex items-center gap-2">
              <FontAwesomeIcon :icon="faClock" aria-hidden="true" class="text-sm text-route-ink" />
              <time :datetime="ride.startsAt" class="font-medium text-ink">
                {{ formatRideDate(ride.startsAt) }}
              </time>
            </Typography>

            <button
              type="button"
              class="inline-flex size-8 shrink-0 items-center justify-center rounded-btn border border-line-strong bg-white text-graphite transition-colors hover:border-graphite hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
              aria-label="Añadir al calendario"
              title="Añadir al calendario"
              @click="handleAddToCalendar"
            >
              <FontAwesomeIcon :icon="faCalendarPlus" aria-hidden="true" class="text-sm" />
            </button>
          </div>

          <Button variant="outline" size="sm" @click="handleShare">
            <FontAwesomeIcon :icon="faShareNodes" aria-hidden="true" />
            Compartir
          </Button>
        </div>

        <p
          v-if="actionStatus"
          role="status"
          class="mt-1 text-xs font-medium text-trail-ink sm:text-right"
        >
          {{ actionStatus }}
        </p>
      </header>

      <dl class="mt-3 grid grid-cols-3 border-y border-line">
        <div
          v-for="item in statItems"
          :key="item.label"
          class="border-l border-line px-3 py-2.5 first:border-l-0 sm:px-4"
        >
          <Typography as="dt" variant="caption" tone="muted" class="whitespace-nowrap">
            {{ item.label }}
          </Typography>
          <dd class="mt-0.5 flex items-baseline gap-1">
            <Typography as="span" variant="numeric-md">{{ item.value }}</Typography>
            <Typography
              v-if="item.unit"
              as="span"
              variant="caption"
              tone="muted"
              class="font-semibold"
            >
              {{ item.unit }}
            </Typography>
          </dd>
        </div>
      </dl>

      <!-- 2/3: portada horizontal con la descripción debajo · 1/3: mapa reducido y participantes -->
      <div class="mt-4 grid gap-5 lg:grid-cols-3 lg:items-start">
        <div class="lg:col-span-2">
          <img
            :src="ride.imageUrl || '/default.webp'"
            :alt="`Imagen de la ruta ${ride.title}`"
            class="aspect-video w-full rounded-photo object-cover"
            loading="eager"
            fetchpriority="high"
          />

          <section class="mt-4" aria-labelledby="description-title">
            <Typography id="description-title" as="h2" variant="heading-sm" class="mb-2">
              Descripción
            </Typography>

            <p class="text-justify text-[0.95rem] leading-7 hyphens-auto text-graphite">
              {{ visibleDescription }}
            </p>

            <button
              v-if="isDescriptionTruncated"
              type="button"
              class="mt-2 text-sm font-semibold text-ink underline decoration-line-strong underline-offset-4 transition-colors hover:decoration-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
              :aria-expanded="showFullDescription"
              @click="showFullDescription = !showFullDescription"
            >
              {{ showFullDescription ? 'Leer menos' : 'Leer más' }}
            </button>

            <p v-if="ride.wikilocUrl" class="mt-3">
              <a
                :href="ride.wikilocUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-2 text-sm font-medium text-route-ink underline-offset-4 hover:text-route-dark hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                :aria-label="`Ver recorrido de ${ride.title} en Wikiloc`"
              >
                <FontAwesomeIcon :icon="faMap" aria-hidden="true" />
                Ver recorrido en Wikiloc
                <span class="sr-only">(se abre en una pestaña nueva)</span>
              </a>
            </p>
          </section>
        </div>

        <div class="flex flex-col gap-5">
          <section aria-labelledby="meeting-point-title">
            <Typography id="meeting-point-title" as="h2" variant="heading-sm" class="mb-2">
              Punto de encuentro
            </Typography>

            <Card>
              <RideMap
                compact
                :latitude="ride.latitude"
                :longitude="ride.longitude"
                :meeting-point="ride.meetingPoint"
              />

              <div class="flex flex-col gap-2 p-3">
                <Typography as="h3" variant="body-sm" class="font-semibold">
                  {{ ride.meetingPoint }}
                </Typography>

                <a
                  v-if="googleMapsUrl"
                  :href="googleMapsUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center self-start rounded-full border border-route-ink px-3 py-1.5 text-sm font-medium text-route-ink transition-colors hover:bg-route/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                >
                  Abrir en Google Maps
                  <span class="sr-only">(se abre en una pestaña nueva)</span>
                </a>
              </div>
            </Card>
          </section>

          <RideParticipants
            v-if="isAuthenticated"
            :participants="participants"
            :is-loading="isLoadingParticipants"
            :error-message="participantsError"
            :is-authenticated="isAuthenticated"
            :current-user-id="authStore.user?.id ?? null"
            :is-submitting="isSubmitting"
            :is-organizer="isOrganizer"
            @join="join"
            @leave="leave"
          />

          <section v-else aria-labelledby="participants-title">
            <div class="mb-2 flex items-center justify-between gap-4">
              <Typography id="participants-title" as="h2" variant="heading-sm">
                Participantes
              </Typography>

              <Typography
                v-if="participantCount !== null"
                as="span"
                variant="numeric-inline"
                class="text-ink"
                aria-live="polite"
              >
                {{ participantCount }}
                {{ participantCount === 1 ? 'inscrito' : 'inscritos' }}
              </Typography>
            </div>

            <Card class="p-4">
              <Typography v-if="isLoadingCount" variant="body-sm" tone="muted" role="status">
                Cargando el número de participantes...
              </Typography>

              <Typography v-else-if="countError" variant="body-sm" tone="muted" role="status">
                No se ha podido cargar el número de participantes.
              </Typography>

              <div v-else>
                <Typography variant="body-sm" tone="muted">
                  Inicia sesión para ver quién participa en esta ruta.
                </Typography>

                <Button to="/login" size="sm" class="mt-3"> Iniciar sesión </Button>
              </div>
            </Card>
          </section>
        </div>
      </div>

      <div
        class="mt-6 flex flex-col items-center gap-3 border-t border-line pt-5 sm:flex-row sm:justify-center"
      >
        <Button v-if="isOrganizer" :to="{ name: 'ride-edit', params: { id: ride.id } }">
          Editar ruta
        </Button>

        <Button to="/rides" variant="outline"> Explorar más rutas </Button>
      </div>
    </template>

    <EmptyState
      v-else
      class="mt-6"
      title-as="h1"
      title="Ruta no encontrada"
      description="No existe ninguna ruta publicada con ese identificador."
    >
      <Button to="/rides">Ver todas las rutas</Button>
    </EmptyState>
  </AppPage>
</template>
