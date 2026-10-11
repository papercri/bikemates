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
    logoutError.value = 'No se ha podido cerrar la sesión. Inténtalo de nuevo.'
  } finally {
    isLoggingOut.value = false
  }
}
</script>

<template>
  <header class="border-b border-line bg-canvas text-ink">
    <div
      class="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8"
    >
      <RouterLink
        to="/"
        class="flex shrink-0 items-center gap-2.5 text-xl font-bold tracking-tight text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-trail"
        aria-label="BikeMates, página de inicio"
      >
        <svg
          viewBox="0 0 44 28"
          class="h-7 w-11 shrink-0"
          aria-hidden="true"
          focusable="false"
        >
          <path
            d="M2 22 L12 8 L18 15 L26 4 L42 22"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            opacity="0.2"
          />
          <g
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="10" cy="20" r="5.5" />
            <circle cx="32" cy="20" r="5.5" />
            <path d="M10 20 L17 20 L20 10 L27 10 L32 20" />
            <path d="M17 20 L20 10" />
          </g>
          <circle cx="17" cy="20" r="1.6" fill="var(--color-trail)" />
        </svg>
        <span>Bike<span class="text-trail-ink">Mates</span></span>
      </RouterLink>

      <nav aria-label="Navegación principal" class="hidden items-center gap-6 sm:flex">
        <RouterLink to="/rides" class="text-sm text-graphite transition-colors hover:text-ink">
          Explorar rutas
        </RouterLink>

        <RouterLink to="/community" class="text-sm text-graphite transition-colors hover:text-ink">
          Comunidad
        </RouterLink>
      </nav>

      <div class="flex items-center gap-3">
        <span v-if="!isInitialized" class="text-sm text-graphite"> Comprobando sesión… </span>

        <template v-else-if="user">
          <RouterLink
            to="/profile"
            class="rounded-btn border border-line px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-trail hover:text-trail-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-trail"
          >
            Mi perfil
          </RouterLink>

          <button
            type="button"
            :disabled="isLoggingOut"
            @click="handleLogout"
            class="rounded-btn bg-trail px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-trail-deep focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink disabled:cursor-not-allowed disabled:opacity-60"
          >
            {{ isLoggingOut ? 'Cerrando sesión…' : 'Cerrar sesión' }}
          </button>
        </template>

        <template v-else>
          <RouterLink
            to="/login"
            class="shrink-0 rounded-btn border border-line px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-trail hover:text-trail-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-trail"
          >
            Iniciar sesión
          </RouterLink>

          <RouterLink
            to="/register"
            class="hidden rounded-btn bg-trail px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-trail-deep focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink sm:inline-flex"
          >
            Registrarse
          </RouterLink>
        </template>
      </div>
    </div>

    <p v-if="logoutError" role="alert" class="px-4 pb-3 text-sm text-red-600 sm:px-6">
      {{ logoutError }}
    </p>
  </header>
</template>
