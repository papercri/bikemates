<script setup lang="ts">
import { useHead } from '@unhead/vue'
import { useRouter } from 'vue-router'

import AppPage from '@/components/layout/AppPage.vue'
import Card from '@/components/ui/Card.vue'
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

const router = useRouter()

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
  <AppPage spacing="compact">
    <div class="mx-auto max-w-3xl">
      <header class="mb-5">
        <button
          type="button"
          class="inline-flex items-center gap-1.5 text-sm text-graphite transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          @click="router.back()"
        >
          <IconArrow direction="left" />
          Volver
        </button>

        <Typography as="h1" variant="heading-lg" class="mt-3"> Publica una ruta </Typography>

        <Typography variant="body-sm" tone="muted" class="mt-1.5">
          Organiza tu próxima salida y encuentra ciclistas con quienes pedalear.
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
