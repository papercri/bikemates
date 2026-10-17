<script setup lang="ts">
import { faMap } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { useHead } from '@unhead/vue'
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import AppPage from '@/components/layout/AppPage.vue'
import IconArrow from '@/components/icons/IconArrow.vue'
import Badge from '@/components/ui/Badge.vue'
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
import { formatRideDate } from '@/utils/dates'
import RideParticipants from '@/features/rides/components/RideParticipants.vue'
import { useRideParticipantCount } from '@/features/rides/composables/useRideParticipantCount'
import { useRideParticipants } from '@/features/rides/composables/useRideParticipants'

const route = useRoute()
const authStore = useAuthStore()

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
</script>

<template>
  <AppPage>
    <RouterLink
      to="/rides"
      class="inline-flex items-center gap-1.5 text-sm text-trail-ink hover:text-trail-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
    >
      <IconArrow direction="left" />
      Volver a las rutas
    </RouterLink>

    <div v-if="isLoading" class="mt-12 py-16 text-center" role="status" aria-live="polite">
      <Typography tone="muted">Cargando los detalles de la ruta...</Typography>
    </div>

    <EmptyState
      v-else-if="errorMessage"
      class="mt-8"
      title-as="h1"
      title="No se ha podido cargar la ruta"
      :description="errorMessage"
    >
      <Button to="/rides">Ver todas las rutas</Button>
    </EmptyState>

    <template v-else-if="ride">
      <header class="mt-6">
        <div class="flex flex-wrap items-center gap-2">
          <Badge variant="muted" :color="RIDE_LEVEL_BADGE_COLORS[ride.level]" dot>
            {{ ride.level }}
          </Badge>

          <Badge variant="muted">
            {{ RIDE_BIKE_TYPE_LABELS[ride.bikeType] }}
          </Badge>

          <RideAudienceBadge :audience="ride.audience" />

          <Typography as="span" variant="body-sm" tone="accent" class="font-medium">
            {{ ride.meetingPoint }}
          </Typography>
        </div>

        <Typography as="h1" variant="heading-lg" class="mt-2 tracking-tight">
          {{ ride.title }}
        </Typography>

        <Typography class="mt-1" variant="body-sm" tone="muted">
          <time :datetime="ride.startsAt">{{ formatRideDate(ride.startsAt) }}</time>
        </Typography>
      </header>

      <img
        :src="ride.imageUrl || '/default.webp'"
        :alt="`Imagen de la ruta ${ride.title}`"
        class="mt-4 h-44 w-full rounded-photo object-cover sm:h-56"
        loading="eager"
        fetchpriority="high"
      />

      <dl class="mt-4 grid grid-cols-3 border-y border-line">
        <div
          v-for="item in statItems"
          :key="item.label"
          class="border-l border-line px-3 py-3 first:border-l-0 sm:px-4"
        >
          <Typography as="dt" variant="caption" tone="muted" class="whitespace-nowrap">
            {{ item.label }}
          </Typography>
          <dd class="mt-1 flex items-baseline gap-1">
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

      <Typography class="mt-4 max-w-2xl leading-7" tone="muted">
        {{ ride.description }}
      </Typography>

      <p v-if="ride.wikilocUrl" class="mt-3">
        <a
          :href="ride.wikilocUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-2 text-sm font-medium text-trail-ink underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          :aria-label="`Ver recorrido de ${ride.title} en Wikiloc`"
        >
          <FontAwesomeIcon :icon="faMap" aria-hidden="true" />
          Ver recorrido en Wikiloc
          <span class="sr-only">(se abre en una pestaña nueva)</span>
        </a>
      </p>

      <section class="mt-8" aria-labelledby="meeting-point-title">
        <Typography id="meeting-point-title" as="h2" variant="heading-sm" class="mb-3">
          Punto de encuentro
        </Typography>

        <Card>
          <RideMap
            :latitude="ride.latitude"
            :longitude="ride.longitude"
            :meeting-point="ride.meetingPoint"
          />

          <div class="flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <Typography as="h3" variant="body-sm" class="font-semibold">
                {{ ride.meetingPoint }}
              </Typography>
              <Typography class="mt-0.5" variant="caption" tone="muted">
                Lugar de salida de la grupeta
              </Typography>
            </div>

            <a
              :href="`https://www.openstreetmap.org/?mlat=${ride.latitude}&mlon=${ride.longitude}#map=15/${ride.latitude}/${ride.longitude}`"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center rounded-full border border-ink px-3.5 py-1.5 text-sm font-medium text-ink transition-colors hover:bg-snow focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            >
              Abrir en OpenStreetMap
              <span class="sr-only">(se abre en una pestaña nueva)</span>
            </a>
          </div>
        </Card>
      </section>

      <RideParticipants
        v-if="isAuthenticated"
        class="mt-8"
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

      <section v-else class="mt-8" aria-labelledby="participants-title">
        <div class="mb-3 flex items-center justify-between gap-4">
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

        <Card class="p-5 sm:p-6">
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

            <Button to="/login" class="mt-4"> Iniciar sesión </Button>
          </div>
        </Card>
      </section>

      <div class="mt-6 flex flex-wrap gap-3">
        <Button v-if="isOrganizer" :to="{ name: 'ride-edit', params: { id: ride.id } }">
          Editar ruta
        </Button>

        <Button to="/rides" variant="outline"> Explorar más rutas </Button>
      </div>
    </template>

    <EmptyState
      v-else
      class="mt-8"
      title-as="h1"
      title="Ruta no encontrada"
      description="No existe ninguna ruta publicada con ese identificador."
    >
      <Button to="/rides">Ver todas las rutas</Button>
    </EmptyState>
  </AppPage>
</template>
