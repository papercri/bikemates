<script setup lang="ts">
import { computed, ref } from 'vue'
import { useParallax } from '@/composables/useParallax'

const props = withDefaults(
  defineProps<{
    src: string
    alt: string
    ratio?: '4/5' | '1/1'
    /** Desplaza la imagen más lento que el scroll (efecto Cowboy). */
    parallax?: boolean
  }>(),
  {
    ratio: '4/5',
    parallax: false,
  },
)

const hasError = ref(false)
const imageEl = ref<HTMLElement | null>(null)

useParallax(imageEl, { speed: 0.22, maxOffset: 20 })

const ratioClasses = {
  '4/5': 'aspect-[4/5]',
  '1/1': 'aspect-square',
} as const

const frameClasses = computed(() => ratioClasses[props.ratio])
</script>

<template>
  <div class="relative overflow-hidden rounded-photo bg-canvas" :class="frameClasses">
    <!-- Hueco reservado para la próxima foto: se ve un patrón en vez de un hueco roto -->
    <div v-if="hasError" aria-hidden="true" class="photo-fallback absolute inset-0" />

    <img
      ref="imageEl"
      :src="props.src"
      :alt="props.alt"
      loading="lazy"
      decoding="async"
      class="absolute inset-0 h-full w-full object-cover"
      :class="[hasError ? 'opacity-0' : '', parallax ? 'parallax-layer' : '']"
      @error="hasError = true"
    />
  </div>
</template>

<style scoped>
.photo-fallback {
  background-color: var(--color-canvas);
  background-image:
    repeating-linear-gradient(
      135deg,
      color-mix(in oklab, var(--color-ink) 8%, transparent) 0 3px,
      transparent 3px 16px
    ),
    radial-gradient(
      circle at 30% 25%,
      color-mix(in oklab, var(--color-graphite) 45%, transparent),
      transparent 62%
    );
}
</style>
