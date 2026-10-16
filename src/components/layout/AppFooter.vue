<script setup lang="ts">
import { computed } from 'vue'

const year = computed(() => new Date().getFullYear())

const linkClasses =
  'text-xs text-graphite transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-trail'
</script>

<template>
  <footer class="border-t border-line bg-canvas">
    <div class="mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 py-8 sm:px-6 lg:px-8">
      <nav
        aria-label="Enlaces del pie"
        class="flex flex-wrap items-center justify-center gap-x-6 gap-y-2"
      >
        <RouterLink to="/rides" :class="linkClasses">Explorar rutas</RouterLink>
        <RouterLink to="/login" :class="linkClasses">Iniciar sesión</RouterLink>
        <RouterLink to="/privacy" :class="linkClasses">Política de privacidad</RouterLink>
      </nav>

      <p class="text-center text-xs leading-5 text-graphite">
        © {{ year }} BikeMates · Comparte rutas. Comparte kilómetros. · by
        <a
          href="https://frontend-ux.website/"
          target="_blank"
          rel="noopener noreferrer"
          class="text-graphite transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-trail"
        >
          Cristiana Sollini
        </a>
      </p>
    </div>
  </footer>
</template>
