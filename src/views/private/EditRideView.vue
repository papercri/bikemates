<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useHead } from '@unhead/vue'

import RideForm from '@/features/rides/components/RideForm.vue'
import AppPage from '@/components/layout/AppPage.vue'
import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'
import IconArrow from '@/components/icons/IconArrow.vue'
import Typography from '@/components/ui/Typography.vue'

import { getRideImageUrl } from '@/features/rides/services/rideImageService'
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
</script>

<template>
  <AppPage size="detail" spacing="compact">
    <div class="mx-auto max-w-3xl">
      <header class="mb-6">
        <button
          type="button"
          class="inline-flex items-center gap-1.5 text-sm text-graphite transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-trail"
          @click="router.back()"
        >
          <IconArrow direction="left" />
          Volver
        </button>

        <Typography as="h1" variant="heading-lg" class="mt-3"> Editar ruta </Typography>

        <Typography variant="body-sm" tone="muted" class="mt-2">
          Modifica los datos de tu salida ciclista.
        </Typography>
      </header>

      <Card v-if="isLoading" class="p-6" role="status">
        <Typography variant="body-sm" tone="muted">Cargando ruta…</Typography>
      </Card>

      <Card v-else-if="errorMessage && !ride" variant="danger" class="p-6" role="alert">
        <Typography variant="body-sm" class="text-red-700">{{ errorMessage }}</Typography>

        <Button variant="outline" size="sm" class="mt-4" @click="router.push({ name: 'rides' })">
          Volver a las rutas
        </Button>
      </Card>

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
    </div>
  </AppPage>
</template>
