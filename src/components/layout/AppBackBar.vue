<script setup lang="ts">
import { useRouter, type RouteLocationRaw } from 'vue-router'
import IconArrow from '@/components/icons/IconArrow.vue'

const props = withDefaults(
  defineProps<{
    /** Destino si el usuario llega directamente y no hay historial previo. */
    fallback?: RouteLocationRaw
  }>(),
  {
    fallback: '/',
  },
)

const router = useRouter()

/** Volver al paso anterior del historial; sin historial, al destino de respaldo. */
function handleBack(): void {
  if (window.history.state?.back) {
    router.back()
  } else {
    void router.push(props.fallback)
  }
}
</script>

<template>
  <div>
    <button
      type="button"
      class="inline-flex items-center gap-1.5 text-sm text-graphite transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
      @click="handleBack"
    >
      <IconArrow direction="left" aria-hidden="true" />
      Volver
    </button>
  </div>
</template>
