
<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/features/auth/stores/authStore'

const authStore = useAuthStore()
const router = useRouter()

const { user, isInitialized } = storeToRefs(authStore)

const isLoggingOut = ref(false)
const logoutError = ref('')

async function handleLogout(): Promise<void> {
  isLoggingOut.value = true
  logoutError.value = ''

  try {
    await authStore.logout()
    await router.replace('/')
  } catch {
    logoutError.value =
      'No se ha podido cerrar la sesión. Inténtalo de nuevo.'
  } finally {
    isLoggingOut.value = false
  }
}
</script>

<template>
  <header class="border-b border-slate-800 bg-slate-950 text-white">
    <div
      class="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8"
    >
      <RouterLink
        to="/"
        class="shrink-0 text-xl font-bold tracking-tight text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-400"
        aria-label="BikeMates, página de inicio"
      >
        Bike<span class="text-cyan-400">Mates</span>
      </RouterLink>

      <nav aria-label="Navegación principal" class="hidden items-center gap-6 sm:flex">
        <RouterLink
          to="/rides"
          class="text-sm text-slate-300 transition-colors hover:text-white"
        >
          Explorar rutas
        </RouterLink>

        <RouterLink
          to="/community"
          class="text-sm text-slate-300 transition-colors hover:text-white"
        >
          Comunidad
        </RouterLink>
      </nav>

      <div class="flex items-center gap-3">
        <span v-if="!isInitialized" class="text-sm text-slate-300">
          Comprobando sesión…
        </span>

        <template v-else-if="user">
          <RouterLink
            to="/profile"
            class="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:border-cyan-400 hover:text-cyan-400 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-400"
          >
            Mi perfil
          </RouterLink>

          <button
            type="button"
            :disabled="isLoggingOut"
            @click="handleLogout"
            class="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-cyan-400 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {{ isLoggingOut ? 'Cerrando sesión…' : 'Cerrar sesión' }}
          </button>
        </template>

        <template v-else>
          <RouterLink
            to="/login"
            class="shrink-0 rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:border-cyan-400 hover:text-cyan-400 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-400"
          >
            Iniciar sesión
          </RouterLink>

          <RouterLink
            to="/register"
            class="hidden rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-cyan-400 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-400 sm:inline-flex"
          >
            Registrarse
          </RouterLink>
        </template>
      </div>
    </div>

    <p v-if="logoutError" role="alert" class="px-4 pb-3 text-sm text-red-400 sm:px-6">
      {{ logoutError }}
    </p>
  </header>
</template>
