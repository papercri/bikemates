<script setup lang="ts">
import { computed } from 'vue'

const year = computed(() => new Date().getFullYear())
</script>

<template>
  <footer class="border-t border-line bg-canvas">
    <div class="mx-auto flex max-w-7xl flex-col items-center gap-1.5 px-4 py-6 sm:px-6 lg:px-8">
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

      <RouterLink
        to="/privacy"
        class="text-xs text-graphite transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-trail"
      >
        Política de privacidad
      </RouterLink>
    </div>
  </footer>
</template>
