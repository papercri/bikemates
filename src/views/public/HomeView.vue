<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useHead } from '@unhead/vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faBicycle } from '@fortawesome/free-solid-svg-icons'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion-v'
import AppPage from '@/components/layout/AppPage.vue'
import IconCyclists from '@/components/icons/IconCyclists.vue'
import IconMeetup from '@/components/icons/IconMeetup.vue'
import IconRoutes from '@/components/icons/IconRoutes.vue'
import PhotoFrame from '@/components/landing/PhotoFrame.vue'
import Button from '@/components/ui/Button.vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/features/auth/stores/authStore'
import type { ButtonVariant } from '@/design-system'

// Constantes de animación (curva Cowboy: expo-out suave)
const EASE = [0.25, 1, 0.5, 1] as const
const HERO_PARALLAX_Y = '12%'
const REVEAL_Y = 32
const REVEAL_DURATION = 0.8
const STAGGER_DELAY = 0.1

// Slideshow del hero: crossfade + zoom lento (Ken Burns) por foto.
const HERO_SLIDE_MS = 6000
const HERO_FADE_S = 1.2
const HERO_ZOOM_FROM = 1
const HERO_ZOOM_TO = 1.08

const heroSlides = [
  { src: '/photos/hero-bosque.webp', position: 'object-center' },
  { src: '/photos/grupeta-camino.webp', position: 'object-center' },
  { src: '/photos/img4.avif', position: 'object-center' },
  { src: '/photos/img10.avif', position: 'object-center' },
] as const

const authStore = useAuthStore()
const { user, isInitialized } = storeToRefs(authStore)

useHead({
  title: 'BikeMates | Encuentra ciclistas y rutas',
  meta: [
    {
      name: 'description',
      content:
        'Encuentra ciclistas cerca de ti, descubre rutas y organiza salidas en grupo por España.',
    },
  ],
})

interface LandingCta {
  label: string
  to: string
  variant: ButtonVariant
}

const heroCtas = computed<LandingCta[]>(() => {
  if (!isInitialized.value) {
    return [{ label: 'Explorar rutas', to: '/rides', variant: 'sun' }]
  }

  if (user.value) {
    return [
      { label: 'Explorar rutas', to: '/rides', variant: 'sun' },
      { label: 'Publicar ruta', to: '/rides/create', variant: 'sun-outline' },
    ]
  }

  return [
    { label: 'Únete a BikeMates', to: '/register', variant: 'sun' },
    { label: 'Explorar rutas', to: '/rides', variant: 'sun-outline' },
  ]
})

const bandCta = computed<LandingCta>(() =>
  isInitialized.value && user.value
    ? { label: 'Publicar una salida', to: '/rides/create', variant: 'sun' }
    : { label: 'Crear cuenta gratis', to: '/register', variant: 'sun' },
)

const features = [
  {
    icon: IconRoutes,
    title: 'Descubre rutas',
    description: 'Encuentra próximas salidas y explora nuevos recorridos por tu zona.',
  },
  {
    icon: IconCyclists,
    title: 'Conoce ciclistas',
    description: 'Conecta con personas que comparten tu pasión por el ciclismo.',
  },
  {
    icon: IconMeetup,
    title: 'Organiza quedadas',
    description: 'Propón una salida, define el recorrido y pedalea en compañía.',
  },
]

// Parallax del hero: el contenedor de fotos se desplaza un 12 % al salir de pantalla.
const heroSection = ref<HTMLElement | null>(null)
const reduceMotion = useReducedMotion()

const { scrollYProgress } = useScroll({
  target: heroSection,
  offset: ['start start', 'end start'],
})

const heroImageY = useTransform(scrollYProgress, [0, 1], ['0%', HERO_PARALLAX_Y])

const heroImageStyle = computed(() => (reduceMotion.value ? {} : { y: heroImageY }))

