<script setup lang="ts">
import { faArrowUpRightFromSquare, faBicycle, faClock } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { useHead } from '@unhead/vue'
import { computed, onBeforeUnmount, ref } from 'vue'
import { useRoute } from 'vue-router'
import AppBackBar from '@/components/layout/AppBackBar.vue'
import type { BreadcrumbItem } from '@/components/layout/AppBreadcrumb.vue'
import AppPage from '@/components/layout/AppPage.vue'
import IconArrow from '@/components/icons/IconArrow.vue'
import Badge from '@/components/ui/Badge.vue'
import BikeLoader from '@/components/ui/BikeLoader.vue'
import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import MarkdownText from '@/components/ui/MarkdownText.vue'
import Typography from '@/components/ui/Typography.vue'
import { useAuthStore } from '@/features/auth/stores/authStore'
import RideMap from '@/features/rides/components/RideMap.vue'
import RideAudienceBadge from '@/features/rides/components/RideAudienceBadge.vue'
import { useRideDetail } from '@/features/rides/composables/useRideDetail'
import { RIDE_LEVEL_BADGE_COLORS } from '@/features/rides/constants/rideLevels'
import { RIDE_BIKE_TYPE_LABELS } from '@/features/rides/constants/rideOptions'
import type { RideCalendarEntry } from '@/features/rides/utils/rideCalendar'
import { formatRideDate } from '@/utils/dates'
import RideCalendarMenu from '@/features/rides/components/RideCalendarMenu.vue'
import RideShareMenu from '@/features/rides/components/RideShareMenu.vue'
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

const { participantCount } = useRideParticipantCount(rideId)

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

/**
 * Recorta la descripción a las primeras palabras conservando los saltos de línea
 * originales: no se vuelve a unir el texto con espacios, que perdería el formato.
 */
