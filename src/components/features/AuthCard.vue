<script setup lang="ts">
import RidgeStrip from '@/components/common/RidgeStrip.vue'
import Card from '@/components/ui/Card.vue'
import Typography from '@/components/ui/Typography.vue'

defineProps<{
  title: string
  description: string
}>()
</script>

<template>
  <Card>
    <RidgeStrip />

    <div class="p-6 pt-4 sm:p-8 sm:pt-5">
      <Typography as="h1" variant="heading-lg">{{ title }}</Typography>
      <Typography class="mt-3" tone="muted">{{ description }}</Typography>

      <slot />
    </div>
  </Card>
</template>
