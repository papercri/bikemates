<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useHead } from '@unhead/vue'
import { faTrashCan } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import RideForm from '@/features/rides/components/RideForm.vue'
import AppBackBar from '@/components/layout/AppBackBar.vue'
import type { BreadcrumbItem } from '@/components/layout/AppBreadcrumb.vue'
import AppPage from '@/components/layout/AppPage.vue'
import Alert from '@/components/ui/Alert.vue'
import BikeLoader from '@/components/ui/BikeLoader.vue'
import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import Typography from '@/components/ui/Typography.vue'

import { getRideImageUrl } from '@/features/rides/services/rideImageService'
import { deleteRide } from '@/features/rides/services/rideService'
import { useRideEditor } from '@/features/rides/composables/useRideEditor'
import type { RideFormSubmission } from '@/features/rides/types'

useHead({
  title: 'Editar ruta | BikeMates',
  meta: [
    {
      name: 'robots',
      content: 'noindex, nofollow',
    },
  ],
})

const route = useRoute()
// Solo para el botón "Volver" del cabecero; el guardado vive en el composable.
const router = useRouter()

const rideId = computed(() => {
  const id = route.params.id
  return typeof id === 'string' ? id : null
})

const { ride, isLoading, isSubmitting, errorMessage, initialValues, saveRide } = useRideEditor(
  rideId.value,
)

async function handleSubmit(payload: RideFormSubmission): Promise<void> {
  await saveRide(payload)
}

const isDeleteDialogOpen = ref(false)
const isDeletingRide = ref(false)
const deleteRideError = ref('')

const deleteDialogTitle = computed(() =>
  ride.value ? `¿Eliminar «${ride.value.title}»?` : '¿Eliminar esta ruta?',
)

// La última miga es el título real de la ruta; AppBreadcrumb la muestra acortada.
const rideBreadcrumb = computed<BreadcrumbItem[] | undefined>(() =>
  ride.value
    ? [{ label: 'Inicio', to: '/' }, { label: 'Rutas', to: '/rides' }, { label: ride.value.title }]
    : undefined,
)

function requestRideDeletion(): void {
  if (isDeletingRide.value) return
  deleteRideError.value = ''
  isDeleteDialogOpen.value = true
}

function cancelRideDeletion(): void {
  if (isDeletingRide.value) return
  isDeleteDialogOpen.value = false
}

async function confirmRideDeletion(): Promise<void> {
  if (!rideId.value) return

  isDeletingRide.value = true
  deleteRideError.value = ''

  try {
    await deleteRide(rideId.value)
    isDeleteDialogOpen.value = false
    await router.push({ name: 'profile', query: { tab: 'my-rides' } })
  } catch {
    deleteRideError.value = 'No se ha podido eliminar la ruta. Inténtalo de nuevo.'
    isDeleteDialogOpen.value = false
  } finally {
    isDeletingRide.value = false
  }
}
</script>

<template>
  <AppPage spacing="compact" :breadcrumb="rideBreadcrumb">
    <div class="mx-auto max-w-3xl">
      <header class="mb-5">
        <AppBackBar fallback="/rides" />

        <Typography as="h1" variant="heading-lg" class="mt-3"> Editar ruta </Typography>

        <Typography variant="body-sm" tone="muted" class="mt-1.5">
          Actualiza los detalles de tu salida y mantén la información al día.
        </Typography>
      </header>

      <BikeLoader v-if="isLoading" label="Cargando ruta…" />

      

      <Card v-else-if="ride" class="p-5 sm:p-6">
        <RideForm
          :initial-values="initialValues"
          :initial-image-url="ride.imagePath ? getRideImageUrl(ride.imagePath) : null"
          mode="edit"
          :is-submitting="isSubmitting"
          :error-message="errorMessage"
          @submit="handleSubmit"
        />
      </Card>
      <Card v-else-if="errorMessage && !ride" variant="danger" class="p-6" role="alert">
        <Typography variant="body-sm" class="text-red-700">{{ errorMessage }}</Typography>

        <Button variant="outline" size="sm" class="mt-4" @click="router.push({ name: 'rides' })">
          Volver a las rutas
        </Button>
      </Card>
      <section v-if="ride && !isLoading" class="mt-8 border-t border-line pt-5">
        <Typography as="h2" variant="heading-sm">Eliminar ruta</Typography>

        <Typography variant="body-sm" tone="muted" class="mt-1.5 max-w-2xl">
          Eliminar la ruta borra de forma permanente la salida y deja de aparecer para el resto de
          ciclistas. Esta acción es irreversible.
        </Typography>

        <div class="mt-3 flex flex-wrap items-center gap-4">
          <Button
            variant="destructive"
            size="sm"
            :loading="isDeletingRide"
            :disabled="isDeletingRide"
            @click="requestRideDeletion"
          >
            <FontAwesomeIcon :icon="faTrashCan" aria-hidden="true" class="size-3.5" />
            {{ isDeletingRide ? 'Eliminando…' : 'Eliminar ruta' }}
          </Button>

          <Alert v-if="deleteRideError">
            {{ deleteRideError }}
          </Alert>
        </div>

        <ConfirmDialog
          :open="isDeleteDialogOpen"
          tone="danger"
          :title="deleteDialogTitle"
          description="La ruta se eliminará de forma permanente y sus participantes perderán el acceso a ella. Esta acción es irreversible."
          confirm-label="Eliminar ruta"
          cancel-label="Cancelar"
          :is-busy="isDeletingRide"
          @confirm="confirmRideDeletion"
          @cancel="cancelRideDeletion"
        />
      </section>
    </div>
  </AppPage>
</template>
