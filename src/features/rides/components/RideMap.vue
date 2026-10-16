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

  marker = L.marker([props.latitude, props.longitude]).addTo(map).bindPopup(props.meetingPoint)
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
    class="h-48 w-full overflow-hidden rounded-3xl bg-snow sm:h-60"
    role="application"
    :aria-label="`Mapa del punto de encuentro: ${meetingPoint}`"
  />
</template>
