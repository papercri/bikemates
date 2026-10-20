<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/features/auth/stores/authStore'
import BrandLogo from '@/components/icons/BrandLogo.vue'

const year = computed(() => new Date().getFullYear())

const { user } = storeToRefs(useAuthStore())

const linkClasses =
  'text-sm text-white/70 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white'

const serviceLinkClasses =
  'text-sm text-white/60 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white'
</script>

<template>
  <footer class="bg-charcoal">
    <div class="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div class="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between lg:gap-8">
        <!-- Marca -->
        <div class="shrink-0">
          <RouterLink
            to="/"
            class="inline-flex items-center gap-2.5 text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            aria-label="BikeMates, página de inicio"
          >
            <BrandLogo />
            <span class="font-display text-lg font-medium tracking-tight">BikeMates</span>
          </RouterLink>

          <p class="mt-3 max-w-xs text-sm leading-6 text-white/50">
            Comparte rutas. Comparte kilómetros.
          </p>
        </div>

        <!-- Enlaces principales -->
        <nav aria-label="Enlaces del pie" class="flex flex-col gap-3">
          <h2 class="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-white/40">
            Explora
          </h2>

          <div class="flex flex-col gap-2.5">
            <RouterLink to="/" :class="linkClasses">Inicio</RouterLink>
            <RouterLink to="/rides" :class="linkClasses">Explorar rutas</RouterLink>
            <RouterLink v-if="user" to="/rides/create" :class="linkClasses">
              Publicar ruta
            </RouterLink>
            <RouterLink v-if="!user" to="/login" :class="linkClasses">Iniciar sesión</RouterLink>
            <RouterLink v-else to="/profile" :class="linkClasses">Mi perfil</RouterLink>
          </div>
        </nav>

        <!-- Servicio -->
        <nav aria-label="Enlaces de servicio" class="flex flex-col gap-3">
          <h2 class="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-white/40">
            Servicio
          </h2>

          <div class="flex flex-col gap-2.5">
            <RouterLink to="/community-rules" :class="serviceLinkClasses">
              Normas de la comunidad
            </RouterLink>
            <RouterLink to="/privacy" :class="serviceLinkClasses">
              Política de privacidad
            </RouterLink>
          </div>
        </nav>
      </div>

      <div
        class="mt-12 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between"
      >
        <p>© {{ year }} BikeMates. Todos los derechos reservados.</p>

        <p>
          by
          <a
            href="https://frontend-ux.website/"
            target="_blank"
            rel="noopener noreferrer"
            class="text-white/50 underline-offset-4 transition-colors hover:text-white hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Cristiana Sollini
          </a>
        </p>
      </div>
    </div>
  </footer>
</template>
