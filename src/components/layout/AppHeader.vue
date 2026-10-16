<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import BrandLogo from '@/components/icons/BrandLogo.vue'
import Alert from '@/components/ui/Alert.vue'
import Button from '@/components/ui/Button.vue'
import { useAuthStore } from '@/features/auth/stores/authStore'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const { user, isInitialized } = storeToRefs(authStore)

const isLoggingOut = ref(false)
const logoutError = ref('')

const isMenuOpen = ref(false)
const menuId = 'primary-mobile-nav'
const menuButton = ref<HTMLButtonElement | null>(null)

const menuLinkClasses =
  'block rounded-btn px-3 py-3 text-base text-ink transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-trail'

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

function toggleMenu(): void {
  isMenuOpen.value = !isMenuOpen.value
}

function handleKeydown(event: KeyboardEvent): void {
  if (event.key !== 'Escape' || !isMenuOpen.value) return

  isMenuOpen.value = false
  menuButton.value?.focus()
}

watch(isMenuOpen, (isOpen) => {
  if (isOpen) {
    document.addEventListener('keydown', handleKeydown)
    return
  }

  document.removeEventListener('keydown', handleKeydown)
})

// Navegar desde el menú lo cierra, sin repetir el cierre en cada enlace.
watch(
  () => route.fullPath,
  () => {
    isMenuOpen.value = false
  },
)

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <header class="sticky top-0 z-40 border-b border-line bg-canvas text-ink">
    <div
      class="mx-auto flex max-w-7xl items-center justify-between gap-x-4 px-4 py-3 sm:px-6 lg:px-8"
    >
      <RouterLink
        to="/"
        class="flex shrink-0 items-center gap-2.5 text-xl font-bold tracking-tight text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-trail"
        aria-label="BikeMates, página de inicio"
      >
        <BrandLogo />
        <span>Bike<span class="text-trail-ink">Mates</span></span>
      </RouterLink>

      <nav aria-label="Navegación principal" class="hidden items-center gap-6 sm:flex">
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

      <div class="hidden items-center justify-end gap-2 sm:flex sm:gap-3">
        <span v-if="!isInitialized" class="text-sm text-graphite"> Comprobando sesión… </span>

        <template v-else-if="user">
          <Button to="/profile" variant="outline" size="sm"> Mi perfil </Button>

          <Button variant="primary" size="sm" :loading="isLoggingOut" @click="handleLogout">
            {{ isLoggingOut ? 'Cerrando sesión…' : 'Cerrar sesión' }}
          </Button>
        </template>

        <template v-else>
          <Button to="/login" variant="outline" size="sm" class="shrink-0"> Iniciar sesión </Button>

          <Button to="/register" variant="primary" size="sm" class="shrink-0"> Registrarse </Button>
        </template>
      </div>

      <button
        ref="menuButton"
        type="button"
        class="-mr-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-btn text-ink transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-trail sm:hidden"
        :aria-expanded="isMenuOpen"
        :aria-controls="menuId"
        @click="toggleMenu"
      >
        <span class="sr-only">{{ isMenuOpen ? 'Cerrar menú' : 'Abrir menú' }}</span>
        <span aria-hidden="true" class="relative block h-4 w-5">
          <span
            class="absolute inset-x-0 top-0 h-0.5 rounded-full bg-ink motion-safe:duration-200 motion-safe:transition-transform"
            :class="isMenuOpen ? 'translate-y-1.5 rotate-45' : ''"
          />
          <span
            class="absolute inset-x-0 top-1.5 h-0.5 rounded-full bg-ink motion-safe:transition-opacity"
            :class="isMenuOpen ? 'opacity-0' : 'opacity-100'"
          />
          <span
            class="absolute inset-x-0 top-3 h-0.5 rounded-full bg-ink motion-safe:duration-200 motion-safe:transition-transform"
            :class="isMenuOpen ? '-translate-y-1.5 -rotate-45' : ''"
          />
        </span>
      </button>
    </div>

    <Transition
      enter-active-class="motion-safe:ease-out motion-safe:transition motion-safe:duration-200"
      enter-from-class="motion-safe:-translate-y-1 motion-safe:opacity-0"
      leave-active-class="motion-safe:ease-in motion-safe:transition motion-safe:duration-150"
      leave-to-class="motion-safe:opacity-0"
    >
      <div v-show="isMenuOpen" :id="menuId" class="border-t border-line bg-canvas sm:hidden">
        <nav aria-label="Navegación principal" class="mx-auto max-w-7xl px-4 py-3 sm:px-6">
          <ul class="flex flex-col">
            <li>
              <RouterLink to="/rides" :class="menuLinkClasses">Explorar rutas</RouterLink>
            </li>
            <li v-if="user">
              <RouterLink to="/rides/create" :class="menuLinkClasses">Publicar ruta</RouterLink>
            </li>
          </ul>

          <div class="flex flex-col gap-2 border-t border-line pt-3">
            <span v-if="!isInitialized" class="px-3 py-2 text-sm text-graphite">
              Comprobando sesión…
            </span>

            <template v-else-if="user">
              <RouterLink to="/profile" :class="menuLinkClasses">Mi perfil</RouterLink>

              <Button
                variant="outline"
                size="sm"
                block
                :loading="isLoggingOut"
                @click="handleLogout"
              >
                {{ isLoggingOut ? 'Cerrando sesión…' : 'Cerrar sesión' }}
              </Button>
            </template>

            <template v-else>
              <RouterLink to="/login" :class="menuLinkClasses">Iniciar sesión</RouterLink>

              <Button to="/register" variant="primary" size="sm" block> Registrarse </Button>
            </template>
          </div>
        </nav>
      </div>
    </Transition>

    <Alert v-if="logoutError" class="px-4 pb-3 sm:px-6">
      {{ logoutError }}
    </Alert>
  </header>
</template>
