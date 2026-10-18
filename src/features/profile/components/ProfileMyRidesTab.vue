<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import IconMeetup from '@/components/icons/IconMeetup.vue'
import Alert from '@/components/ui/Alert.vue'
import Button from '@/components/ui/Button.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import FormSelectField from '@/components/ui/FormSelectField.vue'
import Typography from '@/components/ui/Typography.vue'
import RideCard from '@/features/rides/components/RideCard.vue'
import { RIDE_SORT_OPTIONS, type RideSortOption } from '@/features/rides/constants/rideFilters'
import { deleteRide, getMyRides } from '@/features/rides/services/rideService'
import type { Ride } from '@/features/rides/types'
import { sortRides, sortRidesByDate } from '@/features/rides/utils/rideOrdering'
import { isRidePast } from '@/utils/dates'

const rides = ref<Ride[]>([])
const isLoading = ref(false)
const errorMessage = ref('')
const sortBy = ref<RideSortOption>('date')

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

/** Por fecha, de la más próxima a la más lejana; por distancia o desnivel, de mayor a menor. */
const sortedRides = computed(() =>
  sortBy.value === 'date'
    ? sortRidesByDate(rides.value)
    : sortRides(rides.value, sortBy.value, 'desc'),
)

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
      class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      role="status"
      aria-live="polite"
    >
      <span class="sr-only">Cargando tus rutas…</span>
      <div
        v-for="n in 3"
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
      <div class="flex flex-wrap items-end justify-between gap-4">
        <Typography variant="body-sm" tone="muted" aria-live="polite">
          {{ sortedRides.length }}
          {{ sortedRides.length === 1 ? 'ruta publicada' : 'rutas publicadas' }}
        </Typography>

        <div class="w-52">
          <FormSelectField
            id="my-rides-sort"
            v-model="sortBy"
            label="Ordenar por"
            label-hidden
            :options="RIDE_SORT_OPTIONS"
          />
        </div>
      </div>

      <div class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div v-for="ride in sortedRides" :key="ride.id" class="flex flex-col gap-2">
          <RideCard :ride="ride" :past="isRidePast(ride.startsAt)" />

          <div class="flex justify-end">
            <Button variant="quiet-destructive" size="sm" @click="requestRideDeletion(ride)">
              Eliminar
            </Button>
          </div>
        </div>
      </div>
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
