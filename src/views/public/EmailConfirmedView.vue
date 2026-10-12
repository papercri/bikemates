<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import Alert from '@/components/ui/Alert.vue'
import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'
import Typography from '@/components/ui/Typography.vue'
import { supabase } from '@/services/supabase'
import { useAuthStore } from '@/features/auth/stores/authStore'

const router = useRouter()

const isProcessing = ref(true)
const isConfirmed = ref(false)
const errorMessage = ref('')
const authStore = useAuthStore()

onMounted(async () => {
  try {
    const params = new URLSearchParams(window.location.search)
    const hashParams = new URLSearchParams(window.location.hash.slice(1))

    const errorCode = params.get('error_code') ?? hashParams.get('error_code')

    if (errorCode) {
      errorMessage.value =
        errorCode === 'otp_expired'
          ? 'El enlace ha caducado o ya no es válido. Solicita uno nuevo.'
          : 'No se ha podido verificar el enlace. Solicita uno nuevo.'
      return
    }

    const type = params.get('type')
    const tokenHash = params.get('token_hash')

    if (type === 'recovery') {
      if (!tokenHash) {
        errorMessage.value = 'El enlace de recuperación no contiene un token válido.'
        return
      }

      const { error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: 'recovery',
      })

      if (error) {
        errorMessage.value = 'El enlace ha caducado o ya no es válido. Solicita uno nuevo.'
        return
      }

      authStore.markRecoverySession()

      await router.replace({ name: 'reset-password' })
      return
    }

    // La confirmación de registro utiliza la redirección
    // procesada por el cliente de Supabase.
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    if (error) {
      throw error
    }

    if (session?.user.email_confirmed_at) {
      isConfirmed.value = true
    } else {
      errorMessage.value = 'No se ha podido confirmar el email. Comprueba el enlace recibido.'
    }
  } catch {
    errorMessage.value = 'Se ha producido un error al verificar el enlace. Inténtalo de nuevo.'
  } finally {
    isProcessing.value = false
  }
})
</script>

<template>
  <main class="flex min-h-screen items-center justify-center bg-snow px-4 py-12 text-ink">
    <Card aria-labelledby="confirmation-title" class="w-full max-w-md p-8 text-center sm:p-10">
      <Typography variant="eyebrow" tone="accent">BikeMates</Typography>

      <Typography id="confirmation-title" as="h1" variant="heading-md" class="mt-4 tracking-tight">
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

      <Button
        v-if="!isProcessing"
        :to="{ name: 'login' }"
        block
        size="md"
        class="mt-8 min-h-12 text-sm"
      >
        {{ isConfirmed ? 'Ir al inicio de sesión' : 'Volver al inicio de sesión' }}
      </Button>

      <Button
        v-if="!isProcessing && errorMessage"
        :to="{ name: 'forgot-password' }"
        variant="outline"
        block
        size="md"
        class="mt-4 min-h-12 text-sm"
      >
        Solicitar nueva contraseña
      </Button>

      <Typography variant="caption" tone="muted" class="mt-6">
        BikeMates · Comparte rutas. Comparte kilómetros.
      </Typography>
    </Card>
  </main>
</template>
