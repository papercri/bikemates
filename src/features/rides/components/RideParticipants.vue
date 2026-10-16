<script setup lang="ts">
import { computed } from 'vue'
import Alert from '@/components/ui/Alert.vue'
import Badge from '@/components/ui/Badge.vue'
import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'
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

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
}

function confirmLeave(): void {
  const confirmed = window.confirm('¿Seguro que quieres dejar de participar en esta ruta?')

  if (confirmed) {
    emit('leave')
  }
}
</script>

<template>
  <section aria-labelledby="participants-title">
    <div class="mb-4 flex flex-wrap items-center justify-between gap-4">
      <Typography id="participants-title" as="h2" variant="heading-sm"> Participantes </Typography>

      <Typography variant="body-sm" tone="muted" aria-live="polite">
        {{ participantCount }}
        {{ participantCount === 1 ? 'ciclista' : 'ciclistas' }}
      </Typography>
    </div>

    <Card class="p-5 sm:p-6">
      <div class="mb-5">
        <template v-if="!isAuthenticated">
          <Typography variant="body-sm" tone="muted">
            Inicia sesión para ver la lista y participar en esta ruta.
          </Typography>

          <Button to="/login" class="mt-4"> Iniciar sesión </Button>
        </template>

        <template v-else-if="isOrganizer">
          <Typography variant="body-sm" tone="muted">
            Eres el organizador de esta ruta. Tu inscripción es automática y no puedes darte de
            baja.
          </Typography>
        </template>

        <template v-else-if="isParticipant">
          <Typography variant="body-sm" tone="muted"> Ya estás inscrito en esta ruta. </Typography>

          <Button variant="outline" class="mt-3" :disabled="isSubmitting" @click="confirmLeave">
            {{ isSubmitting ? 'Procesando…' : 'Dejar de participar' }}
          </Button>
        </template>

        <Button
          v-else
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

      <ul v-else class="divide-y divide-line">
        <li
          v-for="participant in participants"
          :key="participant.id"
          class="flex items-center gap-3 py-4 first:pt-0 last:pb-0"
        >
          <img
            v-if="participant.avatarUrl"
            :src="participant.avatarUrl"
            :alt="`Foto de ${participant.displayName}`"
            class="size-11 shrink-0 rounded-full object-cover"
            loading="lazy"
          />

          <div
            v-else
            class="flex size-11 shrink-0 items-center justify-center rounded-full bg-surface text-sm font-semibold text-trail-ink"
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
        </li>
      </ul>
    </Card>
  </section>
</template>
