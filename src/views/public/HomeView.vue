<script setup lang="ts">
import { computed } from 'vue'
import { useHead } from '@unhead/vue'
import { storeToRefs } from 'pinia'
import AppPage from '@/components/layout/AppPage.vue'
import HomeCtaBand from '@/components/home/HomeCtaBand.vue'
import HomeFeatures from '@/components/home/HomeFeatures.vue'
import HomeHero from '@/components/home/HomeHero.vue'
import HomeRidesPreview from '@/components/home/HomeRidesPreview.vue'
import { useAuthStore } from '@/features/auth/stores/authStore'
import { useRideList } from '@/features/rides/composables/useRideList'
import type { ButtonVariant } from '@/design-system'

const HOME_TITLE = 'BikeMates | Encuentra ciclistas y rutas'
const HOME_DESCRIPTION =
  'Encuentra ciclistas cerca de ti, descubre rutas y organiza salidas en grupo por España.'

useHead(
  computed(() => {
    // URL absoluta: las redes y los rastreadores no resuelven rutas relativas.
    const url = `${window.location.origin}/`
    const image = `${window.location.origin}/photos/grupeta-camino.webp`

    // Schema.org: describe el sitio visible (WebSite + Organization), sin inventar datos.
    const structuredData = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebSite',
          name: 'BikeMates',
          url,
          description: HOME_DESCRIPTION,
        },
        {
          '@type': 'Organization',
          name: 'BikeMates',
          url,
          logo: image,
        },
      ],
    }

    return {
      title: HOME_TITLE,
      meta: [
        { name: 'description', content: HOME_DESCRIPTION },
        // Open Graph: previsualización en Facebook, WhatsApp, Telegram…
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'BikeMates' },
        { property: 'og:title', content: HOME_TITLE },
        { property: 'og:description', content: HOME_DESCRIPTION },
        { property: 'og:url', content: url },
        { property: 'og:image', content: image },
        // Twitter/X
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: HOME_TITLE },
        { name: 'twitter:description', content: HOME_DESCRIPTION },
        { name: 'twitter:image', content: image },
      ],
      link: [{ rel: 'canonical', href: url }],
      script: [{ type: 'application/ld+json', innerHTML: JSON.stringify(structuredData) }],
    }
  }),
)

interface LandingCta {
  label: string
  to: string
  variant: ButtonVariant
}

const authStore = useAuthStore()
const { user, isInitialized } = storeToRefs(authStore)

const heroCtas = computed<LandingCta[]>(() => {
  if (!isInitialized.value) {
    return [{ label: 'Explorar rutas', to: '/rides', variant: 'sun' }]
  }

  if (user.value) {
    return [
      { label: 'Explorar rutas', to: '/rides', variant: 'sun' },
      { label: 'Publicar nueva ruta', to: '/rides/create', variant: 'sun-outline' },
    ]
  }

  return [
    { label: 'Únete a BikeMates', to: '/register', variant: 'sun' },
    { label: 'Explorar rutas', to: '/rides', variant: 'sun-outline' },
  ]
})

const bandCta = computed(() =>
  isInitialized.value && user.value
    ? { label: 'Organiza una salida', to: '/rides/create' }
    : { label: 'Crear una cuenta', to: '/register' },
)

const { rides: publishedRides, isLoading: isLoadingRides } = useRideList()

// Próximas salidas (aún no empezadas), de la más cercana a la más lejana.
// La sección del listado solo se muestra con al menos dos salidas futuras.
const futureRides = computed(() =>
  [...publishedRides.value]
    .filter((ride) => new Date(ride.startsAt).getTime() > Date.now())
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
    .slice(0, 3),
)
</script>

<template>
  <AppPage bleed spacing="none">
    <HomeHero :ctas="heroCtas" />
    <HomeFeatures />
    <HomeRidesPreview v-if="!isLoadingRides && futureRides.length >= 2" :rides="futureRides" />
    <HomeCtaBand :cta="bandCta" />
  </AppPage>
</template>
