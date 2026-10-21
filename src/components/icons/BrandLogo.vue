<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'full' | 'simple'
  }>(),
  {
    variant: 'full',
  },
)
</script>

<template>
  <svg
    v-if="variant === 'full'"
    viewBox="0 0 44 28"
    class="h-6 w-9 shrink-0 sm:h-7 sm:w-11"
    aria-hidden="true"
    focusable="false"
  >
    <path
      d="M2 22 L12 8 L18 15 L26 4 L42 22"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      opacity="0.2"
    />
    <g
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <circle cx="10" cy="20" r="5.5" />
      <circle cx="32" cy="20" r="5.5" />
      <path d="M10 20 L17 20 L20 10 L27 10 L32 20" />
      <path d="M17 20 L20 10" />
    </g>
    <circle cx="17" cy="20" r="1.6" fill="var(--color-trail)" />
  </svg>

  <svg v-else viewBox="0 0 44 28" class="h-9 w-12" aria-hidden="true" focusable="false">
    <g
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <circle cx="8" cy="20" r="5.5" />
      <circle cx="30" cy="20" r="5.5" />
      <path d="M8 20 L15 20 L18 10 L25 10 L30 20" />
      <path d="M15 20 L18 10" />
    </g>
  </svg>
</template>
