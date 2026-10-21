<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { faPenToSquare, faTrashCan } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import IconMeetup from '@/components/icons/IconMeetup.vue'
import Alert from '@/components/ui/Alert.vue'
import BikeLoader from '@/components/ui/BikeLoader.vue'
import Button from '@/components/ui/Button.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import FormSelectField from '@/components/ui/FormSelectField.vue'
import Input from '@/components/ui/Input.vue'
import Typography from '@/components/ui/Typography.vue'
import RideCard from '@/features/rides/components/RideCard.vue'
import { RIDE_SORT_OPTIONS, type RideSortOption } from '@/features/rides/constants/rideFilters'
import { deleteRide, getMyRides } from '@/features/rides/services/rideService'
import type { Ride } from '@/features/rides/types'
import { sortRides, sortRidesByDate } from '@/features/rides/utils/rideOrdering'
import { normalizeSearchText } from '@/features/rides/utils/searchText'
import { isRidePast } from '@/utils/dates'

const rides = ref<Ride[]>([])
const isLoading = ref(false)
const errorMessage = ref('')
const sortBy = ref<RideSortOption>('date')
const query = ref('')
const timeframe = ref<'upcoming' | 'past'>('upcoming')

const rideToDelete = ref<Ride | null>(null)
const isDeleteDialogOpen = ref(false)
const isDeletingRide = ref(false)
const deleteRideError = ref('')

async function loadMyRides(): Promise<void> {
  isLoading.value = true
  errorMessage.value = ''

  try {
    rides.value = await getMyRides()
  } catch {
    errorMessage.value = 'No se han podido cargar tus rutas. Inténtalo de nuevo.'
  } finally {
    isLoading.value = false
  }
}

onMounted(loadMyRides)

/** Filtra por título (búsqueda en vivo) y ordena: por fecha ascendente, por métrica descendente. */
const visibleRides = computed(() => {
  const needle = normalizeSearchText(query.value)
  const matching =
    needle === ''
      ? rides.value
      : rides.value.filter((ride) => normalizeSearchText(ride.title).includes(needle))

  const sorted =
    sortBy.value === 'date' ? sortRidesByDate(matching) : sortRides(matching, sortBy.value, 'desc')

  return sorted.filter((ride) =>
    timeframe.value === 'past' ? isRidePast(ride.startsAt) : !isRidePast(ride.startsAt),
  )
})

const deleteDialogTitle = computed(() =>
  rideToDelete.value ? `¿Eliminar «${rideToDelete.value.title}»?` : '',
)

function requestRideDeletion(ride: Ride): void {
  if (isDeletingRide.value) return
  rideToDelete.value = ride
  deleteRideError.value = ''
  isDeleteDialogOpen.value = true
}

function cancelRideDeletion(): void {
  if (isDeletingRide.value) return
  isDeleteDialogOpen.value = false
  rideToDelete.value = null
}

async function confirmRideDeletion(): Promise<void> {
  const ride = rideToDelete.value
  if (!ride) return

  isDeletingRide.value = true
  deleteRideError.value = ''

  try {
    await deleteRide(ride.id)
    rides.value = rides.value.filter((candidate) => candidate.id !== ride.id)
    isDeleteDialogOpen.value = false
    rideToDelete.value = null
  } catch {
    deleteRideError.value = 'No se ha podido eliminar la ruta. Inténtalo de nuevo.'
    isDeleteDialogOpen.value = false
    rideToDelete.value = null
  } finally {
    isDeletingRide.value = false
  }
}
</script>

