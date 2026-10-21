<script setup lang="ts">
import { ref, watch } from 'vue'
import Alert from '@/components/ui/Alert.vue'
import Button from '@/components/ui/Button.vue'
import Textarea from '@/components/ui/Textarea.vue'
import Typography from '@/components/ui/Typography.vue'
import { useAuthStore } from '@/features/auth/stores/authStore'
import { createRideMessage, getRideMessages } from '../services/rideMessageService'
import type { RideMessage } from '../types'

const props = defineProps<{ rideId: string }>()

const authStore = useAuthStore()

const messages = ref<RideMessage[]>([])
const isLoading = ref(false)
const errorMessage = ref<string | null>(null)
const newContent = ref('')
const isSubmitting = ref(false)
const submitError = ref<string | null>(null)

async function loadMessages(): Promise<void> {
  isLoading.value = true
  errorMessage.value = null

  try {
    messages.value = await getRideMessages(props.rideId)
  } catch (error: unknown) {
    errorMessage.value =
      error instanceof Error ? error.message : 'No se han podido cargar los comentarios.'
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
  <section aria-labelledby="comments-title">
    <Typography id="comments-title" as="h2" variant="heading-sm" class="font-bold">
      Comentarios
    </Typography>

    <Typography v-if="isLoading" variant="body-sm" tone="muted" role="status" class="mt-3">
      Cargando comentarios…
    </Typography>

    <Alert v-else-if="errorMessage" class="mt-3">{{ errorMessage }}</Alert>

    <Typography v-else-if="messages.length === 0" variant="body-sm" tone="muted" class="mt-3">
      Todavía no hay comentarios en esta ruta.
    </Typography>

    <ul v-else class="mt-3 divide-y divide-line border-t border-line">
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
  </section>
</template>
