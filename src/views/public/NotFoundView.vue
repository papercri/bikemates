<script setup lang="ts">
import { useHead } from '@unhead/vue'
import AppPage from '@/components/layout/AppPage.vue'
import Button from '@/components/ui/Button.vue'
import EmptyState from '@/components/ui/EmptyState.vue'

useHead({
  title: 'Página no encontrada | BikeMates',
  meta: [
    {
      name: 'robots',
      content: 'noindex',
    },
    {
      name: 'description',
      content: 'La página que buscas no existe o ha cambiado de dirección.',
    },
  ],
})
</script>

<template>
  <AppPage>
    <EmptyState
      v-reveal
      title-as="h1"
      title="Página no encontrada"
      description="La página que buscas no existe o ha cambiado de dirección. Puedes volver al inicio o explorar las rutas disponibles."
      class="text-center"
    >
      <div class="flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Button to="/">Volver al inicio</Button>
        <Button to="/rides" variant="outline">Explorar rutas</Button>
      </div>
    </EmptyState>
  </AppPage>
</template>
