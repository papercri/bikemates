
<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/layout/AppHeader.vue'
import RidgeStrip from '@/components/ui/RidgeStrip.vue'
import { useAuthStore } from '@/features/auth/stores/authStore'
import { updatePassword } from '@/features/auth/services/authService'

const router = useRouter()
const authStore = useAuthStore()
const { isRecoverySession } = storeToRefs(authStore)

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

  if (!isRecoverySession.value) {
    errorMessage.value =
      'Debes acceder desde un enlace válido de recuperación enviado por email.'
    return
  }

  isSubmitting.value = true

  try {
    await updatePassword(password.value)
    successMessage.value = 'Contraseña actualizada correctamente.'

    authStore.clearRecoverySession()
    await router.replace({ name: 'login' })
  } catch {
    errorMessage.value =
      'No se ha podido actualizar la contraseña. Solicita un nuevo enlace e inténtalo otra vez.'
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
          <h1 class="text-3xl font-bold">Nueva contraseña</h1>

          <p class="mt-3 text-graphite">
            Introduce una nueva contraseña para tu cuenta de BikeMates.
          </p>
        
          <form class="mt-8 space-y-5" novalidate @submit.prevent="handleSubmit">
            <div>
              <label for="password" class="mb-2 block text-sm font-medium">
                Nueva contraseña
              </label>

              <input
                id="password"
                v-model="password"
                type="password"
                autocomplete="new-password"
                required
                class="w-full rounded-btn border border-line bg-canvas px-4 py-3 text-ink outline-none transition-colors placeholder:text-graphite focus:border-trail focus:ring-2 focus:ring-trail/25"
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
                class="w-full rounded-btn border border-line bg-canvas px-4 py-3 text-ink outline-none transition-colors placeholder:text-graphite focus:border-trail focus:ring-2 focus:ring-trail/25"
                placeholder="Repite la nueva contraseña"
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
              class="w-full rounded-btn bg-trail px-5 py-3 font-semibold text-ink transition-colors hover:bg-trail-deep disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink "
            >
              {{ isSubmitting ? 'Actualizando…' : 'Guardar nueva contraseña' }}
            </button>
          </form>
        </div>
      </section>
    </main>
  </div>
</template>
