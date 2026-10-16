<template>
  <svg
    viewBox="0 0 480 340"
    class="w-full"
    role="img"
    aria-label="Ilustración de un ciclista pedaleando frente a una cordillera"
  >
    <!-- Sol -->
    <g class="sun">
      <circle cx="372" cy="64" r="34" fill="var(--color-canvas)" />
      <circle
        class="sun-ring sun-ring-1"
        cx="372"
        cy="64"
        r="48"
        fill="none"
        stroke="var(--color-canvas)"
        stroke-opacity="0.35"
        stroke-width="2"
      />
      <circle
        class="sun-ring sun-ring-2"
        cx="372"
        cy="64"
        r="62"
        fill="none"
        stroke="var(--color-canvas)"
        stroke-opacity="0.22"
        stroke-width="2"
      />
    </g>

    <!-- Cielo -->
    <g fill="none" stroke="var(--color-canvas)" stroke-opacity="0.3" stroke-width="1.2">
      <path d="M20 70 C 90 40, 170 95, 250 60 S 400 30, 470 75" />
      <path d="M20 105 C 100 75, 180 125, 260 95 S 410 65, 470 110" />
    </g>

    <!-- Cordillera: banda entre la cresta trasera y la delantera -->
    <path
      d="M0 250 L70 170 L130 225 L210 130 L290 220 L360 160 L480 250 L480 290 L420 250 L340 285 L260 230 L170 285 L90 245 L0 300 Z"
      fill="var(--color-route)"
    />
    <path
      d="M0 250 L70 170 L130 225 L210 130 L290 220 L360 160 L480 250"
      fill="none"
      stroke="var(--color-canvas)"
      stroke-opacity="0.55"
      stroke-width="2"
      stroke-linejoin="round"
    />
    <path
      d="M0 300 L90 245 L170 285 L260 230 L340 285 L420 250 L480 290"
      fill="none"
      stroke="var(--color-canvas)"
      stroke-opacity="0.45"
      stroke-width="2"
      stroke-linejoin="round"
    />

    <!-- Vegetación sobre la ladera -->
    <g fill="var(--color-turf)">
      <path d="M52 258 l7 0 l-3.5 -16 z" />
      <path d="M62 262 l9 0 l-4.5 -20 z" />
      <path d="M318 266 l7 0 l-3.5 -16 z" />
      <path d="M329 270 l9 0 l-4.5 -20 z" />
      <path d="M196 250 l6 0 l-3 -13 z" />
    </g>

    <!-- Trazado de la ruta: primero se dibuja, después las marcas avanzan -->
    <path
      class="route-draw"
      pathLength="1"
      d="M30 312 C 120 292, 200 322, 290 300 S 420 286, 458 302"
      fill="none"
      stroke="var(--color-route)"
      stroke-width="3"
      stroke-linecap="round"
    />
    <path
      class="route-dash"
      d="M30 312 C 120 292, 200 322, 290 300 S 420 286, 458 302"
      fill="none"
      stroke="var(--color-canvas)"
      stroke-width="3"
      stroke-dasharray="7 9"
      stroke-linecap="round"
    />

    <!-- Ciclista mirando a la derecha -->
    <g
      class="cyclist"
      transform="translate(376 268) scale(1.15)"
      stroke="var(--color-canvas)"
      fill="none"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <circle cx="5" cy="13" r="4.2" />
      <circle cx="21" cy="13" r="4.2" />
      <path d="M5 13 L10 13 L13 5.5 L17.5 5.5 L21 13" />
      <path d="M10 13 L13 5.5" />
      <circle cx="10" cy="13" r="1.4" fill="var(--color-route)" stroke="none" />
      <path d="M12 5 L15 2.2 L17.2 1.2" />
      <circle cx="18.8" cy="0.8" r="1.9" fill="var(--color-canvas)" stroke="none" />
      <path d="M14.6 3 L17 6.2 L16.2 9.5 L13.2 12.5" />
      <path d="M12.4 5.4 L14.8 8.8 L11.6 12.2" />
    </g>
  </svg>
</template>

<style scoped>
/* Una sola secuencia de entrada: el sol sube, el trazado se dibuja y el
   ciclista aparece. Después solo sigue la marcha de las marcas del recorrido. */
@media (prefers-reduced-motion: no-preference) {
  .sun {
    animation: sun-rise 0.7s cubic-bezier(0.22, 0.8, 0.3, 1) 0.05s backwards;
  }

  .sun-ring {
    transform-box: fill-box;
    transform-origin: center;
    animation: ring-expand 0.9s cubic-bezier(0.22, 0.8, 0.3, 1) backwards;
  }

  .sun-ring-1 {
    animation-delay: 0.25s;
  }

  .sun-ring-2 {
    animation-delay: 0.4s;
  }

  .route-draw {
    stroke-dasharray: 1;
    stroke-dashoffset: 0;
    animation: route-draw 1.1s cubic-bezier(0.4, 0, 0.2, 1) 0.5s backwards;
  }

  .route-dash {
    animation:
      fade-in 0.4s ease 1.3s backwards,
      route-crawl 3s linear 1.7s infinite;
  }

  .cyclist {
    animation: fade-in 0.5s ease 1.1s backwards;
  }
}

@keyframes sun-rise {
  from {
    transform: translateY(28px);
    opacity: 0;
  }
}

@keyframes ring-expand {
  from {
    transform: scale(0.55);
    opacity: 0;
  }
}

@keyframes route-draw {
  from {
    stroke-dashoffset: 1;
  }
}

@keyframes route-crawl {
  /* El valor positivo invierte el sentido del recorrido */
  to {
    stroke-dashoffset: 32;
  }
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
}
</style>
