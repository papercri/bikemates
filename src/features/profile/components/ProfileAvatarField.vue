<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { faCamera } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import Alert from '@/components/ui/Alert.vue'
import Button from '@/components/ui/Button.vue'
import { saveAvatar } from '@/features/profile/services/profileService'
import type { Profile } from '@/features/profile/types'
import { validateAvatarImage } from '@/features/profile/validators/profileValidator'

const props = defineProps<{
  avatarUrl: string | null
  displayName: string
}>()

const emit = defineEmits<{
  updated: [profile: Profile]
}>()

const avatarInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const previewUrl = ref<string | null>(null)
const imageError = ref('')
const saveError = ref('')
const isSaving = ref(false)
const justSaved = ref(false)

const initials = computed(() => {
  const parts = props.displayName.trim().split(/\s+/).filter(Boolean)
  const first = parts[0]?.charAt(0) ?? ''
  const second = parts[1]?.charAt(0) ?? ''
  return (first + second).toUpperCase() || '?'
})

/** La selección pendiente tiene prioridad sobre la foto guardada. */
const visibleAvatarUrl = computed(() => previewUrl.value ?? props.avatarUrl)

function revokePreview(): void {
  if (!previewUrl.value) return

  URL.revokeObjectURL(previewUrl.value)
  previewUrl.value = null
}

function handleFileChange(event: Event): void {
  const input = event.target

  if (!(input instanceof HTMLInputElement)) return

  const file = input.files?.[0]

  if (!file) return

  const error = validateAvatarImage(file)

  if (error) {
    input.value = ''
    imageError.value = error
    return
  }

  revokePreview()

  selectedFile.value = file
  previewUrl.value = URL.createObjectURL(file)
  imageError.value = ''
  saveError.value = ''
  justSaved.value = false
}

function discardSelection(): void {
  revokePreview()
  selectedFile.value = null
  justSaved.value = false
  imageError.value = ''

  if (avatarInput.value) {
    avatarInput.value.value = ''
  }
}

async function handleSave(): Promise<void> {
  if (!selectedFile.value || isSaving.value) return

  isSaving.value = true
  saveError.value = ''

  try {
    const updated = await saveAvatar(selectedFile.value)
    emit('updated', updated)
    discardSelection()
    justSaved.value = true
  } catch (error: unknown) {
    saveError.value = error instanceof Error ? error.message : 'No se ha podido guardar la foto.'
  } finally {
    isSaving.value = false
  }
}

onBeforeUnmount(revokePreview)
</script>

<template>
  <div>
    <div class="flex items-center gap-5">
      <div
        class="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface ring-1 ring-line"
      >
        <img
          v-if="visibleAvatarUrl"
          :src="visibleAvatarUrl"
          :alt="`Foto de perfil de ${displayName}`"
          class="h-full w-full object-cover"
        />
        <span
          v-else
          aria-hidden="true"
          class="font-display text-xl font-semibold tracking-tight text-graphite"
        >
          {{ initials }}
        </span>
      </div>

      <div class="flex flex-col items-start gap-2">
        <label
          for="avatar-file"
          class="inline-flex cursor-pointer items-center justify-center gap-2 rounded-btn border border-line-strong bg-white px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-graphite hover:bg-snow focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ink"
        >
          <FontAwesomeIcon :icon="faCamera" aria-hidden="true" class="size-4" />
          Elegir foto
        </label>

        <input
          id="avatar-file"
          ref="avatarInput"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          class="sr-only"
          @change="handleFileChange"
        />

        <p class="text-xs text-graphite">JPEG, PNG, WebP o AVIF. Máximo 5 MB.</p>
      </div>
    </div>

    <div v-if="selectedFile" class="mt-3 flex flex-wrap items-center gap-3">
      <Button type="button" size="sm" :loading="isSaving" :disabled="isSaving" @click="handleSave">
        {{ isSaving ? 'Guardando…' : 'Guardar foto' }}
      </Button>

      <Button
        type="button"
        variant="outline"
        size="sm"
        :disabled="isSaving"
        @click="discardSelection"
      >
        Descartar
      </Button>
    </div>

    <Alert v-if="imageError" class="mt-2">
      {{ imageError }}
    </Alert>

    <Alert v-if="saveError" class="mt-2">
      {{ saveError }}
    </Alert>

    <Alert v-if="justSaved" variant="success" class="mt-2"> Foto de perfil actualizada. </Alert>
  </div>
</template>
