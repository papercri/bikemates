<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { faPenToSquare, faTrashCan } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import IconMeetup from '@/components/icons/IconMeetup.vue'
import Alert from '@/components/ui/Alert.vue'
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

  return sortBy.value === 'date'
    ? sortRidesByDate(matching)
    : sortRides(matching, sortBy.value, 'desc')
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
    <div
      v-if="isLoading"
      class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      role="status"
      aria-live="polite"
    >
      <span class="sr-only">Cargando tus rutas…</span>
      <div
        v-for="n in 4"
        :key="n"
        class="h-56 rounded-photo bg-surface motion-safe:animate-pulse"
        aria-hidden="true"
      />
    </div>

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
            <label for="my-rides-search" class="sr-only">
              Buscar por título
            </label>

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

      <div
        v-if="visibleRides.length > 0"
        class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        <div v-for="ride in visibleRides" :key="ride.id" class="flex flex-col gap-2">
          <RideCard :ride="ride" :past="isRidePast(ride.startsAt)" />

          <div class="flex items-center justify-end gap-2">
            <Button
              :to="{ name: 'ride-edit', params: { id: ride.id } }"
              variant="outline"
              size="sm"
            >
              <FontAwesomeIcon :icon="faPenToSquare" aria-hidden="true" class="size-3.5" />
              Modificar
            </Button>

            <Button variant="destructive" size="sm" @click="requestRideDeletion(ride)">
              <FontAwesomeIcon :icon="faTrashCan" aria-hidden="true" class="size-3.5" />
              Eliminar
            </Button>
          </div>
        </div>
      </div>

      <p v-else class="mt-4 text-sm text-graphite">
        Ninguna ruta coincide con la búsqueda.
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
