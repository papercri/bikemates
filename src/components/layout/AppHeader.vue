<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import {
  faBars,
  faBicycle,
  faCirclePlus,
  faRightFromBracket,
  faRightToBracket,
  faUserGear,
  faUserPlus,
  faXmark,
} from '@fortawesome/free-solid-svg-icons'
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

const isOverlay = computed(() => route.meta.overlayHeader === true)

// El panel móvil del menú lleva fondo sólido: canvas en modo normal y
// ink en overlay, así que el color de texto depende del modo.
function menuLinkClasses(path?: string): string {
  const base =
    'flex items-center gap-3 rounded-btn px-3 py-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2'
  const isActive = path !== undefined && isNavActive(path)

  if (isOverlay.value) {
    return isActive
      ? `${base} bg-white/15 text-white focus-visible:outline-canvas`
      : `${base} text-white hover:bg-white/10 focus-visible:outline-canvas`
  }

  return isActive
    ? `${base} bg-trail/10 text-trail-ink focus-visible:outline-ink`
    : `${base} text-ink hover:bg-surface focus-visible:outline-ink`
}

const navIdleClasses = computed(() =>
  isOverlay.value
    ? 'inline-flex items-center gap-2 rounded-btn px-3 py-1.5 text-sm font-medium text-white/90 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-canvas'
    : 'inline-flex items-center gap-2 rounded-btn px-3 py-1.5 text-sm font-medium text-graphite transition-colors hover:bg-surface hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink',
)

/** Estado activo con tinte verde de marca: el enlace de la sección actual se resalta sin depender solo del color. */
const navActiveClasses = computed(() =>
  isOverlay.value
    ? 'inline-flex items-center gap-2 rounded-btn px-3 py-1.5 bg-white/15 text-sm font-semibold text-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-canvas'
    : 'inline-flex items-center gap-2 rounded-btn px-3 py-1.5 bg-trail/10 text-sm font-semibold text-trail-ink transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink',
)

/** La sección activa abarca sus subrutas, excepto la creación de rutas. */
function isNavActive(path: string): boolean {
  if (route.path === path) return true
  if (path === '/rides') {
    return route.path.startsWith('/rides/') && !route.path.startsWith('/rides/create')
  }
  return false
}

function navLinkClasses(path: string): string {
  return isNavActive(path) ? navActiveClasses.value : navIdleClasses.value
}

