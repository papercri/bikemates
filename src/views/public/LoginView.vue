<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/layout/AppHeader.vue'
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
  <div class="min-h-screen bg-slate-950 text-white">
    <AppHeader />

    <main class="mx-auto max-w-lg px-4 py-12 sm:px-6">
      <section class="rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8">
        <h1 class="text-3xl font-bold">Inicia sesión</h1>

        <p class="mt-3 text-slate-400">Accede a tu cuenta de BikeMates.</p>

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

          <div>
            <div class="mb-2 flex items-center justify-between gap-3">
              <label for="password" class="text-sm font-medium"> Contraseña </label>

              <RouterLink to="/forgot-password" class="text-sm text-cyan-400 hover:text-cyan-300">
                ¿La has olvidado?
              </RouterLink>
            </div>

            <input
              id="password"
              v-model="password"
              name="password"
              type="password"
              autocomplete="current-password"
              required
              class="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
              placeholder="Tu contraseña"
            />
          </div>

          <p v-if="errorMessage" role="alert" class="text-sm text-red-400">
            {{ errorMessage }}
          </p>

          <button
            type="submit"
            :disabled="isSubmitting"
            class="w-full rounded-lg bg-cyan-400 px-5 py-3 font-semibold text-slate-950 transition-colors hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          >
            {{ isSubmitting ? 'Iniciando sesión…' : 'Iniciar sesión' }}
          </button>
        </form>

        <p class="mt-6 text-center text-sm text-slate-400">
          ¿Todavía no tienes cuenta?
          <RouterLink to="/register" class="font-medium text-cyan-400 hover:text-cyan-300">
            Regístrate
          </RouterLink>
        </p>
      </section>
    </main>
  </div>
</template>
