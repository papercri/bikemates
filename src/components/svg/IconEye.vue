<script setup lang="ts">
withDefaults(
  defineProps<{
    /** Indica si el campo está oculto: `true` dibuja el ojo abierto y `false` el ojo tachado. */
    hidden?: boolean
  }>(),
  {
    hidden: true,
  },
)
</script>

<template>
  <svg
    viewBox="0 0 24 24"
    class="h-5 w-5"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <template v-if="hidden">
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="3" />
    </template>

    <template v-else>
      <path d="M3 3l18 18" />
      <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
      <path
        d="M9.9 5.2A10.8 10.8 0 0 1 12 5c6 0 9.5 7 9.5 7a18.5 18.5 0 0 1-2.7 3.6M6.7 6.8C3.8 8.7 2.5 12 2.5 12S6 19 12 19c1.4 0 2.7-.3 3.9-.8"
      />
    </template>
  </svg>
</template>