const headerClasses = computed(() =>
  isOverlay.value
    ? 'fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-transparent text-white backdrop-blur-sm'
    : 'sticky top-0 z-40 border-b border-line bg-canvas/95 text-ink backdrop-blur',
)

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
  <header :class="headerClasses">
    <div
      class="mx-auto flex max-w-7xl items-center justify-between gap-x-4 px-4 py-3 sm:px-6 lg:px-8"
    >
      <RouterLink
        to="/"
        class="flex shrink-0 items-center gap-2.5 text-xl font-bold tracking-tight focus-visible:outline-2 focus-visible:outline-offset-2"
        :class="
          isOverlay
            ? 'text-white focus-visible:outline-canvas'
            : 'text-ink focus-visible:outline-ink'
        "
        aria-label="BikeMates, página de inicio"
      >
        <BrandLogo />
        <span>Bike<span :class="isOverlay ? 'text-white/70' : 'text-trail-ink'">Mates</span></span>
      </RouterLink>

      <nav aria-label="Navegación principal" class="hidden items-center gap-5 sm:flex">
        <RouterLink to="/rides" :class="navLinkClasses('/rides')">
          <FontAwesomeIcon :icon="faBicycle" aria-hidden="true" />
          Explorar rutas
        </RouterLink>
        <RouterLink v-if="user" to="/rides/create" :class="navLinkClasses('/rides/create')">
          <FontAwesomeIcon :icon="faCirclePlus" aria-hidden="true" />
          Publicar nueva ruta
        </RouterLink>
      </nav>

      <div class="hidden items-center justify-end gap-2 sm:flex">
        <span
          v-if="!isInitialized"
          class="text-xs"
          :class="isOverlay ? 'text-white/80' : 'text-graphite'"
        >
          Comprobando sesión…
        </span>

        <template v-else-if="user">
          <!-- Acciones de sesión compactas: solo icono, nombre accesible propio y globo de ayuda. -->
          <Button
            to="/profile"
            :variant="isOverlay ? 'sun-outline' : 'outline'"
            size="xs"
            class="group relative size-10"
          >
            <span class="sr-only">Mi perfil</span>
            <FontAwesomeIcon
              :icon="faUserGear"
              aria-hidden="true"
              class="size-5 transition-colors"
              :class="
                isOverlay
                  ? 'text-white/90 group-hover:text-white'
                  : 'text-graphite group-hover:text-ink'
              "
            />
            <span
              role="tooltip"
              aria-hidden="true"
              class="pointer-events-none absolute right-0 top-full z-20 mt-2 rounded-btn bg-ink px-2 py-1 text-xs font-medium whitespace-nowrap text-canvas opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
            >
              Mi perfil
            </span>
          </Button>

          <Button
            :variant="isOverlay ? 'sun-outline' : 'outline'"
            size="xs"
            class="group relative size-10"
            :loading="isLoggingOut"
            @click="handleLogout"
          >
            <span class="sr-only">Cerrar sesión</span>
            <FontAwesomeIcon
              v-if="!isLoggingOut"
              :icon="faRightFromBracket"
              aria-hidden="true"
              class="size-5 text-graphite transition-colors group-hover:text-ink"
            />
            <span
              role="tooltip"
              aria-hidden="true"
              class="pointer-events-none absolute right-0 top-full z-20 mt-2 rounded-btn bg-ink px-2 py-1 text-xs font-medium whitespace-nowrap text-canvas opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
            >
              Cerrar sesión
            </span>
          </Button>
        </template>

        <template v-else>
          <Button to="/login" :variant="isOverlay ? 'sun-outline' : 'outline'" size="xs">
            <FontAwesomeIcon :icon="faRightToBracket" aria-hidden="true" />
            Iniciar sesión
          </Button>

          <Button :to="'/register'" :variant="isOverlay ? 'sun' : 'primary'" size="xs">
            <FontAwesomeIcon :icon="faUserPlus" aria-hidden="true" />
            Registrarse
          </Button>
        </template>
      </div>

      <button
        ref="menuButton"
        type="button"
        class="-mr-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-btn border border-transparent text-lg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 sm:hidden"
        :class="
          isOverlay
            ? 'text-white hover:border-white/20 hover:bg-white/10 focus-visible:outline-canvas'
            : 'text-ink hover:border-line-strong hover:bg-surface focus-visible:outline-ink'
        "
        :aria-expanded="isMenuOpen"
        :aria-controls="menuId"
        @click="toggleMenu"
      >
        <span class="sr-only">{{ isMenuOpen ? 'Cerrar menú' : 'Abrir menú' }}</span>
        <FontAwesomeIcon :icon="isMenuOpen ? faXmark : faBars" aria-hidden="true" />
      </button>
    </div>

    <Transition
      enter-active-class="motion-safe:ease-out motion-safe:transition motion-safe:duration-200"
      enter-from-class="motion-safe:-translate-y-1 motion-safe:opacity-0"
      leave-active-class="motion-safe:ease-in motion-safe:transition motion-safe:duration-150"
      leave-to-class="motion-safe:opacity-0"
    >
      <!-- En overlay el panel lleva fondo sólido para que el menú sea legible sobre el hero. -->
      <div
        v-show="isMenuOpen"
        :id="menuId"
        class="border-t sm:hidden"
        :class="isOverlay ? 'border-white/10 bg-ink' : 'border-line bg-canvas'"
      >
        <nav aria-label="Navegación principal" class="mx-auto max-w-7xl px-4 py-3 sm:px-6">
          <ul class="flex flex-col">
            <li>
              <RouterLink to="/rides" :class="menuLinkClasses('/rides')">
                <FontAwesomeIcon :icon="faBicycle" aria-hidden="true" />
                Explorar rutas
              </RouterLink>
            </li>
            <li v-if="user">
              <RouterLink to="/rides/create" :class="menuLinkClasses('/rides/create')">
                <FontAwesomeIcon :icon="faCirclePlus" aria-hidden="true" />
                Publicar nueva ruta
              </RouterLink>
            </li>
          </ul>

          <div
            class="flex flex-col gap-2 border-t pt-3"
            :class="isOverlay ? 'border-white/10' : 'border-line'"
          >
            <span v-if="!isInitialized" class="px-3 py-2 text-sm text-graphite">
              Comprobando sesión…
            </span>

            <template v-else-if="user">
              <RouterLink to="/profile" :class="menuLinkClasses('/profile')">
                <FontAwesomeIcon :icon="faUserGear" aria-hidden="true" />
                Mi perfil
              </RouterLink>

              <Button
                variant="outline"
                size="sm"
                block
                :loading="isLoggingOut"
                @click="handleLogout"
              >
                <FontAwesomeIcon
                  v-if="!isLoggingOut"
                  :icon="faRightFromBracket"
                  aria-hidden="true"
                />
                {{ isLoggingOut ? 'Cerrando sesión…' : 'Cerrar sesión' }}
              </Button>
            </template>

            <template v-else>
              <RouterLink to="/login" :class="menuLinkClasses('/login')">
                <FontAwesomeIcon :icon="faRightToBracket" aria-hidden="true" />
                Iniciar sesión
              </RouterLink>

              <Button to="/register" variant="primary" size="sm" block>
                <FontAwesomeIcon :icon="faUserPlus" aria-hidden="true" />
                Registrarse
              </Button>
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
