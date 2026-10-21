<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion-v'
import Button from '@/components/ui/Button.vue'
import type { ButtonVariant } from '@/design-system'
import { EASE, REVEAL_DURATION, REVEAL_Y } from './animation'

interface HeroCta {
  label: string
  to: string
  variant: ButtonVariant
}

defineProps<{
  ctas: HeroCta[]
}>()

const HERO_PARALLAX_Y = '12%'
const HERO_SLIDE_MS = 6000
const HERO_FADE_S = 1.2
const HERO_ZOOM_FROM = 1
const HERO_ZOOM_TO = 1.08

// Slideshow del hero: crossfade + zoom lento (Ken Burns) por foto.
const heroSlides = [
  { src: '/photos/grupeta-camino.webp', position: 'object-center' },
  { src: '/photos/img4.webp', position: 'object-center' },
  { src: '/photos/img10.webp', position: 'object-center' },
  { src: '/photos/img14.webp', position: 'object-center' },
  { src: '/photos/hero-bosque.webp', position: 'object-center' },
  { src: '/photos/img3.webp', position: 'object-center' },
  { src: '/photos/img19.webp', position: 'object-center' },
] as const

const heroSection = ref<HTMLElement | null>(null)
const reduceMotion = useReducedMotion()

const { scrollYProgress } = useScroll({
  target: heroSection,
  offset: ['start start', 'end start'],
})

const heroImageY = useTransform(scrollYProgress, [0, 1], ['0%', HERO_PARALLAX_Y])

// Con reduced-motion se omite el parallax (objeto sin y).
const heroImageStyle = computed(() => (reduceMotion.value ? {} : { y: heroImageY }))

const activeSlide = ref(0)
let slideTimer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  if (reduceMotion.value) return

  slideTimer = setInterval(() => {
    activeSlide.value = (activeSlide.value + 1) % heroSlides.length
  }, HERO_SLIDE_MS)
})

onBeforeUnmount(() => {
  if (slideTimer) clearInterval(slideTimer)
})
</script>

<template>
  <section
    ref="heroSection"
    class="relative isolate -mx-4 min-h-[100svh] overflow-hidden sm:-mx-6 lg:-mx-8"
    aria-labelledby="hero-title"
  >
    <motion.div class="absolute inset-0" :style="heroImageStyle" aria-hidden="true">
      <motion.img
        v-for="(slide, index) in heroSlides"
        :key="slide.src"
        :src="slide.src"
        alt=""
        :loading="index === 0 ? 'eager' : 'lazy'"
        :fetchpriority="index === 0 ? 'high' : 'auto'"
        decoding="async"
        class="absolute inset-0 h-full w-full object-cover"
        :class="slide.position"
        :initial="{ opacity: index === 0 ? 1 : 0, scale: HERO_ZOOM_FROM }"
        :animate="{
          opacity: index === activeSlide ? 1 : 0,
          scale: index === activeSlide ? HERO_ZOOM_TO : HERO_ZOOM_FROM,
        }"
        :transition="{
          opacity: { duration: HERO_FADE_S, ease: EASE },
          scale: {
            duration: index === activeSlide ? HERO_SLIDE_MS / 1000 : 0,
            ease: 'linear',
          },
        }"
      />
    </motion.div>
    <div class="absolute inset-0 bg-ink/40" />

    <div
      class="relative mx-auto grid max-w-7xl gap-10 px-4 pb-20 pt-28 sm:px-6 sm:pb-24 sm:pt-32 lg:grid-cols-[1.06fr_0.94fr] lg:items-center lg:gap-12 lg:px-8 lg:pb-28 lg:pt-36"
    >
      <motion.div
        :initial="{ opacity: 0, y: REVEAL_Y }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: REVEAL_DURATION, ease: EASE, delay: 0.15 }"
      >
        <h1
          id="hero-title"
          class="max-w-3xl font-display text-[clamp(2.4rem,6vw,4.4rem)] leading-[0.95] font-medium tracking-[-0.025em] text-white"
        >
          <span class="block">Encuentra tu grupeta.</span>
          <span class="block">Descubre nuevas rutas.</span>
        </h1>

        <p class="mt-6 max-w-xl text-base leading-7 text-white/85 sm:text-lg">
          Conecta con ciclistas cerca de ti, organiza salidas en grupo y encuentra nuevas rutas para
          tu próxima aventura en bici.
        </p>

        <div class="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button v-for="cta in ctas" :key="cta.to" :to="cta.to" :variant="cta.variant" size="lg">
            {{ cta.label }}
          </Button>
        </div>
      </motion.div>
    </div>
  </section>
</template>
