<script setup lang="ts">
withDefaults(
  defineProps<{
    id?: string
  }>(),
  {
    id: undefined,
  },
)
</script>

<template>
  <p :id="id" class="text-xs text-graphite">
    <slot />
  </p>
</template>