// Avance del slideshow; con reduced-motion se queda en la primera foto.
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
  <AppPage bleed spacing="none">
    <section
      ref="heroSection"
      class="relative isolate -mx-4 min-h-[100svh] overflow-hidden sm:-mx-6 lg:-mx-8"
      aria-labelledby="hero-title"
    >
      <div class="absolute inset-0" :style="heroImageStyle" aria-hidden="true">
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
      </div>
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
            <span class="block">Comparte la ruta.</span>
          </h1>

          <p class="mt-6 max-w-xl text-base leading-7 text-white/85 sm:text-lg">
            Conecta con ciclistas cerca de ti, organiza salidas y descubre nuevas rutas para
            disfrutar de la bici en compañía.
          </p>

          <div class="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button
              v-for="cta in heroCtas"
              :key="cta.to"
              :to="cta.to"
              :variant="cta.variant"
              size="lg"
            >
              {{ cta.label }}
            </Button>
          </div>
        </motion.div>
      </div>
    </section>

    <section class="-mx-4 sm:-mx-6 lg:-mx-8" aria-labelledby="features-title">
      <div class="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <motion.div
          :initial="{ opacity: 0, y: REVEAL_Y }"
          :while-in-view="{ opacity: 1, y: 0 }"
          :viewport="{ once: true, amount: 0.25 }"
          :transition="{ duration: REVEAL_DURATION, ease: EASE }"
        >
          <h2
            id="features-title"
            class="max-w-3xl font-display text-3xl leading-[1.05] font-medium tracking-[-0.025em] text-ink sm:text-5xl"
          >
            Todo empieza con una ruta
          </h2>

          <p class="mt-4 max-w-2xl leading-7 text-graphite">
            Encuentra personas con tus mismos intereses y convierte cada salida en una oportunidad
            para descubrir nuevos caminos.
          </p>
        </motion.div>

        <div class="mt-10 grid gap-3 sm:grid-cols-3">
          <motion.div
            v-for="(feature, index) in features"
            :key="feature.title"
            :initial="{ opacity: 0, y: REVEAL_Y }"
            :while-in-view="{ opacity: 1, y: 0 }"
            :viewport="{ once: true, amount: 0.2 }"
            :transition="{ duration: REVEAL_DURATION, ease: EASE, delay: index * STAGGER_DELAY }"
            class="rounded-card border border-line bg-white p-7"
          >
            <span
              class="inline-flex rounded-full bg-trail/10 p-3 text-trail-ink"
              aria-hidden="true"
            >
              <component :is="feature.icon" class="size-6" />
            </span>

            <h3
              class="mt-5 font-display text-lg leading-tight font-medium tracking-[-0.01em] sm:text-xl"
            >
              {{ feature.title }}
            </h3>

            <p class="mt-2 text-sm leading-6 text-graphite">
              {{ feature.description }}
            </p>
          </motion.div>
        </div>
      </div>
    </section>

    <section class="-mx-4 bg-snow sm:-mx-6 lg:-mx-8" aria-labelledby="gallery-title">
      <div
        class="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1fr)] lg:items-center lg:gap-14 lg:px-8 lg:py-24"
      >
        <motion.div
          :initial="{ opacity: 0, y: REVEAL_Y }"
          :while-in-view="{ opacity: 1, y: 0 }"
          :viewport="{ once: true, amount: 0.2 }"
          :transition="{ duration: REVEAL_DURATION, ease: EASE }"
        >
          <PhotoFrame
            src="/photos/img8.avif"
            alt="Tres ciclistas pedalean por un camino de campo al atardecer"
            ratio="4/5"
          />
        </motion.div>

        <motion.div
          :initial="{ opacity: 0, y: REVEAL_Y }"
          :while-in-view="{ opacity: 1, y: 0 }"
          :viewport="{ once: true, amount: 0.2 }"
          :transition="{ duration: REVEAL_DURATION, ease: EASE, delay: STAGGER_DELAY }"
        >
          <h2
            id="gallery-title"
            class="max-w-xl font-display text-3xl leading-[1.05] font-medium tracking-[-0.025em] text-ink sm:text-4xl"
          >
            Así se vive una salida
          </h2>

          <p class="mt-4 max-w-xl leading-7 text-graphite">
            Desde paseos por la mañana hasta rutas de montaña con desnivel. Mira la dificultad y el
            ritmo de cada salida antes de apuntarte.
          </p>

          <div class="mt-8 grid grid-cols-2 gap-4">
            <motion.div
              :initial="{ opacity: 0, y: REVEAL_Y }"
              :while-in-view="{ opacity: 1, y: 0 }"
              :viewport="{ once: true, amount: 0.2 }"
              :transition="{ duration: REVEAL_DURATION, ease: EASE, delay: STAGGER_DELAY * 2 }"
            >
              <PhotoFrame
                src="/photos/grupeta-sepia.webp"
                alt="Dos ciclistas recorren un camino rural entre campos"
                ratio="1/1"
              />
            </motion.div>
            <motion.div
              :initial="{ opacity: 0, y: REVEAL_Y }"
              :while-in-view="{ opacity: 1, y: 0 }"
              :viewport="{ once: true, amount: 0.2 }"
              :transition="{ duration: REVEAL_DURATION, ease: EASE, delay: STAGGER_DELAY * 3 }"
            >
              <PhotoFrame
                src="/photos/img10.avif"
                alt="Dos ciclistas sonríen en una carretera de costa con el océano al fondo"
                ratio="1/1"
              />
            </motion.div>
          </div>

          <div class="mt-8">
            <Button variant="primary" size="lg" to="/rides"> Ver próximas salidas </Button>
          </div>
        </motion.div>
      </div>
    </section>

    <section
      class="relative isolate -mx-4 overflow-hidden bg-turf sm:-mx-6 lg:-mx-8"
      aria-labelledby="cta-title"
    >
      <div
        class="pointer-events-none absolute inset-0 opacity-[0.05]"
        style="
          background: radial-gradient(60% 80% at 85% 20%, var(--color-canvas), transparent 70%);
        "
        aria-hidden="true"
      />

      <div
        class="relative mx-auto flex max-w-7xl flex-col gap-8 px-4 py-16 sm:px-6 sm:py-20 lg:flex-row lg:items-end lg:justify-between lg:gap-12 lg:px-8 lg:py-24"
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
            class="font-display text-3xl leading-[1.05] font-medium tracking-[-0.025em] text-white sm:text-4xl"
          >
            Tu próxima salida empieza aquí
          </h2>
          <p class="mt-4 max-w-xl leading-7 text-white/70">
            Crea tu cuenta, elige una ruta cerca de ti y sal a pedalear con gente nueva.
          </p>
        </motion.div>

        <motion.div
          :initial="{ opacity: 0, y: REVEAL_Y }"
          :while-in-view="{ opacity: 1, y: 0 }"
          :viewport="{ once: true, amount: 0.25 }"
          :transition="{ duration: REVEAL_DURATION, ease: EASE, delay: STAGGER_DELAY }"
          class="flex flex-col gap-4 sm:flex-row sm:items-center"
        >
          <Button :to="bandCta.to" :variant="bandCta.variant" size="lg">
            {{ bandCta.label }}
          </Button>

          <RouterLink
            to="/rides"
            class="inline-flex items-center gap-2 text-canvas underline-offset-4 transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-canvas"
          >
            <FontAwesomeIcon :icon="faBicycle" aria-hidden="true" />
            Explorar rutas
          </RouterLink>
        </motion.div>
      </div>
    </section>
  </AppPage>
</template>
