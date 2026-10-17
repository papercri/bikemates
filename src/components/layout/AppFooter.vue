<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/features/auth/stores/authStore'

const year = computed(() => new Date().getFullYear())

const { user } = storeToRefs(useAuthStore())

const linkClasses =
  'text-sm font-medium text-graphite transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink'
</script>

<template>
  <footer class="border-t border-line bg-canvas">
    <div class="mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 py-8 sm:px-6 lg:px-8">
      <nav
        aria-label="Enlaces del pie"
        class="flex flex-wrap items-center justify-center gap-x-8 gap-y-2"
      >
        <RouterLink to="/rides" :class="linkClasses">Explorar rutas</RouterLink>
        <RouterLink v-if="!user" to="/login" :class="linkClasses">Iniciar sesión</RouterLink>
        <RouterLink to="/privacy" :class="linkClasses">Política de privacidad</RouterLink>
      </nav>

      <p class="max-w-2xl text-center text-xs leading-5 text-graphite">
        © {{ year }} BikeMates · Comparte rutas. Comparte kilómetros. · by
        <a
          href="https://frontend-ux.website/"
          target="_blank"
          rel="noopener noreferrer"
          class="text-graphite underline-offset-4 transition-colors hover:text-ink hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        >
          Cristiana Sollini
        </a>
      </p>
    </div>
  </footer>
</template>
