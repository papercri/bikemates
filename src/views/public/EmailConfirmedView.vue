<script setup lang="ts">
import { useHead } from '@unhead/vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import Alert from '@/components/ui/Alert.vue'
import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'
import Typography from '@/components/ui/Typography.vue'
import { useEmailLinkConfirmation } from '@/features/auth/composables/useEmailLinkConfirmation'

useHead({
  title: 'Confirmación de correo | BikeMates',
})

// El procesamiento del enlace vive en el composable; aquí solo se pinta.
const { isProcessing, isConfirmed, errorMessage } = useEmailLinkConfirmation(
  window.location.search,
  window.location.hash,
)
</script>

<template>
  <div class="flex min-h-screen flex-col bg-snow text-ink">
    <AppHeader />

    <main class="flex flex-1 items-center justify-center px-4 py-12">
      <Card
        v-reveal
        aria-labelledby="confirmation-title"
        class="w-full max-w-md p-8 text-center sm:p-10"
      >
        <Typography id="confirmation-title" as="h1" variant="heading-md">
          {{
            isProcessing
              ? 'Verificando enlace…'
              : isConfirmed
                ? '¡Email confirmado!'
                : 'No se ha podido verificar'
          }}
        </Typography>

        <Typography v-if="isProcessing" variant="body-sm" tone="muted" class="mt-4">
          Estamos comprobando la validez del enlace.
        </Typography>

        <Typography v-else-if="isConfirmed" variant="body-sm" tone="muted" class="mt-4 leading-6">
          Tu dirección de correo se ha confirmado. Ya puedes iniciar sesión en BikeMates.
        </Typography>

        <Alert v-else class="mt-4 leading-6">
          {{ errorMessage }}
        </Alert>

        <Button v-if="!isProcessing" :to="{ name: 'login' }" block size="md" class="mt-8">
          {{ isConfirmed ? 'Ir al inicio de sesión' : 'Volver al inicio de sesión' }}
        </Button>

        <Button
          v-if="!isProcessing && errorMessage"
          :to="{ name: 'forgot-password' }"
          variant="outline"
          block
          size="md"
          class="mt-4"
        >
          Solicitar nueva contraseña
        </Button>

        <Typography variant="caption" tone="muted" class="mt-6">
          BikeMates · Comparte rutas. Comparte kilómetros.
        </Typography>
      </Card>
    </main>

    <AppFooter />
  </div>
</template>
