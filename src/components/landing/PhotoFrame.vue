<script setup lang="ts">
import { computed, ref } from 'vue'

const props = withDefaults(
  defineProps<{
    src: string
    alt: string
    ratio?: '4/5' | '1/1'
  }>(),
  {
    ratio: '4/5',
  },
)

const hasError = ref(false)

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
      :src="props.src"
      :alt="props.alt"
      loading="lazy"
      decoding="async"
      class="photo-natural absolute inset-0 h-full w-full object-cover"
      :class="hasError ? 'opacity-0' : ''"
      @error="hasError = true"
    />

    <div v-if="!hasError" aria-hidden="true" class="photo-tint absolute inset-0" />
  </div>
</template>

<style scoped>
.photo-natural {
  filter: saturate(0.9) contrast(1.02);
}

.photo-tint {
  background: color-mix(in oklab, var(--color-trail) 6%, transparent);
  mix-blend-mode: multiply;
}

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
      color-mix(in oklab, var(--color-route) 45%, transparent),
      transparent 62%
    );
}
</style>
