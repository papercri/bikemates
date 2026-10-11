<script setup lang="ts">
import { ref } from 'vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import RidgeStrip from '@/components/ui/RidgeStrip.vue'
import { requestPasswordReset } from '@/features/auth/services/authService'

const email = ref('')
const isSubmitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

async function handleSubmit(): Promise<void> {
  errorMessage.value = ''
  successMessage.value = ''

  if (!email.value.trim()) {
    errorMessage.value = 'Introduce tu correo electrónico.'
    return
  }

  isSubmitting.value = true

  try {
    await requestPasswordReset(email.value, `${window.location.origin}/reset-password`)

    successMessage.value =
      'Si la dirección está registrada, recibirás un correo con las instrucciones para recuperar tu contraseña.'
  } catch {
    errorMessage.value = 'No se ha podido procesar la solicitud. Inténtalo de nuevo más tarde.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-snow text-ink">
    <AppHeader />

    <main class="mx-auto max-w-lg px-4 py-12 sm:px-6">
      <section class="overflow-hidden rounded-card border border-line bg-canvas shadow-card">
        <RidgeStrip />

        <div class="p-6 pt-4 sm:p-8 sm:pt-5">
          <h1 class="text-3xl font-bold">Recuperar contraseña</h1>

        <p class="mt-3 text-graphite">
          Introduce el email de tu cuenta y te enviaremos las instrucciones para establecer una
          nueva contraseña.
        </p>

        <form class="mt-8 space-y-5" novalidate @submit.prevent="handleSubmit">
          <div>
            <label for="email" class="mb-2 block text-sm font-medium"> Correo electrónico </label>

            <input
              id="email"
              v-model="email"
              name="email"
              type="email"
              autocomplete="email"
              required
              class="w-full rounded-btn border border-line bg-canvas px-4 py-3 text-ink outline-none transition-colors placeholder:text-graphite focus:border-trail focus:ring-2 focus:ring-trail/25"
              placeholder="nombre@ejemplo.com"
            />
          </div>

          <p v-if="errorMessage" role="alert" class="text-sm text-red-600">
            {{ errorMessage }}
          </p>

          <p v-if="successMessage" role="status" class="text-sm text-trail-ink">
            {{ successMessage }}
          </p>

          <button
            type="submit"
            :disabled="isSubmitting"
            class="w-full rounded-btn bg-trail px-5 py-3 font-semibold text-ink transition-colors hover:bg-trail-deep disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
          >
            {{ isSubmitting ? 'Enviando…' : 'Enviar instrucciones' }}
          </button>
        </form>

        <p class="mt-6 text-center text-sm text-graphite">
          <RouterLink to="/login" class="text-trail-ink hover:text-trail-dark">
            Volver al inicio de sesión
          </RouterLink>
        </p>
        </div>
      </section>
    </main>
  </div>
</template>
