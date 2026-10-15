
<script setup lang="ts">
import { ref } from 'vue'
import { useHead } from '@unhead/vue'
import { useRouter } from 'vue-router'

import AppPage from '@/components/layout/AppPage.vue'
import Typography from '@/components/ui/Typography.vue'
import RideForm from '@/components/rides/RideForm.vue'

import { createRide } from '@/features/rides/services/rideService'
import {
  deleteRideImage,
  uploadRideImage,
} from '@/features/rides/services/rideImageService'

import type {
  CreateRideInput,
  RideFormSubmission,
  RideFormValues,
} from '@/features/rides/types'

const router = useRouter()

const isSubmitting = ref(false)
const errorMessage = ref<string | null>(null)

const initialValues: RideFormValues = {
  title: '',
  description: '',
  startsAt: '',
  meetingPoint: '',
  latitude: null,
  longitude: null,
  bikeType: 'gravel',
  level: 'Intermedio',
  distanceKm: '30',
  elevationM: '300',
  durationMinutes: '120',
  wikilocUrl: '',
  audience: 'everyone',
  maxParticipants: '',
}

async function handleSubmit(
  payload: RideFormSubmission,
): Promise<void> {
  if (isSubmitting.value) return

  errorMessage.value = null

  const { values, image } = payload
  const { latitude, longitude } = values

  // Defensa adicional antes de construir el objeto de persistencia.
  // La validación completa de los campos pertenece a RideForm.vue.
  if (latitude === null || longitude === null) {
    errorMessage.value = 'Selecciona un punto de encuentro válido.'
    return
  }

  const input: CreateRideInput = {
    title: values.title.trim(),
    description: values.description.trim(),
    startsAt: new Date(values.startsAt).toISOString(),
    meetingPoint: values.meetingPoint.trim(),
    latitude,
    longitude,
    bikeType: values.bikeType,
    level: values.level,
    distanceKm: Number(values.distanceKm),
    elevationM: Number(values.elevationM),
    durationMinutes: Number(values.durationMinutes),
    imagePath: null,
    wikilocUrl: values.wikilocUrl.trim() || null,
    audience: values.audience,
    maxParticipants: values.maxParticipants.trim()
      ? Number(values.maxParticipants)
      : null,
    status: 'published',
  }

  isSubmitting.value = true

  let uploadedImagePath: string | null = null
  let rideCreated = false

  try {
    if (image) {
      uploadedImagePath = await uploadRideImage(image)
      input.imagePath = uploadedImagePath
    }

    const ride = await createRide(input)
    rideCreated = true

    await router.push({
      name: 'ride-detail',
      params: { id: ride.id },
    })
  } catch (error: unknown) {
    if (uploadedImagePath && !rideCreated) {
      try {
        await deleteRideImage(uploadedImagePath)
      } catch {
        // Conservamos el error original.
      }
    }

    errorMessage.value = rideCreated
      ? 'La ruta se ha publicado, pero no se ha podido abrir su página.'
      : error instanceof Error
        ? error.message
        : 'No se ha podido publicar la ruta.'
  } finally {
    isSubmitting.value = false
  }
}

useHead({
  title: 'Crear ruta | BikeMates',
  meta: [
    {
      name: 'description',
      content:
        'Publica una ruta ciclista y encuentra compañeros para pedalear.',
    },
    { name: 'robots', content: 'noindex, nofollow' },
  ],
})
</script>

<template>
  <AppPage size="detail" spacing="compact">
    <div class="mx-auto max-w-3xl">
      <RouterLink
        :to="{ name: 'rides' }"
        class="inline-flex items-center gap-1.5 text-sm font-medium text-graphite transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-trail"
      >
        <span aria-hidden="true">←</span>
        Volver a las rutas
      </RouterLink>

      <header class="mb-4 mt-3">
        <Typography variant="eyebrow" tone="accent">
          Comunidad BikeMates
        </Typography>

        <Typography as="h1" variant="heading-xl" class="mt-1">
          Publica una ruta
        </Typography>

        <Typography variant="body-sm" tone="muted" class="mt-1 max-w-2xl">
          Organiza tu próxima salida y encuentra ciclistas con quienes pedalear.
        </Typography>
      </header>

      <RideForm
        :initial-values="initialValues"
        :is-submitting="isSubmitting"
        :error-message="errorMessage"
        @submit="handleSubmit"
      />
    </div>
  </AppPage>
</template>
