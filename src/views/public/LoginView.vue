<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/layout/AppHeader.vue'
import RidgeStrip from '@/components/ui/RidgeStrip.vue'
import PasswordInput from '@/components/ui/PasswordInput.vue'
import { loginUser } from '@/features/auth/services/authService'

const router = useRouter()

const email = ref('')
const password = ref('')
const isSubmitting = ref(false)
const errorMessage = ref('')

async function handleSubmit(): Promise<void> {
  errorMessage.value = ''

  if (!email.value.trim() || !password.value) {
    errorMessage.value = 'Introduce tu email y contraseña.'
    return
  }

  isSubmitting.value = true

  try {
    await loginUser({
      email: email.value,
      password: password.value,
    })

    await router.push('/rides')
  } catch {
    errorMessage.value =
      'No se ha podido iniciar sesión. Comprueba tus datos y que hayas confirmado tu email.'
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
          <h1 class="text-3xl font-bold">Inicia sesión</h1>

        <p class="mt-3 text-graphite">Accede a tu cuenta de BikeMates.</p>

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

          <div>
            <div class="mb-2 flex items-center justify-between gap-3">
              <label for="password" class="text-sm font-medium"> Contraseña </label>

              <RouterLink
                to="/forgot-password"
                class="text-sm text-trail-ink hover:text-trail-dark"
              >
                ¿La has olvidado?
              </RouterLink>
            </div>

            <PasswordInput
              id="password"
              v-model="password"
              name="password"
              autocomplete="current-password"
              required
              placeholder="Tu contraseña"
            />
          </div>

          <p v-if="errorMessage" role="alert" class="text-sm text-red-600">
            {{ errorMessage }}
          </p>

          <button
            type="submit"
            :disabled="isSubmitting"
            class="w-full rounded-btn bg-trail px-5 py-3 font-semibold text-ink transition-colors hover:bg-trail-deep disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
          >
            {{ isSubmitting ? 'Iniciando sesión…' : 'Iniciar sesión' }}
          </button>
        </form>

        <p class="mt-6 text-center text-sm text-graphite">
          ¿Todavía no tienes cuenta?
          <RouterLink to="/register" class="font-medium text-trail-ink hover:text-trail-dark">
            Regístrate
          </RouterLink>
        </p>
        </div>
      </section>
    </main>
  </div>
</template>
