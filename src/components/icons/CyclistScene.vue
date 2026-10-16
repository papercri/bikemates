<template>
  <svg
    viewBox="0 0 480 340"
    class="w-full drop-shadow-sm"
    role="img"
    aria-label="Ilustración de un ciclista pedaleando por una cordillera alpina"
  >
    <!-- Sol -->
    <circle cx="372" cy="64" r="34" fill="var(--color-route)" />
    <circle
      cx="372"
      cy="64"
      r="48"
      fill="none"
      stroke="var(--color-route)"
      stroke-opacity="0.3"
      stroke-width="2"
    />

    <!-- Cielo -->
    <g fill="none" stroke="var(--color-line)" stroke-width="1.2" opacity="0.9">
      <path d="M20 70 C 90 40, 170 95, 250 60 S 400 30, 470 75" />
      <path d="M20 105 C 100 75, 180 125, 260 95 S 410 65, 470 110" />
    </g>

    <!-- Montañas fondo -->
    <path
      d="M0 250 L70 170 L130 225 L210 130 L290 220 L360 160 L480 250 V340 H0 Z"
      fill="var(--color-surface)"
    />
    <path
      d="M0 250 L70 170 L130 225 L210 130 L290 220 L360 160 L480 250"
      fill="none"
      stroke="var(--color-line)"
      stroke-width="2"
      stroke-linejoin="round"
    />

    <!-- Montañas frente -->
    <path
      d="M0 300 L90 245 L170 285 L260 230 L340 285 L420 250 L480 290 V340 H0 Z"
      fill="var(--color-canvas)"
      stroke="var(--color-line)"
      stroke-width="2"
      stroke-linejoin="round"
    />

    <!-- Vegetación -->
    <g fill="var(--color-ink)" opacity="0.14">
      <path d="M52 248 l7 0 l-3.5 -16 z" />
      <path d="M62 252 l9 0 l-4.5 -20 z" />
      <path d="M318 282 l7 0 l-3.5 -16 z" />
      <path d="M329 286 l9 0 l-4.5 -20 z" />
      <path d="M196 236 l6 0 l-3 -13 z" />
    </g>

    <!-- Sendero animado -->
    <path
      class="trail-animated"
      d="M30 312 C 120 292, 200 322, 290 300 S 420 286, 458 302"
      fill="none"
      stroke="var(--color-trail)"
      stroke-width="3"
      stroke-dasharray="7 9"
      stroke-linecap="round"
    />

    <!-- Ciclista mirando a la derecha -->
    <g
      transform="translate(376 268) scale(1.15)"
      stroke="var(--color-ink)"
      fill="none"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <circle cx="5" cy="13" r="4.2" />
      <circle cx="21" cy="13" r="4.2" />
      <path d="M5 13 L10 13 L13 5.5 L17.5 5.5 L21 13" />
      <path d="M10 13 L13 5.5" />
      <circle cx="10" cy="13" r="1.4" fill="var(--color-trail)" stroke="none" />
      <path d="M12 5 L15 2.2 L17.2 1.2" />
      <circle cx="18.8" cy="0.8" r="1.9" fill="var(--color-ink)" stroke="none" />
      <path d="M14.6 3 L17 6.2 L16.2 9.5 L13.2 12.5" />
      <path d="M12.4 5.4 L14.8 8.8 L11.6 12.2" />
    </g>
  </svg>
</template>

<style scoped>
@keyframes trail-forward {
  to {
    /* El valor positivo invierte el sentido del recorrido */
    stroke-dashoffset: 32;
  }
}

@media (prefers-reduced-motion: no-preference) {
  .trail-animated {
    animation: trail-forward 3s linear infinite;
  }
}
</style>
