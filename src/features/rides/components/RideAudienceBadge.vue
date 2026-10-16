<script setup lang="ts">
import { computed } from 'vue'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { faFlag, faMars, faUserGroup, faVenus } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import Badge from '@/components/ui/Badge.vue'
import { RIDE_AUDIENCE_LABELS } from '@/features/rides/constants/rideOptions'
import type { RideAudience } from '@/features/rides/types'

const props = defineProps<{
  audience: RideAudience
}>()

const AUDIENCE_ICONS: Record<RideAudience, IconDefinition> = {
  everyone: faUserGroup,
  women: faVenus,
  men: faMars,
  lgbt: faFlag,
}

const label = computed(() => RIDE_AUDIENCE_LABELS[props.audience])
const icon = computed(() => AUDIENCE_ICONS[props.audience])
const isPrideAudience = computed(() => props.audience === 'lgbt')
</script>

<template>
  <Badge variant="muted" color="ink">
    <!-- La comunidad LGBT+ se identifica con la bandera arcoíris. -->
    <span v-if="isPrideAudience" aria-hidden="true" class="text-[0.95em] leading-none">
      🏳️‍🌈
    </span>
    <FontAwesomeIcon v-else :icon="icon" aria-hidden="true" />
    {{ label }}
  </Badge>
</template>
