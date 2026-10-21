<script setup lang="ts">
import { faChevronDown } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { ref, watch } from 'vue'
import Alert from '@/components/ui/Alert.vue'
import Button from '@/components/ui/Button.vue'
import Textarea from '@/components/ui/Textarea.vue'
import Typography from '@/components/ui/Typography.vue'
import { useAuthStore } from '@/features/auth/stores/authStore'
import { createRideMessage, deleteRideMessage, getRideMessages } from '../services/rideMessageService'
import { getCurrentUserRole } from '@/features/profile/services/userRoleService'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import { faTrash } from '@fortawesome/free-solid-svg-icons'
import type { RideMessage } from '../types'

const props = defineProps<{ rideId: string }>()

const authStore = useAuthStore()

const messages = ref<RideMessage[]>([])
const isLoading = ref(false)
const newContent = ref('')
const isSubmitting = ref(false)
const submitError = ref<string | null>(null)
const isAdmin = ref(false)
const pendingDeleteId = ref<string | null>(null)

async function loadRole(): Promise<void> {
  isAdmin.value = (await getCurrentUserRole()) === 'admin'
}

function requestDelete(id: string): void {
  pendingDeleteId.value = id
}

async function confirmDelete(): Promise<void> {
  const id = pendingDeleteId.value
  pendingDeleteId.value = null
  if (!id) return

  try {
    await deleteRideMessage(id)
    messages.value = messages.value.filter((message) => message.id !== id)
  } catch {
    submitError.value = 'No se ha podido borrar el comentario.'
  }
}

async function loadMessages(): Promise<void> {
  isLoading.value = true

  try {
    messages.value = await getRideMessages(props.rideId)
  } catch {
    // Sin permisos o fallo de red: la sección queda vacía en lugar de mostrar un error.
    messages.value = []
  } finally {
    isLoading.value = false
  }
}

async function handleSubmit(): Promise<void> {
  if (isSubmitting.value) return

  isSubmitting.value = true
  submitError.value = null

  try {
    const message = await createRideMessage(props.rideId, newContent.value)
    messages.value = [...messages.value, message]
    newContent.value = ''
  } catch (error: unknown) {
    submitError.value =
      error instanceof Error ? error.message : 'No se ha podido publicar el comentario.'
  } finally {
    isSubmitting.value = false
  }
}

watch(
  () => props.rideId,
  () => {
    void loadMessages()
    void loadRole()
  },
  { immediate: true },
)

function formatCreatedAt(value: string): string {
  return new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(value),
  )
}
</script>

<template>
  <section aria-label="Comentarios">
    <details class="group mt-2">
      <summary
        class="inline-flex cursor-pointer list-none items-center gap-2 rounded-btn px-2 py-1 text-sm font-bold text-ink transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
      >
        <FontAwesomeIcon
          :icon="faChevronDown"
          aria-hidden="true"
          class="size-3 text-graphite transition-transform group-open:rotate-180"
        />
        Comentarios
        <span v-if="messages.length > 0" class="text-xs font-medium text-graphite">
          ({{ messages.length }})
        </span>
      </summary>

      <div class="mt-2 border-l border-line pl-4">
        <Typography v-if="isLoading" variant="body-sm" tone="muted" role="status">
          Cargando comentarios…
        </Typography>

        <Typography v-else-if="messages.length === 0 && authStore.user" variant="body-sm" tone="muted">
          Todavía no hay comentarios en esta ruta.
        </Typography>

    <ul v-if="!isLoading && messages.length > 0" class="mt-3 divide-y divide-line border-t border-line">
      <li v-for="message in messages" :key="message.id" class="py-3">
        <div class="flex flex-wrap items-baseline gap-x-2">
          <Typography variant="body-sm" class="font-semibold">
            {{ message.author.displayName }}
          </Typography>
          <Typography as="span" variant="body-sm" tone="muted" class="text-xs">
            <time :datetime="message.createdAt">{{ formatCreatedAt(message.createdAt) }}</time>
          </Typography>
        </div>
        <Typography variant="body-sm" class="mt-1 whitespace-pre-wrap">{{ message.content }}</Typography>

        <button
          v-if="isAdmin"
          type="button"
          class="mt-1 inline-flex items-center gap-1 text-xs font-bold text-graphite transition-colors hover:text-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
          @click="requestDelete(message.id)"
        >
          <FontAwesomeIcon :icon="faTrash" aria-hidden="true" class="size-3" />
          Eliminar
        </button>
      </li>
    </ul>

    <form v-if="authStore.user" class="mt-4" novalidate @submit.prevent="handleSubmit">
      <label for="new-comment" class="sr-only">Escribe un comentario</label>
      <Textarea
        id="new-comment"
        v-model="newContent"
        :rows="3"
        :maxlength="1000"
        placeholder="Escribe un comentario…"
        :disabled="isSubmitting"
      />

      <Alert v-if="submitError" class="mt-2">{{ submitError }}</Alert>

      <Button
        type="submit"
        size="sm"
        class="mt-3"
        :disabled="isSubmitting || newContent.trim() === ''"
      >
        {{ isSubmitting ? 'Enviando…' : 'Comentar' }}
      </Button>
    </form>

        <Typography v-else variant="body-sm" tone="muted" class="mt-3">
          Inicia sesión para comentar en esta ruta.
        </Typography>
      </div>
    </details>
    <ConfirmDialog
      :open="pendingDeleteId !== null"
      tone="danger"
      title="¿Eliminar comentario?"
      description="Esta acción no se puede deshacer."
      confirm-label="Eliminar"
      cancel-label="Cancelar"
      @confirm="confirmDelete"
      @cancel="pendingDeleteId = null"
    />
  </section>
</template>
