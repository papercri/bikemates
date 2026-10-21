<script setup lang="ts">
import { motion } from 'motion-v'
import Button from '@/components/ui/Button.vue'
import IconArrow from '@/components/icons/IconArrow.vue'
import RideCard from '@/features/rides/components/RideCard.vue'
import type { Ride } from '@/features/rides/types'
import { EASE, REVEAL_DURATION, REVEAL_Y, STAGGER_DELAY } from './animation'

defineProps<{
  rides: Ride[]
}>()
</script>

<template>
  <section class="-mx-4 bg-snow sm:-mx-6 lg:-mx-8" aria-labelledby="gallery-title">
    <div class="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-14">
      <motion.div
        :initial="{ opacity: 0, y: REVEAL_Y }"
        :while-in-view="{ opacity: 1, y: 0 }"
        :viewport="{ once: true, amount: 0.2 }"
        :transition="{ duration: REVEAL_DURATION, ease: EASE }"
      >
        <h2
          id="gallery-title"
          class="max-w-xl font-display text-3xl leading-[1.05] font-medium tracking-[-0.025em] text-ink sm:text-4xl"
        >
          Encuentra una excursión a tu ritmo
        </h2>

        <p class="mt-3 max-w-xl leading-7 text-graphite">
          Desde paseos tranquilos hasta rutas de montaña con desnivel. Consulta la distancia, la
          dificultad y el nivel de cada salida para elegir la que mejor se adapte a ti.
        </p>
      </motion.div>

      <div class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <motion.div
          v-for="(ride, index) in rides"
          :key="ride.id"
          :initial="{ opacity: 0, y: REVEAL_Y }"
          :while-in-view="{ opacity: 1, y: 0 }"
          :viewport="{ once: true, amount: 0.15 }"
          :transition="{ duration: REVEAL_DURATION, ease: EASE, delay: index * STAGGER_DELAY }"
        >
          <RideCard :ride="ride" />
        </motion.div>
      </div>

      <div class="mt-8 flex justify-end">
        <Button variant="primary" size="lg" to="/rides">
          Ver próximas salidas
          <IconArrow direction="right" />
        </Button>
      </div>
    </div>
  </section>
</template>
