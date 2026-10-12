<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { supabase } from '@/services/supabase'
import { useAuthStore } from '@/features/auth/stores/authStore'
const router = useRouter()

const isProcessing = ref(true)
const isConfirmed = ref(false)
const errorMessage = ref('')
const authStore = useAuthStore()

onMounted(async () => {
    console.log('URL recibida:', window.location.href)
console.log('Query:', window.location.search)
console.log('Hash:', window.location.hash)
  try {
    const params = new URLSearchParams(window.location.search)
    const hashParams = new URLSearchParams(
      window.location.hash.slice(1),
    )

    const errorCode =
      params.get('error_code') ?? hashParams.get('error_code')

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
        errorMessage.value =
          'El enlace de recuperación no contiene un token válido.'
        return
      }

     const { error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: 'recovery',
        })

        if (error) {
        errorMessage.value =
            'El enlace ha caducado o ya no es válido. Solicita uno nuevo.'
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
      errorMessage.value =
        'No se ha podido confirmar el email. Comprueba el enlace recibido.'
    }
  } catch {
    errorMessage.value =
      'Se ha producido un error al verificar el enlace. Inténtalo de nuevo.'
  } finally {
    isProcessing.value = false
  }
})
</script>

<template>
  <main
    class="flex min-h-screen items-center justify-center bg-[#F8F9FA] px-4 py-12 text-[#1A1D20]"
  >
    <section
      aria-labelledby="confirmation-title"
      class="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-10"
    >
      <p class="text-sm font-bold uppercase tracking-widest text-green-700">
        BikeMates
      </p>

      <h1
        id="confirmation-title"
        class="mt-4 text-2xl font-bold tracking-tight sm:text-3xl"
      >
        {{ isProcessing ? 'Verificando enlace…' : isConfirmed ? '¡Email confirmado!' : 'No se ha podido verificar' }}
      </h1>

      <p v-if="isProcessing" role="status" class="mt-4 text-sm text-slate-600">
        Estamos comprobando la validez del enlace.
      </p>

      <p v-else-if="isConfirmed" class="mt-4 text-sm leading-6 text-slate-600">
        Tu dirección de correo se ha confirmado. Ya puedes iniciar sesión en BikeMates.
      </p>

      <p v-else role="alert" class="mt-4 text-sm leading-6 text-red-700">
        {{ errorMessage }}
      </p>

      <RouterLink
        v-if="!isProcessing"
        :to="{ name: 'login' }"
        class="mt-8 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-green-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700"
      >
        {{ isConfirmed ? 'Ir al inicio de sesión' : 'Volver al inicio de sesión' }}
      </RouterLink>

      <RouterLink
        v-if="!isProcessing && errorMessage"
        :to="{ name: 'forgot-password' }"
        class="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700"
      >
        Solicitar nueva contraseña
      </RouterLink>

      <p class="mt-6 text-xs leading-5 text-slate-500">
        BikeMates · Comparte rutas. Comparte kilómetros.
      </p>
    </section>
  </main>
</template>