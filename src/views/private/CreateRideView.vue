<script setup lang="ts">
import { useHead } from '@unhead/vue'

import AppBackBar from '@/components/layout/AppBackBar.vue'
import AppPage from '@/components/layout/AppPage.vue'
import Card from '@/components/ui/Card.vue'
import Typography from '@/components/ui/Typography.vue'
import RideForm from '@/features/rides/components/RideForm.vue'

import { createEmptyRideFormValues } from '@/features/rides/utils/rideFormMapping'
import { useRideCreator } from '@/features/rides/composables/useRideCreator'
import type { RideFormSubmission } from '@/features/rides/types'

useHead({
  title: 'Crear ruta | BikeMates',
  meta: [
    {
      name: 'description',
      content: 'Publica una ruta ciclista y encuentra compañeros para pedalear.',
    },
    { name: 'robots', content: 'noindex, nofollow' },
  ],
})

const initialValues = createEmptyRideFormValues({
  bikeType: 'gravel',
  level: 'Intermedio',
})

const { isSubmitting, errorMessage, createPublishedRide } = useRideCreator()

async function handleSubmit(payload: RideFormSubmission): Promise<void> {
  await createPublishedRide(payload)
}
</script>

<template>
  <AppPage spacing="compact">
    <div class="mx-auto max-w-3xl">
      <header class="mb-5">
        <AppBackBar fallback="/rides" />

        <Typography as="h1" variant="heading-lg" class="mt-3">Organiza una salida </Typography>

        <Typography variant="body-sm" tone="muted" class="mt-1.5">
          Publica tu ruta, comparte los detalles y encuentra ciclistas que quieran unirse.
        </Typography>
      </header>

      <Card class="p-5 sm:p-6">
        <RideForm
          :initial-values="initialValues"
          :is-submitting="isSubmitting"
          :error-message="errorMessage"
          @submit="handleSubmit"
        />
      </Card>
    </div>
  </AppPage>
</template>
