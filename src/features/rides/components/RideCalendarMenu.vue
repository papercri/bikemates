<script setup lang="ts">
import { faCalendar, faCalendarPlus, faDownload } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import DropdownMenu from '@/components/ui/DropdownMenu.vue'
import { MENU_ITEM_CLASSES, MENU_ITEM_ICON_CLASSES } from '@/design-system'
import type { RideCalendarEntry } from '@/features/rides/utils/rideCalendar'
import {
  buildGoogleCalendarUrl,
  buildOutlookCalendarUrl,
  buildRideIcs,
} from '@/features/rides/utils/rideCalendar'

interface Props {
  entry: RideCalendarEntry
}

const props = defineProps<Props>()

const emit = defineEmits<{
  /** El archivo .ics se ha descargado correctamente. */
  downloaded: []
  /** No se ha podido generar o descargar el .ics. */
  error: []
}>()

/** Descarga el .ics como archivo del sistema. */
function downloadIcs(): void {
  try {
    const contents = buildRideIcs(props.entry)
    const blob = new Blob([contents], { type: 'text/calendar;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `bikemates-ride-${props.entry.id}.ics`
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    URL.revokeObjectURL(url)
    emit('downloaded')
  } catch {
    emit('error')
  }
}
</script>

<template>
  <DropdownMenu
    label="Añadir al calendario"
    trigger-label="Añadir al calendario"
    trigger-class="inline-flex size-8 items-center justify-center rounded-btn border border-line-strong bg-white text-graphite transition-colors hover:border-graphite hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal-blue"
  >
    <template #trigger>
      <FontAwesomeIcon :icon="faCalendarPlus" aria-hidden="true" class="text-sm" />
    </template>

    <template #default>
      <a
        role="menuitem"
        :class="MENU_ITEM_CLASSES"
        :href="buildGoogleCalendarUrl(props.entry)"
        target="_blank"
        rel="noopener noreferrer"
      >
        <FontAwesomeIcon :icon="faCalendar" aria-hidden="true" :class="MENU_ITEM_ICON_CLASSES" />
        Google Calendar
      </a>

      <a
        role="menuitem"
        :class="MENU_ITEM_CLASSES"
        :href="buildOutlookCalendarUrl(props.entry)"
        target="_blank"
        rel="noopener noreferrer"
      >
        <FontAwesomeIcon :icon="faCalendar" aria-hidden="true" :class="MENU_ITEM_ICON_CLASSES" />
        Outlook
      </a>

      <button type="button" role="menuitem" :class="MENU_ITEM_CLASSES" @click="downloadIcs">
        <FontAwesomeIcon :icon="faDownload" aria-hidden="true" :class="MENU_ITEM_ICON_CLASSES" />
        Descargar .ics
      </button>
    </template>
  </DropdownMenu>
</template>
