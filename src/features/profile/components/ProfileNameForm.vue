<script setup lang="ts">
import { ref, watch } from 'vue'
import Alert from '@/components/ui/Alert.vue'
import Button from '@/components/ui/Button.vue'
import FormError from '@/components/ui/FormError.vue'
import FormLabel from '@/components/ui/FormLabel.vue'
import Input from '@/components/ui/Input.vue'
import { updateMyProfile } from '@/features/profile/services/profileService'
import type { Profile } from '@/features/profile/types'
import { validateDisplayName } from '@/features/profile/validators/profileValidator'

const props = defineProps<{
  displayName: string
}>()

const emit = defineEmits<{
  updated: [profile: Profile]
}>()

const name = ref(props.displayName)
const fieldError = ref('')
const saveError = ref('')
const successMessage = ref('')
const isSaving = ref(false)

watch(
  () => props.displayName,
  (value) => {
    name.value = value
  },
)

// Editar el campo invalida el mensaje de éxito del guardado anterior.
watch(name, () => {
  successMessage.value = ''
})

async function handleSubmit(): Promise<void> {
  if (isSaving.value) return

  fieldError.value = ''
  saveError.value = ''
  successMessage.value = ''

  const validationError = validateDisplayName(name.value)

  if (validationError) {
    fieldError.value = validationError
    return
  }

  isSaving.value = true

  try {
    const updated = await updateMyProfile(name.value)
    emit('updated', updated)
    successMessage.value = 'Nombre actualizado correctamente.'
  } catch (error: unknown) {
    saveError.value = error instanceof Error ? error.message : 'No se ha podido guardar el nombre.'
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <form novalidate class="mt-3.5 max-w-md" @submit.prevent="handleSubmit">
    <FormLabel id="profile-display-name">Nombre</FormLabel>

    <Input
      id="profile-display-name"
      v-model="name"
      name="profile-display-name"
      autocomplete="name"
      required
      :aria-invalid="Boolean(fieldError)"
      aria-describedby="profile-display-name-error"
    />

    <FormError v-if="fieldError" id="profile-display-name-error">
      {{ fieldError }}
    </FormError>

    <Alert v-if="saveError" class="mt-2">
      {{ saveError }}
    </Alert>

    <Alert v-if="successMessage" variant="success" class="mt-2">
      {{ successMessage }}
    </Alert>

    <Button type="submit" class="mt-3" :loading="isSaving" :disabled="isSaving">
      {{ isSaving ? 'Guardando…' : 'Guardar nombre' }}
    </Button>
  </form>
</template>
