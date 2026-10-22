<script setup lang="ts">
import { motion } from 'motion-v'
import { EASE, REVEAL_DURATION, REVEAL_Y, STAGGER_DELAY } from './animation'

interface Feature {
  image: string
  alt: string
  title: string
  description: string
}

// Cada bloque se apoya en una fotografía real de la comunidad, con revelado suave.
const features: readonly Feature[] = [
  {
    image: '/photos/descubre-rutas.webp',
    alt: 'Excursión por una pista forestal',
    title: 'Descubre rutas',
    description:
      'Explora las próximas salidas y encuentra rutas que encajen con tu nivel y tu forma de pedalear.',
  },
  {
    image: '/photos/conecta-con-ciclistas.webp',
    alt: 'Grupo de ciclistas pedaleando juntos por el campo',
    title: 'Conecta con ciclistas',
    description: 'Encuentra personas que comparten tu afición y tus ganas de salir en bici.',
  },
  {
    image: '/photos/organiza-salidas.webp',
    alt: 'Ciclistas durante una parada en la ruta, charlando y descansando',
    title: 'Organiza salidas',
    description:
      'Crea una quedada, comparte los detalles de la ruta e invita a otros ciclistas a unirse.',
  },
]
</script>

<template>
  <section class="-mx-4 sm:-mx-6 lg:-mx-8" aria-labelledby="features-title">
    <div class="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-14">
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
          Cada salida es una oportunidad para conectar
        </h2>

        <p class="mt-4 max-w-2xl leading-7 text-graphite">
          Descubre nuevas rutas, conoce ciclistas cerca de ti y organiza salidas para disfrutar de
          la bici en compañía.
        </p>
      </motion.div>

      <div class="mt-10 grid gap-3 sm:grid-cols-3">
        <motion.article
          v-for="(feature, index) in features"
          :key="feature.title"
          :initial="{ opacity: 0, y: REVEAL_Y }"
          :while-in-view="{ opacity: 1, y: 0 }"
          :viewport="{ once: true, amount: 0.2 }"
          :transition="{ duration: REVEAL_DURATION, ease: EASE, delay: index * STAGGER_DELAY }"
          class="group overflow-hidden rounded-card border border-line bg-white transition-colors hover:border-line-strong"
        >
          <div class="relative aspect-[16/10] overflow-hidden">
            <img
              :src="feature.image"
              :alt="feature.alt"
              loading="lazy"
              decoding="async"
              class="h-full w-full object-cover transition-transform duration-500 ease-out motion-safe:group-hover:scale-[1.04]"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-ink/20 to-transparent" />
          </div>

          <div class="p-6">
            <h3
              class="font-display text-lg leading-tight font-medium tracking-[-0.01em] sm:text-xl"
            >
              {{ feature.title }}
            </h3>

            <p class="mt-2 text-sm leading-6 text-graphite">
              {{ feature.description }}
            </p>
          </div>
        </motion.article>
      </div>
    </div>
  </section>
</template>
