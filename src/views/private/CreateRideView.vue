<script setup lang="ts">
import { useHead } from '@unhead/vue'
import { RouterLink } from 'vue-router'

import AppPage from '@/components/layout/AppPage.vue'
import IconArrow from '@/components/icons/IconArrow.vue'
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
  distanceKm: '30',
  elevationM: '300',
  durationMinutes: '120',
})

const { isSubmitting, errorMessage, createPublishedRide } = useRideCreator()

async function handleSubmit(payload: RideFormSubmission): Promise<void> {
  await createPublishedRide(payload)
}
</script>

<template>
  <AppPage size="detail" spacing="compact">
    <div class="mx-auto max-w-3xl">
      <RouterLink
        :to="{ name: 'rides' }"
        class="inline-flex items-center gap-1.5 text-sm text-graphite transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-trail"
      >
        <IconArrow direction="left" />
        Volver a las rutas
      </RouterLink>

      <header class="mb-6 mt-4">
        <Typography as="h1" variant="heading-lg"> Publica una ruta </Typography>

        <Typography variant="body-sm" tone="muted" class="mt-1.5 max-w-2xl">
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
