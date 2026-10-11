<script setup lang="ts">
import { useRouter } from 'vue-router'
import AppHeader from '@/components/layout/AppHeader.vue'
import { supabase } from '@/services/supabase'
import { updatePassword } from '@/features/auth/services/authService'

import { onUnmounted, ref } from 'vue'

// Dentro de <script setup>
const isRecoverySession = ref(false)

const {
  data: { subscription },
} = supabase.auth.onAuthStateChange((event) => {
  if (event === 'PASSWORD_RECOVERY') {
    isRecoverySession.value = true
  }
})

onUnmounted(() => {
  subscription.unsubscribe()
})

const router = useRouter()

const password = ref('')
const confirmPassword = ref('')
const isSubmitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

async function handleSubmit(): Promise<void> {
  errorMessage.value = ''
  successMessage.value = ''

  if (password.value.length < 8) {
    errorMessage.value = 'La contraseña debe tener al menos 8 caracteres.'
    return
  }

  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Las contraseñas no coinciden.'
    return
  }

  isSubmitting.value = true

  try {
    if (!isRecoverySession.value) {
      errorMessage.value = 'Debes acceder desde un enlace válido de recuperación enviado por email.'
      return
    }

    await updatePassword(password.value)

    successMessage.value = 'Contraseña actualizada correctamente.'

    await router.replace('/login')
  } catch {
    errorMessage.value =
      'No se ha podido actualizar la contraseña. Solicita un nuevo enlace e inténtalo otra vez.'
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
        <h1 class="text-3xl font-bold">Nueva contraseña</h1>

        <p class="mt-3 text-slate-400">
          Introduce una nueva contraseña para tu cuenta de BikeMates.
        </p>

        <form class="mt-8 space-y-5" novalidate @submit.prevent="handleSubmit">
          <div>
            <label for="password" class="mb-2 block text-sm font-medium"> Nueva contraseña </label>

            <input
              id="password"
              v-model="password"
              type="password"
              autocomplete="new-password"
              required
              class="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
              placeholder="Mínimo 8 caracteres"
            />
          </div>

          <div>
            <label for="confirm-password" class="mb-2 block text-sm font-medium">
              Confirmar nueva contraseña
            </label>

            <input
              id="confirm-password"
              v-model="confirmPassword"
              type="password"
              autocomplete="new-password"
              required
              class="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
              placeholder="Repite la nueva contraseña"
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
            {{ isSubmitting ? 'Actualizando…' : 'Guardar nueva contraseña' }}
          </button>
        </form>
      </section>
    </main>
  </div>
</template>
