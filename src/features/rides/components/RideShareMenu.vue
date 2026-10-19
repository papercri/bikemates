<script setup lang="ts">
import {
  faFacebook,
  faTelegram,
  faWhatsapp,
  faXTwitter,
} from '@fortawesome/free-brands-svg-icons'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { faEnvelope, faLink, faShareNodes } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { computed } from 'vue'
import DropdownMenu from '@/components/ui/DropdownMenu.vue'
import { MENU_ITEM_CLASSES, MENU_ITEM_ICON_CLASSES } from '@/design-system'
import type { RideShareTarget } from '@/features/rides/utils/rideShare'
import { buildRideShareLinks } from '@/features/rides/utils/rideShare'

interface Props {
  title: string
  url: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  /** El enlace se ha copiado al portapapeles. */
  copied: []
  /** La copia al portapapeles ha fallado (p. ej. sin permisos). */
  copyError: []
}>()

const shareLinks = computed(() => buildRideShareLinks({ title: props.title, url: props.url }))

const TARGET_ICONS: Record<RideShareTarget, IconDefinition> = {
  whatsapp: faWhatsapp,
  telegram: faTelegram,
  x: faXTwitter,
  facebook: faFacebook,
  email: faEnvelope,
}

async function copyLink(): Promise<void> {
  try {
    await navigator.clipboard.writeText(props.url)
    emit('copied')
  } catch {
    emit('copyError')
  }
}
</script>

<template>
  <DropdownMenu label="Compartir ruta" trigger-variant="outline" trigger-size="sm">
    <template #trigger>
      <FontAwesomeIcon :icon="faShareNodes" aria-hidden="true" />
      <span>Compartir</span>
    </template>

    <template #default>
      <a
        v-for="link in shareLinks"
        :key="link.target"
        role="menuitem"
        :class="MENU_ITEM_CLASSES"
        :href="link.href"
        target="_blank"
        rel="noopener noreferrer"
      >
        <FontAwesomeIcon
          :icon="TARGET_ICONS[link.target]"
          aria-hidden="true"
          :class="MENU_ITEM_ICON_CLASSES"
        />
        {{ link.label }}
      </a>

      <button type="button" role="menuitem" :class="MENU_ITEM_CLASSES" @click="copyLink">
        <FontAwesomeIcon :icon="faLink" aria-hidden="true" :class="MENU_ITEM_ICON_CLASSES" />
        Copiar enlace
      </button>
    </template>
  </DropdownMenu>
</template>
