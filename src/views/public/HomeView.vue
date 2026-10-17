<script setup lang="ts">
import { computed, ref } from 'vue'
import { useHead } from '@unhead/vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faBicycle } from '@fortawesome/free-solid-svg-icons'
import AppPage from '@/components/layout/AppPage.vue'
import CyclistScene from '@/components/icons/CyclistScene.vue'
import HeroBackdrop from '@/components/icons/HeroBackdrop.vue'
import IconCyclists from '@/components/icons/IconCyclists.vue'
import IconMeetup from '@/components/icons/IconMeetup.vue'
import IconRoutes from '@/components/icons/IconRoutes.vue'
import RidgeDivider from '@/components/icons/RidgeDivider.vue'
import PhotoFrame from '@/components/landing/PhotoFrame.vue'
import Button from '@/components/ui/Button.vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/features/auth/stores/authStore'
import { useInView } from '@/composables/useInView'
import type { ButtonVariant } from '@/design-system'

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

const featuresSection = ref<HTMLElement | null>(null)
const { isInView: featuresVisible } = useInView(featuresSection)

const gallerySection = ref<HTMLElement | null>(null)
const { isInView: galleryVisible } = useInView(gallerySection)

const bandSection = ref<HTMLElement | null>(null)
const { isInView: bandVisible } = useInView(bandSection)
</script>

