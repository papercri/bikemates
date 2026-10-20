<script setup lang="ts">
import { useHead } from '@unhead/vue'
import AppPage from '@/components/layout/AppPage.vue'
import CommunityRulesContent from '@/components/community/CommunityRulesContent.vue'
import Typography from '@/components/ui/Typography.vue'

useHead({
  title: 'Normas de la comunidad | BikeMates',
  meta: [
    {
      name: 'description',
      content:
        'Reglas de BikeMates para que las salidas sean seguras y divertidas: funcionamiento y responsabilidad, equipamiento obligatorio y comportamiento en la carretera.',
    },
  ],
})
</script>

<template>
  <AppPage>
    <div class="mx-auto max-w-2xl">
      <Typography as="h1" variant="heading-xl">Normas de la comunidad</Typography>

      <CommunityRulesContent class="mt-5" />
    </div>
  </AppPage>
</template>