<template>
  <div>
    <BikeLoader v-if="isLoading" label="Cargando tus rutas…" />

    <div v-else-if="errorMessage" class="max-w-md">
      <Alert boxed>
        {{ errorMessage }}
      </Alert>

      <Button class="mt-3" variant="outline" @click="loadMyRides">Reintentar</Button>
    </div>

    <div v-else-if="rides.length === 0">
      <span
        class="mb-4 inline-flex rounded-full bg-level-medium/10 p-3 text-level-medium"
        aria-hidden="true"
      >
        <IconMeetup class="size-6" />
      </span>

      <EmptyState
        title="Mis rutas"
        description="Todavía no has publicado ninguna ruta. Crea la primera y aparecerá aquí."
      >
        <Button to="/rides/create">Publicar ruta</Button>
      </EmptyState>
    </div>

    <div v-else>
      <div class="flex flex-wrap items-end justify-between gap-3">
        <Typography variant="body-sm" tone="muted" aria-live="polite">
          {{ visibleRides.length }}
          {{ visibleRides.length === 1 ? 'ruta publicada' : 'rutas publicadas' }}
        </Typography>

        <div class="flex flex-wrap items-end gap-2">
          <div class="w-56">
            <label for="my-rides-search" class="sr-only"> Buscar por título </label>

            <Input
              id="my-rides-search"
              v-model="query"
              type="search"
              name="my-rides-search"
              placeholder="Buscar por título"
            />
          </div>

          <div class="w-48">
            <FormSelectField
              id="my-rides-sort"
              v-model="sortBy"
              label="Ordenar por"
              label-hidden
              :options="RIDE_SORT_OPTIONS"
            />
          </div>
        </div>
      </div>

      <div class="mt-4 flex gap-1" role="tablist" aria-label="Estado de las rutas">
        <button
          type="button"
          role="tab"
          :aria-selected="timeframe === 'upcoming'"
          class="rounded-btn px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          :class="
            timeframe === 'upcoming'
              ? 'bg-trail/10 text-trail-ink'
              : 'text-graphite hover:bg-surface hover:text-ink'
          "
          @click="timeframe = 'upcoming'"
        >
          Próximas
        </button>
        <button
          type="button"
          role="tab"
          :aria-selected="timeframe === 'past'"
          class="rounded-btn px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          :class="
            timeframe === 'past'
              ? 'bg-trail/10 text-trail-ink'
              : 'text-graphite hover:bg-surface hover:text-ink'
          "
          @click="timeframe = 'past'"
        >
          Pasadas
        </button>
      </div>

      <div
        v-if="visibleRides.length > 0"
        class="mt-4 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        <div
          v-for="ride in visibleRides"
          :key="ride.id"
          class="flex h-full flex-col overflow-hidden rounded-photo border border-line bg-white transition-colors hover:border-line-strong"
        >
          <RideCard :ride="ride" bare :past="isRidePast(ride.startsAt)" class="flex-1" />

          <!-- Acciones discretas: dos mitades simétricas integradas al pie de la tarjeta. -->
          <div class="grid grid-cols-2 border-t border-line bg-snow/60">
            <RouterLink
              :to="{ name: 'ride-edit', params: { id: ride.id } }"
              class="flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-graphite transition-colors hover:bg-surface hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ink"
            >
              <FontAwesomeIcon :icon="faPenToSquare" aria-hidden="true" class="size-3.5" />
              Modificar
            </RouterLink>

            <button
              type="button"
              class="flex items-center justify-center gap-1.5 border-l border-line py-2.5 text-xs font-medium text-graphite transition-colors hover:bg-red-50 hover:text-red-700 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-red-700"
              @click="requestRideDeletion(ride)"
            >
              <FontAwesomeIcon :icon="faTrashCan" aria-hidden="true" class="size-3.5" />
              Eliminar
            </button>
          </div>
        </div>
      </div>

      <p v-else class="mt-4 text-sm text-graphite">
        {{
          timeframe === 'past'
            ? 'Todavía no tienes rutas pasadas.'
            : 'Ninguna ruta coincide con la búsqueda.'
        }}
      </p>
    </div>

    <Alert v-if="deleteRideError" class="mt-4">
      {{ deleteRideError }}
    </Alert>

    <ConfirmDialog
      :open="isDeleteDialogOpen"
      tone="danger"
      :title="deleteDialogTitle"
      description="La ruta se eliminará de forma permanente y dejará de aparecer para el resto de ciclistas. Esta acción es irreversible."
      confirm-label="Eliminar ruta"
      cancel-label="Cancelar"
      :is-busy="isDeletingRide"
      @confirm="confirmRideDeletion"
      @cancel="cancelRideDeletion"
    />
  </div>
</template>
