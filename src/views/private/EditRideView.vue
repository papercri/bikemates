
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useHead } from '@unhead/vue'

import RideForm from '@/features/rides/components/RideForm.vue'

import type {
  Ride,
  RideFormSubmission,
  RideFormValues,
} from '@/features/rides/types'

import {
  getRideForEdit,
  updateRide,
} from '@/features/rides/services/rideService'
import {
  buildRideInput,
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

const initialValues = ref<RideFormValues>({
  title: '',
  description: '',
  startsAt: '',
  meetingPoint: '',
  latitude: null,
  longitude: null,
  bikeType: 'road',
  level: 'Iniciación',
  distanceKm: '',
  elevationM: '',
  durationMinutes: '',
  wikilocUrl: '',
  audience: 'everyone',
  maxParticipants: '',
})

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
  <main class="min-h-screen bg-[#F8F9FA] px-4 py-8 sm:px-6">
    <div class="mx-auto max-w-3xl">
      <header class="mb-8">
        <button
          type="button"
          class="mb-4 text-sm font-medium text-[#6C757D] hover:text-[#1A1D20] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#22C55E] rounded"
          @click="router.back()"
        >
          ← Volver
        </button>

        <h1 class="text-2xl font-bold text-[#1A1D20] sm:text-3xl">
          Editar ruta
        </h1>

        <p class="mt-2 text-sm text-[#6C757D]">
          Modifica los datos de tu salida ciclista.
        </p>
      </header>

      <div
        v-if="isLoading"
        role="status"
        class="rounded-2xl border border-[#DEE2E6] bg-white p-6 text-sm text-[#6C757D]"
      >
        Cargando ruta…
      </div>

      <div
        v-else-if="errorMessage && !ride"
        role="alert"
        class="rounded-2xl border border-red-200 bg-white p-6"
      >
        <p class="text-sm text-red-700">{{ errorMessage }}</p>

        <button
          type="button"
          class="mt-4 text-sm font-semibold text-[#1A1D20] underline"
          @click="router.push({ name: 'rides' })"
        >
          Volver a las rutas
        </button>
      </div>

      <section
        v-else-if="ride"
        class="rounded-3xl border border-[#E9ECEF] bg-white p-5 shadow-sm sm:p-8"
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
  </main>
</template>
