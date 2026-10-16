<script setup lang="ts">
import { useHead } from '@unhead/vue'
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import AppPage from '@/components/layout/AppPage.vue'
import IconArrow from '@/components/icons/IconArrow.vue'
import IconDistance from '@/components/icons/IconDistance.vue'
import IconElevation from '@/components/icons/IconElevation.vue'
import Badge from '@/components/ui/Badge.vue'
import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import Typography from '@/components/ui/Typography.vue'
import { useAuthStore } from '@/features/auth/stores/authStore'
import RideMap from '@/features/rides/components/RideMap.vue'
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

useHead({
  title: computed(() =>
    ride.value ? `${ride.value.title} | BikeMates` : 'Detalle de ruta | BikeMates',
  ),
})
</script>

<template>
  <AppPage size="detail">
    <RouterLink
      to="/rides"
      class="inline-flex items-center gap-1.5 text-sm text-trail-ink hover:text-trail-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-trail"
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
      <section class="mt-8">
        <div class="flex flex-wrap items-center gap-3">
          <Typography as="span" variant="body-sm" tone="accent" class="font-medium">
            {{ ride.meetingPoint }}
          </Typography>

          <Badge variant="muted" :color="RIDE_LEVEL_BADGE_COLORS[ride.level]" dot>
            {{ ride.level }}
          </Badge>

          <Badge variant="muted">
            {{ RIDE_BIKE_TYPE_LABELS[ride.bikeType] }}
          </Badge>
        </div>

        <Typography as="h1" variant="heading-xl" class="mt-3 tracking-tight">
          {{ ride.title }}
        </Typography>
        <Typography class="mt-3" variant="body-sm" tone="muted">
          <time :datetime="ride.startsAt">{{ formatRideDate(ride.startsAt) }}</time>
        </Typography>

        <img
          :src="ride.imageUrl || '/default.webp'"
          :alt="`Imagen de la ruta ${ride.title}`"
          class="mt-6 aspect-[16/9] w-full rounded-card border border-line object-cover"
          loading="eager"
          fetchpriority="high"
        />

        <dl class="mt-6 grid grid-cols-1 border-y border-line sm:grid-cols-3">
          <div
            class="border-t border-line px-4 py-4 first:border-t-0 sm:border-t-0 sm:border-l sm:first:border-l-0 sm:px-6 sm:py-5"
          >
            <Typography as="dt" variant="body-sm" tone="muted" class="flex items-center gap-1.5">
              <IconDistance />
              Distancia
            </Typography>
            <dd class="mt-2 flex items-baseline gap-1">
              <Typography as="span" variant="numeric-lg">
                {{ ride.distanceKm }}
              </Typography>
              <Typography as="span" variant="body-sm" tone="muted" class="font-semibold">
                km
              </Typography>
            </dd>
          </div>

          <div class="border-t border-line px-4 py-4 sm:border-t-0 sm:border-l sm:px-6 sm:py-5">
            <Typography as="dt" variant="body-sm" tone="muted" class="flex items-center gap-1.5">
              <IconElevation />
              Desnivel
            </Typography>
            <dd class="mt-2 flex items-baseline gap-1">
              <Typography as="span" variant="numeric-lg"> +{{ ride.elevationM }} </Typography>
              <Typography as="span" variant="body-sm" tone="muted" class="font-semibold">
                m
              </Typography>
            </dd>
          </div>

          <div class="border-t border-line px-4 py-4 sm:border-t-0 sm:border-l sm:px-6 sm:py-5">
            <Typography as="dt" variant="body-sm" tone="muted"> Duración estimada </Typography>
            <dd class="mt-2 flex items-baseline gap-1">
              <Typography as="span" variant="numeric-lg">
                {{ durationHours }}
              </Typography>
              <Typography as="span" variant="body-sm" tone="muted" class="font-semibold">
                h
              </Typography>
              <template v-if="durationMinutesRemainder > 0">
                <Typography as="span" variant="numeric-lg">
                  {{ durationMinutesRemainder }}
                </Typography>
                <Typography as="span" variant="body-sm" tone="muted" class="font-semibold">
                  min
                </Typography>
              </template>
            </dd>
          </div>
        </dl>

        <p v-if="ride.wikilocUrl" class="mt-4">
          <a
            :href="ride.wikilocUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="text-sm font-medium text-trail-ink underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-trail"
            :aria-label="`Ver recorrido de ${ride.title} en Wikiloc`"
          >
            Ver recorrido en Wikiloc
            <span class="sr-only">(se abre en una pestaña nueva)</span>
          </a>
        </p>

        <Typography class="mt-6 leading-7" tone="muted">
          {{ ride.description }}
        </Typography>
      </section>

      <section class="mt-10" aria-labelledby="meeting-point-title">
        <Typography id="meeting-point-title" as="h2" variant="heading-lg" class="mb-4">
          Punto de encuentro
        </Typography>

        <Card class="overflow-hidden">
          <RideMap
            :latitude="ride.latitude"
            :longitude="ride.longitude"
            :meeting-point="ride.meetingPoint"
          />

          <div class="p-5 sm:p-6">
            <Typography as="h3" variant="body-sm" class="font-semibold">
              {{ ride.meetingPoint }}
            </Typography>
            <Typography class="mt-1" variant="body-sm" tone="muted">
              Lugar de salida de la grupeta
            </Typography>

            <a
              :href="`https://www.openstreetmap.org/?mlat=${ride.latitude}&mlon=${ride.longitude}#map=15/${ride.latitude}/${ride.longitude}`"
              target="_blank"
              rel="noopener noreferrer"
              class="mt-4 inline-flex rounded-full border border-line px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-trail focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-trail"
            >
              Abrir en OpenStreetMap
              <span class="sr-only">(se abre en una pestaña nueva)</span>
            </a>
          </div>
        </Card>
      </section>

      <RideParticipants
        v-if="isAuthenticated"
        class="mt-10"
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

      <section v-else class="mt-10" aria-labelledby="participants-title">
        <div class="mb-4 flex items-center justify-between gap-4">
          <Typography id="participants-title" as="h2" variant="heading-lg">
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

      <div class="mt-8 flex flex-wrap gap-3">
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
