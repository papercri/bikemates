<script setup lang="ts">
import { computed, ref } from 'vue'
import { faXmark } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import Alert from '@/components/ui/Alert.vue'
import Badge from '@/components/ui/Badge.vue'
import Button from '@/components/ui/Button.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import Typography from '@/components/ui/Typography.vue'
import type { RideParticipant } from '../types'

interface Props {
  participants: RideParticipant[]
  isLoading: boolean
  errorMessage: string | null
  isAuthenticated: boolean
  currentUserId: string | null
  isSubmitting: boolean
  isOrganizer: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  join: []
  leave: []
}>()

const participantCount = computed(() => props.participants.length)

const isParticipant = computed(
  () =>
    props.currentUserId !== null &&
    props.participants.some((participant) => participant.id === props.currentUserId),
)

const isLeaveDialogOpen = ref(false)

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
}

function requestLeave(): void {
  if (props.isSubmitting) return
  isLeaveDialogOpen.value = true
}

function cancelLeave(): void {
  if (props.isSubmitting) return
  isLeaveDialogOpen.value = false
}

function confirmLeave(): void {
  isLeaveDialogOpen.value = false
  emit('leave')
}
</script>

<template>
  <section aria-labelledby="participants-title">
    <div class="mb-3 flex flex-wrap items-center justify-between gap-4">
      <Typography id="participants-title" as="h2" variant="heading-sm"> Participantes </Typography>

      <Typography variant="body-sm" tone="muted" aria-live="polite">
        {{ participantCount }}
        {{ participantCount === 1 ? 'ciclista' : 'ciclistas' }}
      </Typography>
    </div>

    <div>
      <div class="mb-4">
        <template v-if="!isAuthenticated">
          <Typography variant="body-sm" tone="muted">
            Inicia sesión para ver la lista y participar en esta ruta.
          </Typography>

          <Button to="/login" class="mt-3"> Iniciar sesión </Button>
        </template>

        <template v-else-if="isOrganizer">
          <Typography variant="body-sm" tone="muted">
            Eres el organizador de esta ruta. Tu inscripción es automática y no puedes darte de
            baja.
          </Typography>
        </template>

        <Button
          v-else-if="!isParticipant"
          :disabled="isSubmitting || isLoading || Boolean(errorMessage)"
          @click="emit('join')"
        >
          {{ isSubmitting ? 'Inscribiendo…' : 'Participar en esta ruta' }}
        </Button>
      </div>

      <Typography v-if="isLoading" variant="body-sm" tone="muted" role="status">
        Cargando participantes…
      </Typography>

      <Alert v-else-if="errorMessage">{{ errorMessage }}</Alert>

      <Typography v-else-if="participants.length === 0" variant="body-sm" tone="muted">
        Todavía no hay ciclistas inscritos en esta ruta.
      </Typography>

      <ul v-else class="divide-y divide-line border-t border-line">
        <li
          v-for="participant in participants"
          :key="participant.id"
          class="flex items-center gap-3 py-3"
        >
          <img
            v-if="participant.avatarUrl"
            :src="participant.avatarUrl"
            :alt="`Foto de ${participant.displayName}`"
            class="size-10 shrink-0 rounded-full object-cover"
            loading="lazy"
          />

          <div
            v-else
            class="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface text-sm font-semibold text-graphite"
            aria-hidden="true"
          >
            {{ getInitials(participant.displayName) }}
          </div>

          <div class="min-w-0 flex-1">
            <Typography variant="body-sm" class="font-semibold">
              {{ participant.displayName }}
            </Typography>

            <Badge v-if="participant.isOrganizer" variant="muted"> Organizador </Badge>
          </div>

          <button
            v-if="participant.id === currentUserId"
            type="button"
            class="shrink-0 rounded-btn p-1.5 text-graphite transition-colors hover:text-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="isSubmitting"
            aria-label="Dejar de participar"
            @click="requestLeave"
          >
            <FontAwesomeIcon :icon="faXmark" aria-hidden="true" class="size-4" />
          </button>
        </li>
      </ul>
    </div>

    <ConfirmDialog
      :open="isLeaveDialogOpen"
      tone="danger"
      title="¿Dejar de participar?"
      description="Perderás tu plaza en esta ruta. Puedes inscribirte de nuevo si quedan plazas libres."
      confirm-label="Dejar de participar"
      cancel-label="Cancelar"
      :is-busy="isSubmitting"
      @confirm="confirmLeave"
      @cancel="cancelLeave"
    />
  </section>
</template>