<template>
  <AppPage bleed spacing="none">
    <section
      class="relative isolate -mx-4 overflow-hidden bg-turf sm:-mx-6 lg:-mx-8"
      aria-labelledby="hero-title"
    >
      <HeroBackdrop class="absolute inset-0" />

      <div
        class="relative mx-auto grid max-w-7xl gap-10 px-4 pb-14 pt-10 sm:px-6 sm:pb-16 sm:pt-12 lg:grid-cols-[1.06fr_0.94fr] lg:items-center lg:gap-12 lg:px-8 lg:pt-14"
      >
        <div>
          <h1
            id="hero-title"
            class="hero-rise max-w-3xl font-display text-[clamp(2.35rem,6.2vw,4.5rem)] leading-[0.92] font-extrabold tracking-[-0.03em] text-canvas uppercase"
          >
            <span class="block">Encuentra tu grupeta.</span>
            <span class="block text-trail">Comparte la ruta.</span>
          </h1>

          <p
            class="hero-rise hero-rise-delay-1 mt-6 max-w-xl text-base leading-7 text-canvas/80 sm:text-lg"
          >
            Conecta con ciclistas cerca de ti, organiza salidas y descubre nuevas rutas para
            disfrutar de la bici en compañía.
          </p>

          <div class="hero-rise hero-rise-delay-2 mt-8 flex flex-col gap-3 sm:flex-row">
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
        </div>

        <div class="relative mx-auto w-full max-w-md border-4 border-trail p-3 sm:p-5 lg:max-w-none">
          <CyclistScene />
        </div>
      </div>

      <div class="relative -mb-px">
        <RidgeDivider />
      </div>
    </section>

    <section
      ref="featuresSection"
      class="-mx-4 border-y-4 border-ink bg-canvas sm:-mx-6 lg:-mx-8"
      aria-labelledby="features-title"
    >
      <div class="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div class="reveal" :class="featuresVisible ? 'is-revealed' : ''">
          <h2
            id="features-title"
            class="max-w-3xl font-display text-3xl leading-[1.02] font-extrabold tracking-[-0.03em] text-ink uppercase sm:text-5xl"
          >
            Todo empieza con una ruta
          </h2>

          <p class="mt-4 max-w-2xl leading-7 text-graphite">
            Encuentra personas con tus mismos intereses y convierte cada salida en una oportunidad
            para descubrir nuevos caminos.
          </p>
        </div>

        <div class="mt-10 grid gap-1 border-4 border-ink bg-ink sm:grid-cols-3">
          <div
            v-for="(feature, index) in features"
            :key="feature.title"
            class="reveal reveal-cell flex flex-col p-6 sm:p-7"
            :class="[
              featuresVisible ? 'is-revealed' : '',
              index === 0 ? 'bg-turf text-canvas' : 'bg-canvas text-ink',
            ]"
          >
            <component :is="feature.icon" class="text-trail" />

            <h3
              class="mt-5 font-display text-lg leading-tight font-extrabold tracking-[-0.01em] uppercase sm:text-xl"
            >
              {{ feature.title }}
            </h3>

            <p
              class="mt-2 text-sm leading-6"
              :class="index === 0 ? 'text-canvas/75' : 'text-graphite'"
            >
              {{ feature.description }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <section
      ref="gallerySection"
      class="-mx-4 bg-surface sm:-mx-6 lg:-mx-8"
      aria-labelledby="gallery-title"
    >
      <div
        class="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1fr)] lg:items-center lg:gap-14 lg:px-8"
      >
        <PhotoFrame
          src="/default.webp"
          alt="Dos ciclistas miran la sierra desde un prado durante una salida en bici"
          ratio="4/5"
          class="reveal-photo border-4 border-ink"
          :class="galleryVisible ? 'is-revealed' : ''"
        />

        <div>
          <h2
            id="gallery-title"
            class="max-w-xl font-display text-3xl leading-[1.02] font-extrabold tracking-[-0.03em] text-ink uppercase sm:text-4xl"
          >
            Así se vive una salida
          </h2>

          <p class="mt-4 max-w-xl leading-7 text-graphite">
            Desde paseos por la mañana hasta rutas de montaña con desnivel. Mira la dificultad y el
            ritmo de cada salida antes de apuntarte.
          </p>

          <div class="mt-8 grid grid-cols-2 gap-4">
            <PhotoFrame
              src="/photos/salida-amanecer.webp"
              alt="Pradera iluminada por el sol bajo una salida temprana"
              ratio="1/1"
              class="border-4 border-ink"
            />
            <PhotoFrame
              src="/photos/salida-pista.webp"
              alt="Sendero de tierra que atraviesa un prado entre árboles"
              ratio="1/1"
              class="border-4 border-ink"
            />
          </div>

          <div class="mt-8">
            <Button variant="primary" size="lg" to="/rides"> Ver próximas salidas </Button>
          </div>
        </div>
      </div>
    </section>

    <section
      ref="bandSection"
      class="relative isolate -mx-4 border-t-4 border-ink bg-trail sm:-mx-6 lg:-mx-8"
      aria-labelledby="cta-title"
    >
      <svg
        class="pointer-events-none absolute inset-x-0 bottom-0 h-28 w-full"
        aria-hidden="true"
        focusable="false"
        preserveAspectRatio="none"
        viewBox="0 0 1440 112"
      >
        <path
          d="M-40 86 C 260 34, 520 104, 820 62 S 1240 30, 1480 78"
          fill="none"
          stroke="var(--color-ink)"
          stroke-opacity="0.32"
          stroke-width="3"
          stroke-dasharray="8 12"
          stroke-linecap="round"
        />
      </svg>

      <div
        class="relative mx-auto flex max-w-7xl flex-col gap-8 px-4 py-16 sm:px-6 sm:py-20 lg:flex-row lg:items-end lg:justify-between lg:gap-12 lg:px-8"
      >
        <div class="max-w-2xl reveal" :class="bandVisible ? 'is-revealed' : ''">
          <h2
            id="cta-title"
            class="font-display text-3xl leading-[1.02] font-extrabold tracking-[-0.03em] text-ink uppercase sm:text-4xl"
          >
            Tu próxima salida empieza aquí
          </h2>
          <p class="mt-4 max-w-xl leading-7 text-ink/80">
            Crea tu cuenta, elige una ruta cerca de ti y sal a pedalear con gente nueva.
          </p>
        </div>

        <div
          class="flex flex-col gap-4 sm:flex-row sm:items-center reveal"
          :class="bandVisible ? 'is-revealed' : ''"
        >
          <Button :to="bandCta.to" :variant="bandCta.variant" size="lg">
            {{ bandCta.label }}
          </Button>

          <RouterLink
            to="/rides"
            class="inline-flex items-center gap-2 text-ink underline-offset-4 transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            <FontAwesomeIcon :icon="faBicycle" aria-hidden="true" />
            Explorar rutas
          </RouterLink>
        </div>
      </div>
    </section>
  </AppPage>
</template>

<style scoped>
/* Entrada del hero: jerarquía de lectura, no decoración. */
@keyframes rise {
  from {
    opacity: 0;
    transform: translateY(18px);
  }
}

.hero-rise {
  animation: rise 0.65s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.hero-rise-delay-1 {
  animation-delay: 0.08s;
}

.hero-rise-delay-2 {
  animation-delay: 0.16s;
}

/* Revelado por scroll de las bandas informativas. */
.reveal {
  opacity: 0;
  transform: translateY(20px);
  transition:
    opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.reveal.is-revealed {
  opacity: 1;
  transform: none;
}

.reveal-cell:nth-child(2) {
  transition-delay: 0.08s;
}

.reveal-cell:nth-child(3) {
  transition-delay: 0.16s;
}

.reveal-photo {
  clip-path: inset(0 0 100% 0);
  transition: clip-path 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.reveal-photo.is-revealed {
  clip-path: inset(0 0 0 0);
}

@media (prefers-reduced-motion: reduce) {
  .hero-rise,
  .reveal,
  .reveal-photo {
    animation: none;
    transition: none;
    opacity: 1;
    transform: none;
    clip-path: none;
  }
}
</style>
