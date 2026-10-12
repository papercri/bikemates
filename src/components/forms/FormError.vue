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
  <p :id="id" class="mt-2 text-sm text-red-600">
    <slot />
  </p>
</template>
