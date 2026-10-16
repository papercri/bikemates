<script setup lang="ts">
import { computed, useId } from 'vue'

const props = withDefaults(
  defineProps<{
    distanceKm: number
    elevationM: number
    variant?: 'card' | 'banner'
  }>(),
  { variant: 'card' },
)

const uid = useId()
const fillId = computed(() => `elev-fill-${uid}`)

const width = 240
const height = computed(() => (props.variant === 'banner' ? 96 : 48))
const viewBox = computed(() => `0 0 ${width} ${height.value}`)

function pseudo(seed: number): number {
  const x = Math.sin(seed * 127.1 + props.elevationM * 0.017) * 43758.5453
  return x - Math.floor(x)
}

const points = computed(() => {
  const count = props.variant === 'banner' ? 56 : 28
  const h = height.value
  const pts: string[] = []

  for (let i = 0; i <= count; i++) {
    const t = i / count
    const envelope = Math.sin(t * Math.PI) ** 0.8
    const noise = pseudo(i + 1) * 0.5 + pseudo(i * 3 + 7) * 0.3
    const value = Math.min(1, 0.18 + envelope * (0.4 + noise * 0.55))
    const x = (t * width).toFixed(1)
    const y = (h - value * (h - 10) - 5).toFixed(1)
    pts.push(`${x},${y}`)
  }

  return pts.join(' ')
})

const area = computed(() => `M0,${height.value} L${points.value} L${width},${height.value} Z`)
</script>

<template>
  <svg
    :viewBox="viewBox"
    preserveAspectRatio="none"
    class="block w-full"
    :class="variant === 'banner' ? 'h-24 sm:h-32' : 'h-12'"
    aria-hidden="true"
    focusable="false"
  >
    <defs>
      <linearGradient :id="fillId" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="var(--color-trail)" stop-opacity="0.35" />
        <stop offset="100%" stop-color="var(--color-trail)" stop-opacity="0.02" />
      </linearGradient>
    </defs>
    <path :d="area" :fill="`url(#${fillId})`" />
    <polyline
      :points="points"
      fill="none"
      stroke-width="2.5"
      stroke-linecap="round"
      stroke-linejoin="round"
      vector-effect="non-scaling-stroke"
      class="stroke-trail-deep transition-colors duration-300 group-hover:stroke-trail"
    />
  </svg>
</template>
