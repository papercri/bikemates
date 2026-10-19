<script setup lang="ts">
import { onMounted, ref } from 'vue'

const STORAGE_KEY = 'bm-cookie-consent'

const isVisible = ref(false)

onMounted(() => {
  isVisible.value = localStorage.getItem(STORAGE_KEY) !== 'accepted'
})

function accept(): void {
  localStorage.setItem(STORAGE_KEY, 'accepted')
  isVisible.value = false
}
</script>

<template>
  <div
    v-if="isVisible"
    role="dialog"
    aria-label="Aviso de cookies"
    class="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-canvas/95 backdrop-blur-sm"
  >
    <div
      class="mx-auto flex max-w-7xl flex-col items-start gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8"
    >
      <p class="text-xs leading-5 text-graphite">
        Esta web no usa cookies de rastreo. Solo guardamos tu preferencia de este aviso en tu
        navegador.
      </p>

      <button
        type="button"
        class="shrink-0 rounded-btn border border-line-strong bg-canvas px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:border-graphite hover:bg-snow focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        @click="accept"
      >
        Entendido
      </button>
    </div>
  </div>
</template>
