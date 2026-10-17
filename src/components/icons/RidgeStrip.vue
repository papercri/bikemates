<template>
  <svg
    viewBox="0 0 400 64"
    preserveAspectRatio="xMidYMax slice"
    class="block h-14 w-full sm:h-16"
    aria-hidden="true"
    focusable="false"
  >
    <circle cx="348" cy="18" r="10" fill="var(--color-route)" opacity="0.9" />
    <circle cx="348" cy="18" r="16" fill="none" stroke="var(--color-route)" stroke-opacity="0.35" />
    <path
      d="M0 64 V40 L60 18 L120 38 L190 10 L260 42 L330 22 L400 44 V64 Z"
      fill="var(--color-surface)"
    />
    <path
      d="M0 40 L60 18 L120 38 L190 10 L260 42 L330 22 L400 44"
      fill="none"
      stroke="var(--color-line)"
      stroke-width="2"
      stroke-linejoin="round"
    />
    <!-- Sendero animado con tono trail -->
    <path
      d="M10 52 C 80 44, 140 58, 200 48 S 330 40, 392 50"
      fill="none"
      stroke="var(--color-route)"
      stroke-width="2"
      stroke-dasharray="5 7"
      vector-effect="non-scaling-stroke"
      class="motion-safe:animate-trail-dash"
    />
    <!-- Bici simple sobre el sendero -->
    <g
      transform="translate(178, 30)"
      fill="none"
      stroke="var(--color-ink)"
      stroke-width="1.6"
      stroke-linecap="round"
      stroke-linejoin="round"
      opacity="0.85"
    >
      <circle cx="6" cy="10" r="4.5" />
      <circle cx="22" cy="10" r="4.5" />
      <path d="M6 10 L12 10 L15 2 L20 2 L22 10" />
      <path d="M12 10 L15 2" />
      <circle cx="15" cy="2" r="1" fill="var(--color-route)" stroke="none" />
    </g>
  </svg>
</template>
