<script setup lang="ts">
import { reactive, ref } from 'vue'
import Alert from '@/components/ui/Alert.vue'
import Button from '@/components/ui/Button.vue'
import FormError from '@/components/ui/FormError.vue'
import FormLabel from '@/components/ui/FormLabel.vue'
import PasswordInput from '@/components/ui/PasswordInput.vue'
import { updatePassword, verifyCurrentUserPassword } from '@/features/auth/services/authService'
import { validatePassword } from '@/features/auth/validators/passwordValidator'

const form = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const currentError = ref('')
const newError = ref('')
const confirmError = ref('')
const saveError = ref('')
const successMessage = ref('')
const isSaving = ref(false)

function clearMessages(): void {
  currentError.value = ''
  newError.value = ''
  confirmError.value = ''
  saveError.value = ''
  successMessage.value = ''
}

function validateForm(): boolean {
  let isValid = true

  if (!form.currentPassword) {
    currentError.value = 'Introduce tu contraseña actual.'
    isValid = false
  }

  const passwordError = validatePassword(form.newPassword)

  if (passwordError) {
    newError.value = passwordError
    isValid = false
  }

  if (!form.confirmPassword) {
    confirmError.value = 'Confirma la nueva contraseña.'
    isValid = false
  } else if (form.confirmPassword !== form.newPassword) {
    confirmError.value = 'Las contraseñas no coinciden.'
    isValid = false
  }

  return isValid
}

async function handleSubmit(): Promise<void> {
  if (isSaving.value) return

  clearMessages()

  if (!validateForm()) return

  isSaving.value = true

  try {
    const isCurrentPasswordValid = await verifyCurrentUserPassword(form.currentPassword)

    if (!isCurrentPasswordValid) {
      currentError.value = 'La contraseña actual no es correcta.'
      return
    }

    await updatePassword(form.newPassword)

    form.currentPassword = ''
    form.newPassword = ''
    form.confirmPassword = ''
    successMessage.value = 'Contraseña actualizada correctamente.'
  } catch {
    saveError.value = 'No se ha podido actualizar la contraseña. Inténtalo de nuevo más tarde.'
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <form novalidate class="mt-3.5 max-w-md space-y-4" @submit.prevent="handleSubmit">
    <div>
      <FormLabel id="profile-current-password">Contraseña actual</FormLabel>

      <PasswordInput
        id="profile-current-password"
        v-model="form.currentPassword"
        name="profile-current-password"
        autocomplete="current-password"
        required
        :aria-invalid="Boolean(currentError)"
        aria-describedby="profile-current-password-error"
      />

      <FormError v-if="currentError" id="profile-current-password-error">
        {{ currentError }}
      </FormError>
    </div>

    <div>
      <FormLabel id="profile-new-password">Nueva contraseña</FormLabel>

      <PasswordInput
        id="profile-new-password"
        v-model="form.newPassword"
        name="profile-new-password"
        autocomplete="new-password"
        required
        :aria-invalid="Boolean(newError)"
        aria-describedby="profile-new-password-help profile-new-password-error"
      />

      <FormError v-if="newError" id="profile-new-password-error">
        {{ newError }}
      </FormError>
    </div>

    <div>
      <FormLabel id="profile-confirm-password">Confirmar nueva contraseña</FormLabel>

      <PasswordInput
        id="profile-confirm-password"
        v-model="form.confirmPassword"
        name="profile-confirm-password"
        autocomplete="new-password"
        required
        :aria-invalid="Boolean(confirmError)"
        aria-describedby="profile-confirm-password-error"
      />

      <FormError v-if="confirmError" id="profile-confirm-password-error">
        {{ confirmError }}
      </FormError>
    </div>

    <Alert v-if="saveError" boxed>
      {{ saveError }}
    </Alert>

    <Alert v-if="successMessage" variant="success">
      {{ successMessage }}
    </Alert>

    <Button type="submit" :loading="isSaving" :disabled="isSaving">
      {{ isSaving ? 'Actualizando…' : 'Cambiar contraseña' }}
    </Button>
  </form>
</template>
