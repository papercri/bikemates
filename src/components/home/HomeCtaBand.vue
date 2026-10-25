<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faBicycle } from '@fortawesome/free-solid-svg-icons'
import { motion } from 'motion-v'
import Button from '@/components/ui/Button.vue'
import { EASE, REVEAL_DURATION, REVEAL_Y, STAGGER_DELAY } from './animation'

defineProps<{
  cta: { label: string; to: string }
}>()
</script>

<template>
  <section
    class="relative isolate -mx-4 overflow-hidden border-y border-line bg-trail/15 sm:-mx-6 lg:-mx-8"
    aria-labelledby="cta-title"
  >
    <!-- Traza de ruta en line-art: sendero discontinuo animado sobre filete hairline. -->
    <svg
      viewBox="0 0 1200 260"
      preserveAspectRatio="xMidYMid slice"
      class="absolute inset-0 h-full w-full"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M 20 235 Q 260 220 420 170 T 820 175 T 1180 60"
        fill="none"
        stroke="var(--color-trail)"
        stroke-opacity="0.35"
        stroke-width="2"
        stroke-linecap="round"
      />
      <path
        d="M 20 235 Q 260 220 420 170 T 820 175 T 1180 60"
        fill="none"
        stroke="var(--color-trail-ink)"
        stroke-opacity="0.45"
        stroke-width="2"
        stroke-dasharray="6 9"
        stroke-linecap="round"
        vector-effect="non-scaling-stroke"
        class="motion-safe:animate-trail-dash"
      />
      <circle cx="420" cy="170" r="4" fill="var(--color-trail)" fill-opacity="0.45" />
      <circle cx="820" cy="175" r="4" fill="var(--color-trail)" fill-opacity="0.45" />
      <circle cx="1180" cy="60" r="7" fill="var(--color-ink)" />
      <circle cx="1180" cy="60" r="14" fill="none" stroke="var(--color-ink)" stroke-opacity="0.3" />
    </svg>

    <div
      class="relative mx-auto flex max-w-7xl flex-col gap-6 px-4 py-12 sm:px-6 sm:py-14 lg:flex-row lg:items-end lg:justify-between lg:gap-12 lg:px-8 lg:py-16"
    >
      <motion.div
        :initial="{ opacity: 0, y: REVEAL_Y }"
        :while-in-view="{ opacity: 1, y: 0 }"
        :viewport="{ once: true, amount: 0.25 }"
        :transition="{ duration: REVEAL_DURATION, ease: EASE }"
        class="max-w-2xl"
      >
        <h2
          id="cta-title"
          class="font-display text-3xl leading-[1.05] font-medium tracking-[-0.025em] text-ink sm:text-4xl"
        >
          ¿Te vienes a la próxima?
        </h2>
        <p class="mt-4 max-w-xl leading-7 text-graphite">
          Crea tu cuenta, elige una salida y pedalea con ciclistas de tu zona.
        </p>
      </motion.div>

      <motion.div
        :initial="{ opacity: 0, y: REVEAL_Y }"
        :while-in-view="{ opacity: 1, y: 0 }"
        :viewport="{ once: true, amount: 0.25 }"
        :transition="{ duration: REVEAL_DURATION, ease: EASE, delay: STAGGER_DELAY }"
        class="flex flex-col gap-3 sm:flex-row sm:items-center"
      >
        <Button :to="cta.to" variant="primary" size="lg">
          {{ cta.label }}
        </Button>

        <Button to="/rides" variant="outline" size="lg">
          <FontAwesomeIcon :icon="faBicycle" aria-hidden="true" />
          Explorar rutas
        </Button>
      </motion.div>
    </div>
  </section>
</template>
