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
    <path
      d="M10 52 C 80 44, 140 58, 200 48 S 330 40, 392 50"
      fill="none"
      stroke="var(--color-trail)"
      stroke-width="2"
      stroke-dasharray="5 7"
      vector-effect="non-scaling-stroke"
      class="motion-safe:animate-trail-dash"
    />
  </svg>
</template>
