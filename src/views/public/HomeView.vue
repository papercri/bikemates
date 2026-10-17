<script setup lang="ts">
import { computed, ref } from 'vue'
import { useHead } from '@unhead/vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faBicycle } from '@fortawesome/free-solid-svg-icons'
import AppPage from '@/components/layout/AppPage.vue'
import IconCyclists from '@/components/icons/IconCyclists.vue'
import IconMeetup from '@/components/icons/IconMeetup.vue'
import IconRoutes from '@/components/icons/IconRoutes.vue'
import PhotoFrame from '@/components/landing/PhotoFrame.vue'
import Button from '@/components/ui/Button.vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/features/auth/stores/authStore'
import { useParallax } from '@/composables/useParallax'
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

const heroImage = ref<HTMLElement | null>(null)
useParallax(heroImage, { speed: 0.35, maxOffset: 56 })
</script>

<template>
  <AppPage bleed spacing="none">
    <section
      class="relative isolate -mx-4 overflow-hidden sm:-mx-6 lg:-mx-8"
      aria-labelledby="hero-title"
    >
      <img
        ref="heroImage"
        src="/photos/hero-bosque.webp"
        alt=""
        aria-hidden="true"
        fetchpriority="high"
        decoding="async"
        class="parallax-layer absolute inset-0 h-full w-full object-cover object-center"
      />
      <div class="absolute inset-0 bg-ink/40" />

      <div
        class="relative mx-auto grid max-w-7xl gap-10 px-4 pb-20 pt-14 sm:px-6 sm:pb-24 sm:pt-16 lg:grid-cols-[1.06fr_0.94fr] lg:items-center lg:gap-12 lg:px-8 lg:pb-28 lg:pt-20"
      >
        <div v-reveal>
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
        </div>
      </div>
    </section>

    <section class="-mx-4 sm:-mx-6 lg:-mx-8" aria-labelledby="features-title">
      <div class="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div v-reveal>
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
        </div>

        <div class="mt-10 grid gap-3 sm:grid-cols-3">
          <div
            v-for="(feature, index) in features"
            :key="feature.title"
            v-reveal="{ delay: index * 80 }"
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
          </div>
        </div>
      </div>
    </section>

    <section class="-mx-4 bg-snow sm:-mx-6 lg:-mx-8" aria-labelledby="gallery-title">
      <div
        class="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1fr)] lg:items-center lg:gap-14 lg:px-8 lg:py-24"
      >
        <PhotoFrame
          v-reveal="{ variant: 'photo' }"
          src="/photos/img8.avif"
          alt="Tres ciclistas pedalean por un camino de campo al atardecer"
          ratio="4/5"
          parallax
        />

        <div v-reveal="{ delay: 100 }">
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
            <PhotoFrame
              v-reveal="{ delay: 160, variant: 'photo' }"
              src="/photos/grupeta-sepia.webp"
              alt="Dos ciclistas recorren un camino rural entre campos"
              ratio="1/1"
              parallax
            />
            <PhotoFrame
              v-reveal="{ delay: 240, variant: 'photo' }"
              src="/photos/img10.avif"
              alt="Dos ciclistas sonríen en una carretera de costa con el océano al fondo"
              ratio="1/1"
              parallax
            />
          </div>

          <div class="mt-8">
            <Button variant="primary" size="lg" to="/rides"> Ver próximas salidas </Button>
          </div>
        </div>
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
        <div v-reveal class="max-w-2xl">
          <h2
            id="cta-title"
            class="font-display text-3xl leading-[1.05] font-medium tracking-[-0.025em] text-white sm:text-4xl"
          >
            Tu próxima salida empieza aquí
          </h2>
          <p class="mt-4 max-w-xl leading-7 text-white/70">
            Crea tu cuenta, elige una ruta cerca de ti y sal a pedalear con gente nueva.
          </p>
        </div>

        <div v-reveal="{ delay: 120 }" class="flex flex-col gap-4 sm:flex-row sm:items-center">
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
        </div>
      </div>
    </section>
  </AppPage>
</template>