const visibleDescription = computed(() => {
  const raw = ride.value?.description ?? ''

  if (!isDescriptionTruncated.value || showFullDescription.value) return raw

  const regex = /\S+/g
  let count = 0
  let cutAt = 0
  let match = regex.exec(raw)

  while (match !== null) {
    count += 1
    cutAt = match.index + match[0].length
    if (count >= DESCRIPTION_PREVIEW_WORDS) break
    match = regex.exec(raw)
  }

  return `${raw.slice(0, cutAt)}…`
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

/**
 * URL absoluta de la página de detalle: base de compartir, calendario y
 * metadatos Open Graph. Se construye desde el origen de la aplicación.
 */
const rideUrl = computed(() => {
  const id = rideId.value
  if (id === null) return null
  const origin = window.location.origin
  return `${origin}/rides/${id}`
})

/**
 * Extracto breve para redes y buscadores: la descripción completa es larga
 * y los scrapers esperan un resumen corto.
 */
const rideSocialDescription = computed(() => {
  const description = ride.value?.description.trim() ?? ''
  if (description === '') {
    return 'Salida en bicicleta organizada en BikeMates.'
  }
  return description.length > 160 ? `${description.slice(0, 157).trimEnd()}…` : description
})

useHead(
  computed(() => {
    const current = ride.value
    if (current === null) return {}

    const url = rideUrl.value
    const image = current.imageUrl

    return {
      title: `${current.title} | BikeMates`,
      meta: [
        { name: 'description', content: rideSocialDescription.value },
        // Open Graph: previsualización en Facebook, WhatsApp, Telegram…
        { property: 'og:type', content: 'article' },
        { property: 'og:title', content: current.title },
        { property: 'og:description', content: rideSocialDescription.value },
        { property: 'og:site_name', content: 'BikeMates' },
        ...(url !== null ? [{ property: 'og:url', content: url }] : []),
        ...(image !== null ? [{ property: 'og:image', content: image }] : []),
        // Twitter/X: sin imagen propia de la app se usa la de la salida.
        { name: 'twitter:card', content: image !== null ? 'summary_large_image' : 'summary' },
        { name: 'twitter:title', content: current.title },
        { name: 'twitter:description', content: rideSocialDescription.value },
        ...(image !== null ? [{ name: 'twitter:image', content: image }] : []),
      ],
      link: url !== null ? [{ rel: 'canonical', href: url }] : [],
    }
  }),
)

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

const calendarEntry = computed<RideCalendarEntry | null>(() => {
  const current = ride.value
  const url = rideUrl.value
  if (current === null || url === null) return null

  return {
    id: current.id,
    title: current.title,
    description: current.description,
    startsAt: current.startsAt,
    durationMinutes: current.durationMinutes,
    meetingPoint: current.meetingPoint,
    url,
  }
})
</script>

<template>
  <AppPage :breadcrumb="rideBreadcrumb">
    <AppBackBar fallback="/rides" />

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

          <Badge variant="muted" color="trail">
            <FontAwesomeIcon :icon="faBicycle" aria-hidden="true" class="size-3 text-trail-ink" />
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

            <RideCalendarMenu
              v-if="calendarEntry"
              :entry="calendarEntry"
              class="shrink-0"
              @downloaded="setActionStatus('Archivo de calendario descargado')"
              @error="setActionStatus('No se ha podido crear el archivo de calendario')"
            />
          </div>

          <RideShareMenu
            v-if="rideUrl"
            :title="ride.title"
            :url="rideUrl"
            @copied="setActionStatus('Enlace copiado al portapapeles')"
            @copy-error="setActionStatus('No se ha podido copiar el enlace')"
          />
        </div>

        <p
          v-if="actionStatus"
          role="status"
          class="mt-1 text-xs font-medium text-trail-ink sm:text-right"
        >
          {{ actionStatus }}
        </p>
      </header>

      <dl class="mt-5 grid grid-cols-3 border-y border-line">
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
      <div class="mt-8 grid gap-8 lg:grid-cols-3 lg:gap-10 lg:items-start">
        <div class="lg:col-span-2">
          <img
            :src="ride.imageUrl || '/default.webp'"
            :alt="`Imagen de la ruta ${ride.title}`"
            class="aspect-[21/9] w-full rounded-photo object-cover"
            loading="eager"
            fetchpriority="high"
          />

          <section class="mt-6" aria-labelledby="description-title">
            <Typography id="description-title" as="h2" variant="heading-sm" class="mb-2">
              Descripción
            </Typography>

            <MarkdownText
              :text="visibleDescription"
              class="text-justify text-[0.95rem] leading-7 hyphens-auto text-graphite"
            />

            <button
              v-if="isDescriptionTruncated"
              type="button"
              class="mt-2 text-sm font-semibold text-ink underline decoration-line-strong underline-offset-4 transition-colors hover:decoration-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
              :aria-expanded="showFullDescription"
              @click="showFullDescription = !showFullDescription"
            >
              {{ showFullDescription ? 'Leer menos' : 'Leer más' }}
            </button>

            <p v-if="ride.wikilocUrl" class="mt-3 flex justify-end">
              <a
                :href="ride.wikilocUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-2 text-sm font-medium text-route-ink underline-offset-4 hover:text-route-dark hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                :aria-label="`Ver ruta de ${ride.title}`"
              >
                Ver ruta
                <FontAwesomeIcon :icon="faArrowUpRightFromSquare" aria-hidden="true" />
                <span class="sr-only">(se abre en una pestaña nueva)</span>
              </a>
            </p>
          </section>
        </div>

        <div class="flex flex-col gap-6">
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
                  class="inline-flex items-center gap-1.5 self-start text-sm text-graphite transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                >
                  Abrir en Google Maps
                  <IconArrow direction="right" aria-hidden="true" />
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
            :current-user-id="authStore.user?.id ?? null"
            :is-submitting="isSubmitting"
            @join="join"
            @leave="leave"
          />

          <!-- Sin sesión solo se muestra el número: el listado de nombres es privado. -->
          <section v-else aria-labelledby="participants-title">
            <div class="flex flex-wrap items-center justify-between gap-4">
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
          </section>
        </div>
      </div>

      <div
        class="mt-8 flex flex-col items-center gap-3 border-t border-line pt-6 sm:flex-row sm:justify-center"
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
