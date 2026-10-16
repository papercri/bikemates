<script setup lang="ts">
import { useHead } from '@unhead/vue'
import AppPage from '@/components/layout/AppPage.vue'
import CyclistScene from '@/components/icons/CyclistScene.vue'
import HeroBackdrop from '@/components/icons/HeroBackdrop.vue'
import IconCyclists from '@/components/icons/IconCyclists.vue'
import IconMeetup from '@/components/icons/IconMeetup.vue'
import IconRoutes from '@/components/icons/IconRoutes.vue'
import RidgeDivider from '@/components/icons/RidgeDivider.vue'
import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'
import Typography from '@/components/ui/Typography.vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/features/auth/stores/authStore'

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
</script>

<template>
  <AppPage size="full" spacing="none">
    <section class="relative overflow-hidden" aria-labelledby="hero-title">
      <HeroBackdrop class="absolute inset-0" />

      <div
        class="relative mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-8"
      >
        <div class="max-w-xl">
          <Typography variant="eyebrow-wide" tone="accent" class="mb-5">
            Tu próxima aventura empieza aquí
          </Typography>

          <Typography id="hero-title" as="h1" variant="display">
            Encuentra tu grupeta.
            <span class="text-trail-ink">Comparte la ruta.</span>
          </Typography>

          <Typography tone="muted" class="mt-6 max-w-2xl text-lg leading-8">
            Conecta con ciclistas cerca de ti, organiza salidas y descubre nuevas rutas para
            disfrutar de la bici en compañía.
          </Typography>

          <div class="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button to="/rides" size="lg"> Explorar rutas </Button>

            <Button v-if="isInitialized && user" to="/rides/create" variant="primary" size="lg">
              Publicar ruta
            </Button>

            <Button v-else-if="isInitialized" to="/register" variant="outline" size="lg">
              Únete a BikeMates
            </Button>
          </div>
        </div>

        <div class="relative mx-auto w-full max-w-lg lg:max-w-none">
          <CyclistScene />
        </div>
      </div>

      <div class="relative -mb-px">
        <RidgeDivider />
      </div>
    </section>

    <section class="bg-surface" aria-labelledby="features-title">
      <div class="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Typography id="features-title" as="h2" variant="heading-md">
          Todo empieza con una ruta
        </Typography>

        <Typography tone="muted" class="mt-3 max-w-2xl">
          Encuentra personas con tus mismos intereses y convierte cada salida en una oportunidad
          para descubrir nuevos caminos.
        </Typography>

        <div class="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Card class="p-6">
            <IconRoutes class="mb-4 text-trail-ink" />
            <Typography as="h3" variant="heading-xs">Descubre rutas</Typography>
            <Typography tone="muted" class="mt-3 leading-7">
              Encuentra próximas salidas y explora nuevos recorridos por tu zona.
            </Typography>
          </Card>

          <Card class="p-6">
            <IconCyclists class="mb-4 text-trail-ink" />
            <Typography as="h3" variant="heading-xs">Conoce ciclistas</Typography>
            <Typography tone="muted" class="mt-3 leading-7">
              Conecta con personas que comparten tu pasión por el ciclismo.
            </Typography>
          </Card>

          <Card class="p-6">
            <IconMeetup class="mb-4 text-trail-ink" />
            <Typography as="h3" variant="heading-xs">Organiza quedadas</Typography>
            <Typography tone="muted" class="mt-3 leading-7">
              Propón una salida, define el recorrido y pedalea en compañía.
            </Typography>
          </Card>
        </div>
      </div>
    </section>
  </AppPage>
</template>
