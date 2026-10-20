<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import L from 'leaflet'
import { icon as faIcon } from '@fortawesome/fontawesome-svg-core'
import { faBicycle } from '@fortawesome/free-solid-svg-icons'
import 'leaflet/dist/leaflet.css'

interface Props {
  latitude: number
  longitude: number
  meetingPoint: string
  /** Mapa reducido para columnas laterales estrechas. */
  compact?: boolean
}

const props = withDefaults(defineProps<Props>(), { compact: false })

const mapContainer = ref<HTMLDivElement | null>(null)

/**
 * Pin redondo con icono de bicicleta: el marcador por defecto de Leaflet es
 * una chincheta con sombra. Un círculo naranja de ruta con la bici resalta el
 * punto de encuentro y refuerza el icono que ya usan las tarjetas.
 */
function roundedPinIcon(): L.DivIcon {
  const bikeSvg = faIcon(faBicycle)?.html.join('') ?? ''

  return L.divIcon({
    className: 'bm-map-pin',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16],
    html: `<span class="bm-map-pin__dot">${bikeSvg}</span>`,
  })
}

let map: L.Map | null = null
let marker: L.Marker | null = null

onMounted(() => {
  if (!mapContainer.value) return

  map = L.map(mapContainer.value, {
    scrollWheelZoom: false,
  }).setView([props.latitude, props.longitude], 13)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  }).addTo(map)

  marker = L.marker([props.latitude, props.longitude], { icon: roundedPinIcon() }).addTo(map)
  marker.bindPopup(props.meetingPoint)
})

watch(
  () => [props.latitude, props.longitude, props.meetingPoint] as const,
  ([latitude, longitude, meetingPoint]) => {
    if (!map || !marker) return

    marker.setLatLng([latitude, longitude])
    marker.setPopupContent(meetingPoint)
    map.setView([latitude, longitude], 13)
  },
)

onUnmounted(() => {
  map?.remove()
  map = null
  marker = null
})
</script>

<template>
  <div
    ref="mapContainer"
    class="w-full overflow-hidden rounded-photo bg-snow"
    :class="props.compact ? 'h-36 sm:h-40' : 'h-48 sm:h-60'"
    role="application"
    :aria-label="`Mapa del punto de encuentro: ${meetingPoint}`"
  />
</template>

<style scoped>
/* Leaflet inserta el marcador por código: :deep llega a su DOM. */
:deep(.bm-map-pin) {
  background: transparent;
  border: 0;
}

:deep(.bm-map-pin__dot) {
  display: flex;
  width: 28px;
  height: 28px;
  box-sizing: border-box;
  align-items: center;
  justify-content: center;
  border: 3px solid var(--color-canvas);
  border-radius: 9999px;
  background: var(--color-route);
  box-shadow: 0 1px 3px rgb(0 1 6 / 0.35);
  color: var(--color-canvas);
}

:deep(.bm-map-pin__dot .svg-inline--fa) {
  width: 12px;
  height: 12px;
}
</style>
