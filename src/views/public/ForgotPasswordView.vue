<script setup lang="ts">
import { ref } from 'vue'
import AppHeader from '@/components/layout/AppHeader.vue'
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
  <div class="min-h-screen bg-slate-950 text-white">
    <AppHeader />

    <main class="mx-auto max-w-lg px-4 py-12 sm:px-6">
      <section class="rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8">
        <h1 class="text-3xl font-bold">Recuperar contraseña</h1>

        <p class="mt-3 text-slate-400">
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
              class="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
              placeholder="nombre@ejemplo.com"
            />
          </div>

          <p v-if="errorMessage" role="alert" class="text-sm text-red-400">
            {{ errorMessage }}
          </p>

          <p v-if="successMessage" role="status" class="text-sm text-emerald-400">
            {{ successMessage }}
          </p>

          <button
            type="submit"
            :disabled="isSubmitting"
            class="w-full rounded-lg bg-cyan-400 px-5 py-3 font-semibold text-slate-950 hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {{ isSubmitting ? 'Enviando…' : 'Enviar instrucciones' }}
          </button>
        </form>

        <p class="mt-6 text-center text-sm text-slate-400">
          <RouterLink to="/login" class="text-cyan-400 hover:text-cyan-300">
            Volver al inicio de sesión
          </RouterLink>
        </p>
      </section>
    </main>
  </div>
</template>
