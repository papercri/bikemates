<script setup lang="ts">
import { useHead } from '@unhead/vue'
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import AppPage from '@/components/layout/AppPage.vue'
import AuthCard from '@/features/auth/components/AuthCard.vue'
import FormLabel from '@/components/ui/FormLabel.vue'
import Alert from '@/components/ui/Alert.vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import { useAuthStore } from '@/features/auth/stores/authStore'
import { updatePassword } from '@/features/auth/services/authService'
import { useAuthForm } from '@/features/auth/composables/useAuthForm'

useHead({
  title: 'Restablecer contraseña | BikeMates',
})

const router = useRouter()
const authStore = useAuthStore()
const { isRecoverySession } = storeToRefs(authStore)

const password = ref('')
const confirmPassword = ref('')
const { isSubmitting, errorMessage, successMessage, clearMessages, submit } = useAuthForm()

async function handleSubmit(): Promise<void> {
  clearMessages()

  if (password.value.length < 8) {
    errorMessage.value = 'La contraseña debe tener al menos 8 caracteres.'
    return
  }

  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Las contraseñas no coinciden.'
    return
  }

  if (!isRecoverySession.value) {
    errorMessage.value = 'Debes acceder desde un enlace válido de recuperación enviado por email.'
    return
  }

  await submit(async () => {
    await updatePassword(password.value)
    successMessage.value = 'Contraseña actualizada correctamente.'

    authStore.clearRecoverySession()
    await router.replace({ name: 'login' })
  }, 'No se ha podido actualizar la contraseña. Solicita un nuevo enlace e inténtalo otra vez.')
}
</script>

<template>
  <AppPage size="narrow">
    <AuthCard
      title="Nueva contraseña"
      description="Introduce una nueva contraseña para tu cuenta de BikeMates."
    >
      <form class="mt-6 space-y-4" novalidate @submit.prevent="handleSubmit">
        <div>
          <FormLabel id="password">Nueva contraseña</FormLabel>

          <Input
            id="password"
            v-model="password"
            type="password"
            autocomplete="new-password"
            required
            placeholder="Mínimo 8 caracteres"
          />
        </div>

        <div>
          <FormLabel id="confirm-password">Confirmar nueva contraseña</FormLabel>

          <Input
            id="confirm-password"
            v-model="confirmPassword"
            type="password"
            autocomplete="new-password"
            required
            placeholder="Repite la nueva contraseña"
          />
        </div>

        <Alert v-if="errorMessage">
          {{ errorMessage }}
        </Alert>

        <Alert v-if="successMessage" variant="success">
          {{ successMessage }}
        </Alert>

        <Button type="submit" block :loading="isSubmitting">
          {{ isSubmitting ? 'Actualizando…' : 'Guardar nueva contraseña' }}
        </Button>
      </form>
    </AuthCard>
  </AppPage>
</template>
