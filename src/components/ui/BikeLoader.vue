<script setup lang="ts">
withDefaults(defineProps<{ label?: string }>(), { label: 'Cargando…' })
</script>

<template>
  <div
    role="status"
    aria-live="polite"
    class="flex flex-col items-center justify-center gap-3 py-6"
  >
    <svg viewBox="0 0 128 64" class="h-14 w-28" aria-hidden="true" fill="none">
      <!-- Rastro verde: el guion fluye para simular avance. -->
      <path
        d="M6 54 H122"
        class="trail text-trail"
        stroke="currentColor"
        stroke-opacity="0.6"
        stroke-width="2"
        stroke-dasharray="5 7"
        stroke-linecap="round"
      />

      <g
        class="bike"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <circle cx="42" cy="42" r="10" />
        <circle cx="90" cy="42" r="10" />
        <!-- Cuadro, horquilla y tirador. -->
        <path
          d="M62 42 L54 22 M54 22 L78 22 M62 42 L78 22 M62 42 L42 42 M54 22 L42 42 M78 22 L90 42 M78 22 L76 16"
        />
        <!-- Manillar y sillín. -->
        <path d="M71 16 L81 16 M50 21 L58 21" />
      </g>
    </svg>

    <span class="text-sm text-graphite">{{ label }}</span>
  </div>
</template>

<style scoped>
@keyframes bike-trail {
  to {
    stroke-dashoffset: -24;
  }
}

@keyframes bike-bob {
  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-1.5px);
  }
}

.trail {
  animation: bike-trail 0.9s linear infinite;
}

.bike {
  animation: bike-bob 1.6s ease-in-out infinite;
}

@media (prefers-reduced-motion: reduce) {
  .trail,
  .bike {
    animation: none;
  }
}
</style>
