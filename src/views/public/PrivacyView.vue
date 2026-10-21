<script setup lang="ts">
import { useHead } from '@unhead/vue'
import AppPage from '@/components/layout/AppPage.vue'
import PrivacyContent from '@/components/legal/PrivacyContent.vue'
import Typography from '@/components/ui/Typography.vue'

useHead({
  title: 'Política de privacidad | BikeMates',
  meta: [
    {
      name: 'description',
      content:
        'Cómo trata BikeMates tus datos personales: responsable, datos recogidos, finalidad, conservación, destinatarios, seguridad, cookies y derechos. Proyecto personal sin fines comerciales.',
    },
  ],
})
</script>

<template>
  <AppPage>
    <div class="mx-auto max-w-2xl">
      <Typography as="h1" variant="heading-xl">Política de privacidad</Typography>

      <PrivacyContent />
    </div>
  </AppPage>
</template>
