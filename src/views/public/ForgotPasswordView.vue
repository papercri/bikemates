<script setup lang="ts">
import { ref } from 'vue'
import AppPage from '@/components/layout/AppPage.vue'
import AuthCard from '@/components/features/AuthCard.vue'
import FormLabel from '@/components/forms/FormLabel.vue'
import Alert from '@/components/ui/Alert.vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Typography from '@/components/ui/Typography.vue'
import { requestPasswordReset } from '@/features/auth/services/authService'

const email = ref('')
const isSubmitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

async function handleSubmit(): Promise<void> {
  errorMessage.value = ''
  successMessage.value = ''

  if (!email.value.trim()) {
    errorMessage.value = 'Introduce tu correo electrónico.'
    return
  }

  isSubmitting.value = true

  try {
    await requestPasswordReset(email.value, `${window.location.origin}/reset-password`)

    successMessage.value =
      'Si la dirección está registrada, recibirás un correo con las instrucciones para recuperar tu contraseña.'
  } catch {
    errorMessage.value = 'No se ha podido procesar la solicitud. Inténtalo de nuevo más tarde.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <AppPage size="narrow">
    <AuthCard
      title="Recuperar contraseña"
      description="Introduce el email de tu cuenta y te enviaremos las instrucciones para establecer una nueva contraseña."
    >
      <form class="mt-8 space-y-5" novalidate @submit.prevent="handleSubmit">
        <div>
          <FormLabel id="email">Correo electrónico</FormLabel>

          <Input
            id="email"
            v-model="email"
            name="email"
            type="email"
            autocomplete="email"
            required
            placeholder="nombre@ejemplo.com"
          />
        </div>

        <Alert v-if="errorMessage">
          {{ errorMessage }}
        </Alert>

        <Alert v-if="successMessage" variant="success">
          {{ successMessage }}
        </Alert>

        <Button type="submit" block :loading="isSubmitting">
          {{ isSubmitting ? 'Enviando…' : 'Enviar instrucciones' }}
        </Button>
      </form>

      <Typography as="p" variant="body-sm" tone="muted" class="mt-6 text-center">
        <RouterLink to="/login" class="text-trail-ink hover:text-trail-dark">
          Volver al inicio de sesión
        </RouterLink>
      </Typography>
    </AuthCard>
  </AppPage>
</template>
