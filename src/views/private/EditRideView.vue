<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useHead } from '@unhead/vue'

import RideForm from '@/features/rides/components/RideForm.vue'
import AppPage from '@/components/layout/AppPage.vue'
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
      <header class="mb-8">
        <button
          type="button"
          class="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-graphite transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-trail"
          @click="router.back()"
        >
          <span aria-hidden="true">←</span>
          Volver
        </button>

        <Typography as="h1" variant="heading-md" class="tracking-tight"> Editar ruta </Typography>

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
          :initial-image-url="ride.imagePath ? getRideImageUrl(ride.imagePath) : null"
          mode="edit"
          :is-submitting="isSubmitting"
          :error-message="errorMessage"
          @submit="handleSubmit"
        />
      </section>
    </div>
  </AppPage>
</template>
