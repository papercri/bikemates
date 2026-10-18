<template>
  <!--
    Cresta con sendero animado y bici que pedalea por él: la única animación
    con sentido de esta tira (el camino está hecho para rodar). El grafismo
    concentra su contenido en la banda central del viewBox para que el recorte
    de `slice` no lo corte nunca, a ningún ancho.
  -->
  <svg
    viewBox="0 0 800 80"
    preserveAspectRatio="xMidYMid slice"
    class="block h-14 w-full sm:h-16"
    aria-hidden="true"
    focusable="false"
  >
    <!-- Sol de la escala de color (naranja de ruta). -->
    <circle cx="660" cy="34" r="7" fill="var(--color-level-medium)" opacity="0.9" />
    <circle
      cx="660"
      cy="34"
      r="12"
      fill="none"
      stroke="var(--color-level-medium)"
      stroke-opacity="0.35"
    />

    <!-- Cresta: relleno surface con filete hairline; el relleno llega al
         borde inferior del viewBox, así el recorte superior no deja huecos. -->
    <path
      d="M0 80 V44 L100 30 L200 42 L320 26 L460 46 L580 28 L700 48 L800 36 V80 Z"
      fill="var(--color-surface)"
    />
    <path
      d="M0 44 L100 30 L200 42 L320 26 L460 46 L580 28 L700 48 L800 36"
      fill="none"
      stroke="var(--color-line-strong)"
      stroke-width="1.5"
      stroke-linejoin="round"
    />

    <!-- Sendero de la marca: verde de nivel con dash animado (token de tema). -->
    <path
      d="M 20 52 C 150 46, 250 58, 390 50 S 630 42, 780 48"
      fill="none"
      stroke="var(--color-level-easy)"
      stroke-width="2"
      stroke-dasharray="5 8"
      stroke-linecap="round"
      vector-effect="non-scaling-stroke"
      class="motion-safe:animate-trail-dash"
    />

    <!-- Bici que rueda por el sendero (izquierda a derecha, fuera de pantalla
         en ambos extremos para que el reinicio del bucle no se vea). -->
    <g class="bm-ridge-bike">
      <g
        fill="none"
        stroke="var(--color-ink)"
        stroke-width="1.3"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <circle cx="-6.5" cy="0" r="3.3" stroke-dasharray="2.3 2.3" class="bm-ridge-wheel" />
        <circle cx="6.5" cy="0" r="3.3" stroke-dasharray="2.3 2.3" class="bm-ridge-wheel" />
        <path d="M-6.5 0 L-1 -6 L4.5 -6 L6.5 0 M-1 -6 L1.5 0 M1.5 0 L4.5 -6" />
        <path d="M-2.6 -6.5 L0.4 -6.5" stroke-width="1.6" />
        <path d="M4.5 -6 L5.4 -8.2 M4.2 -8.2 L6.6 -8.2" />
      </g>
    </g>
  </svg>
</template>

<style scoped>
@keyframes bm-bike-ride {
  0% {
    transform: translate(-40px, 52px);
  }
  30% {
    transform: translate(220px, 55px);
  }
  65% {
    transform: translate(500px, 47px);
  }
  100% {
    transform: translate(840px, 50px);
  }
}

@keyframes bm-ridge-wheel-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: no-preference) {
  .bm-ridge-bike {
    transform: translate(-40px, 52px);
    animation: bm-bike-ride 13s linear infinite;
  }

  .bm-ridge-wheel {
    transform-box: fill-box;
    transform-origin: center;
    animation: bm-ridge-wheel-spin 0.8s linear infinite;
  }
}

/* Sin soporte de motion la bici aparece ya en su sitio, sobre el sendero. */
@media (prefers-reduced-motion: reduce) {
  .bm-ridge-bike {
    transform: translate(390px, 50px);
  }
}
</style>
