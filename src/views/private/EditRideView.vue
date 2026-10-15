
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useHead } from '@unhead/vue'

import RideForm from '@/features/rides/components/RideForm.vue'
import AppPage from '@/components/layout/AppPage.vue'
import Typography from '@/components/ui/Typography.vue'

import type {
  Ride,
  RideFormSubmission,
} from '@/features/rides/types'

import {
  getRideForEdit,
  updateRide,
} from '@/features/rides/services/rideService'
import {
  buildRideInput,
  createEmptyRideFormValues,
  mapRideToFormValues,
} from '@/features/rides/utils/rideFormMapping'

import {
  deleteRideImage,
  getRideImageUrl,
  uploadRideImage,
} from '@/features/rides/services/rideImageService'

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
const router = useRouter()

const ride = ref<Ride | null>(null)
const isLoading = ref(true)
const isSubmitting = ref(false)
const errorMessage = ref<string | null>(null)

const initialValues = ref(createEmptyRideFormValues())

async function loadRide(): Promise<void> {
  const id = route.params.id

  if (typeof id !== 'string' || !id) {
    errorMessage.value = 'El identificador de la ruta no es válido.'
    isLoading.value = false
    return
  }

  try {
    const loadedRide = await getRideForEdit(id)

    ride.value = loadedRide
    initialValues.value = mapRideToFormValues(loadedRide)
  } catch (error: unknown) {
    console.error('Error al cargar la ruta:', error)
    errorMessage.value =
      'No se ha podido cargar la ruta. Comprueba que existe y que tienes permiso para editarla.'
  } finally {
    isLoading.value = false
  }
}

async function handleSubmit(
  payload: RideFormSubmission,
): Promise<void> {
  if (isSubmitting.value || !ride.value) return

  isSubmitting.value = true
  errorMessage.value = null

  let uploadedImagePath: string | null = null
  let updateCompleted = false

  const currentRide = ride.value

  try {
    if (payload.image) {
      uploadedImagePath = await uploadRideImage(payload.image)
    }

    let imagePath = currentRide.imagePath

    if (uploadedImagePath) {
      imagePath = uploadedImagePath
    } else if (payload.removeCurrentImage) {
      imagePath = null
    }

    const input = buildRideInput(payload.values, imagePath)

    if (!input) {
      errorMessage.value = 'Selecciona un punto de encuentro válido.'
      return
    }

    await updateRide(currentRide.id, input)
    updateCompleted = true

    const imageChanged = currentRide.imagePath !== imagePath

    if (imageChanged && currentRide.imagePath) {
      try {
        await deleteRideImage(currentRide.imagePath)
      } catch (error: unknown) {
        console.error('No se ha podido eliminar la imagen anterior:', error)
      }
    }

    await router.push({
      name: 'ride-detail',
      params: { id: currentRide.id },
    })
  } catch (error: unknown) {
    console.error('Error al actualizar la ruta:', error)

    if (!updateCompleted && uploadedImagePath) {
      try {
        await deleteRideImage(uploadedImagePath)
      } catch (cleanupError: unknown) {
        console.error(
          'No se ha podido limpiar la nueva imagen:',
          cleanupError,
        )
      }
    }

    errorMessage.value =
      'No se han podido guardar los cambios. Inténtalo de nuevo.'
  } finally {
    isSubmitting.value = false
  }
}

onMounted(loadRide)
</script>

<template>
  <AppPage size="detail" spacing="compact">
    <div class="mx-auto max-w-3xl">
      <header class="mb-8">
        <button
          type="button"
          class="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-graphite transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-trail"
          @click="router.back()"
        >
          <span aria-hidden="true">←</span>
          Volver
        </button>

        <Typography as="h1" variant="heading-md" class="tracking-tight">
          Editar ruta
        </Typography>

        <Typography variant="body-sm" tone="muted" class="mt-2">
          Modifica los datos de tu salida ciclista.
        </Typography>
      </header>

      <div
        v-if="isLoading"
        role="status"
        class="rounded-2xl border border-line-strong bg-canvas p-6 text-sm text-graphite"
      >
        Cargando ruta…
      </div>

      <div
        v-else-if="errorMessage && !ride"
        role="alert"
        class="rounded-2xl border border-red-200 bg-canvas p-6"
      >
        <p class="text-sm text-red-700">{{ errorMessage }}</p>

        <button
          type="button"
          class="mt-4 text-sm font-semibold text-ink underline"
          @click="router.push({ name: 'rides' })"
        >
          Volver a las rutas
        </button>
      </div>

      <section
        v-else-if="ride"
        class="rounded-3xl border border-line bg-canvas p-5 shadow-sm sm:p-8"
      >
        <RideForm
          :initial-values="initialValues"
          :initial-image-url="
            ride.imagePath ? getRideImageUrl(ride.imagePath) : null
          "
          mode="edit"
          :is-submitting="isSubmitting"
          :error-message="errorMessage"
          @submit="handleSubmit"
        />
      </section>
    </div>
  </AppPage>
</template>
