<script setup lang="ts">
import { faBicycle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { useRouter, type RouteLocationRaw } from 'vue-router'
import Button from '@/components/ui/Button.vue'
import IconArrow from '@/components/icons/IconArrow.vue'

const props = withDefaults(
  defineProps<{
    /** Destino si el usuario llega directamente y no hay historial previo. */
    fallback?: RouteLocationRaw
    /** Muestra el enlace "Ver todas las rutas" a la derecha. */
    showAllRidesLink?: boolean
  }>(),
  {
    fallback: '/',
    showAllRidesLink: false,
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
  <div class="flex flex-wrap items-center justify-between gap-3">
    <button
      type="button"
      class="inline-flex items-center gap-1.5 text-sm text-graphite transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
      @click="handleBack"
    >
      <IconArrow direction="left" aria-hidden="true" />
      Volver
    </button>

   <!--  <Button v-if="showAllRidesLink" to="/rides" variant="outline" size="sm">
      <FontAwesomeIcon :icon="faBicycle" aria-hidden="true" class="size-3.5" />
      Ver todas las rutas
    </Button> -->
  </div>
</template>
