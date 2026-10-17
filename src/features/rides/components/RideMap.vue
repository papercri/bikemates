<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface Props {
  latitude: number
  longitude: number
  meetingPoint: string
}

const props = defineProps<Props>()

const mapContainer = ref<HTMLDivElement | null>(null)

/**
 * Pin redondo: el marcador por defecto de Leaflet es una chincheta con sombra.
 * Un punto con aro en el color de marca mantiene el lenguaje de la interfaz.
 */
function roundedPinIcon(): L.DivIcon {
  return L.divIcon({
    className: 'bm-map-pin',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -14],
    html: '<span class="bm-map-pin__dot"></span>',
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
    class="h-48 w-full overflow-hidden rounded-photo bg-snow sm:h-60"
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
  display: block;
  width: 24px;
  height: 24px;
  box-sizing: border-box;
  border: 3px solid var(--color-canvas);
  border-radius: 9999px;
  background: var(--color-trail);
  box-shadow: 0 1px 3px rgb(0 1 6 / 0.35);
}
</style>
