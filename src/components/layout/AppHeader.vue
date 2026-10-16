<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import BrandLogo from '@/components/icons/BrandLogo.vue'
import Alert from '@/components/ui/Alert.vue'
import Button from '@/components/ui/Button.vue'
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
      class="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-4 gap-y-3 px-4 py-4 sm:px-6 lg:px-8"
    >
      <RouterLink
        to="/"
        class="flex shrink-0 items-center gap-2.5 text-xl font-bold tracking-tight text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-trail"
        aria-label="BikeMates, página de inicio"
      >
        <BrandLogo />
        <span>Bike<span class="text-trail-ink">Mates</span></span>
      </RouterLink>

      <nav
        aria-label="Navegación principal"
        class="order-3 hidden items-center gap-6 sm:order-none sm:flex"
      >
        <RouterLink
          to="/rides"
          class="text-sm text-graphite transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-trail"
        >
          Explorar rutas
        </RouterLink>
        <RouterLink
          v-if="user"
          to="/rides/create"
          class="text-sm text-graphite transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-trail"
        >
          Publicar ruta
        </RouterLink>
      </nav>

      <div class="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
        <span v-if="!isInitialized" class="text-sm text-graphite"> Comprobando sesión… </span>

        <template v-else-if="user">
          <Button to="/profile" variant="outline" size="sm">
            Mi perfil
          </Button>

          <Button variant="primary" size="sm" :loading="isLoggingOut" @click="handleLogout">
            {{ isLoggingOut ? 'Cerrando sesión…' : 'Cerrar sesión' }}
          </Button>
        </template>

        <template v-else>
          <Button to="/login" variant="outline" size="sm" class="shrink-0"> Iniciar sesión </Button>

          <Button to="/register" variant="primary" size="sm" class="shrink-0">
            Registrarse
          </Button>
        </template>
      </div>
    </div>

    <Alert v-if="logoutError" class="px-4 pb-3 sm:px-6">
      {{ logoutError }}
    </Alert>
  </header>
</template>
