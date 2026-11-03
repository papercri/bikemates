<script setup lang="ts">
import { useHead } from '@unhead/vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AppPage from '@/components/layout/AppPage.vue'
import AuthCard from '@/features/auth/components/AuthCard.vue'
import FormLabel from '@/components/ui/FormLabel.vue'
import PasswordInput from '@/components/ui/PasswordInput.vue'
import Alert from '@/components/ui/Alert.vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Typography from '@/components/ui/Typography.vue'
import {
  EmailNotConfirmedError,
  loginUser,
  resendConfirmationEmail,
} from '@/features/auth/services/authService'
import { useAuthForm } from '@/features/auth/composables/useAuthForm'

useHead({
  title: 'Iniciar sesión | BikeMates',
})

const router = useRouter()

const email = ref('')
const password = ref('')
const showConfirmationHelp = ref(false)
const isResending = ref(false)
const resendMessage = ref('')
const { isSubmitting, errorMessage, clearMessages, submit } = useAuthForm()

async function handleSubmit(): Promise<void> {
  clearMessages()
  showConfirmationHelp.value = false
  resendMessage.value = ''

  if (!email.value.trim() || !password.value) {
    errorMessage.value = 'Introduce tu email y contraseña.'
    return
  }

  await submit(
    async () => {
      await loginUser({
        email: email.value,
        password: password.value,
      })

      await router.push('/rides')
    },
    (error) => {
      if (error instanceof EmailNotConfirmedError) {
        showConfirmationHelp.value = true
        return 'Tu cuenta existe pero tu correo aún no está confirmado. Reenvía el correo de confirmación o recupera tu contraseña.'
      }

      return 'No se ha podido iniciar sesión. Comprueba tus datos y que hayas confirmado tu email.'
    },
  )
}

async function handleResendConfirmation(): Promise<void> {
  resendMessage.value = ''
  errorMessage.value = ''
  isResending.value = true

  try {
    await resendConfirmationEmail(email.value)
    resendMessage.value =
      'Correo de confirmación reenviado. Revisa tu bandeja de entrada y el correo no deseado.'
  } catch (error: unknown) {
    errorMessage.value =
      error instanceof Error
        ? error.message
        : 'No se ha podido reenviar el correo. Inténtalo de nuevo.'
  } finally {
    isResending.value = false
  }
}
</script>

<template>
  <AppPage>
    <AuthCard title="Inicia sesión" description="Accede a tu cuenta de BikeMates.">
      <form class="mt-6 space-y-4" novalidate @submit.prevent="handleSubmit">
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

        <div>
          <div class="mb-2 flex items-center justify-between gap-3">
            <FormLabel id="password" :margin="false">Contraseña</FormLabel>

            <RouterLink
              to="/forgot-password"
              class="text-sm text-trail-ink hover:text-trail-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            >
              ¿La has olvidado?
            </RouterLink>
          </div>

          <PasswordInput
            id="password"
            v-model="password"
            name="password"
            autocomplete="current-password"
            required
            placeholder="Tu contraseña"
          />
        </div>

        <Alert v-if="errorMessage">
          {{ errorMessage }}
        </Alert>

        <div v-if="showConfirmationHelp" class="space-y-3">
          <Button
            type="button"
            variant="outline"
            block
            :loading="isResending"
            @click="handleResendConfirmation"
          >
            {{ isResending ? 'Reenviando…' : 'Reenviar correo de confirmación' }}
          </Button>

          <Alert v-if="resendMessage" variant="success">
            {{ resendMessage }}
          </Alert>

          <Typography as="p" variant="body-sm" tone="muted" class="text-center">
            ¿No recuerdas tu contraseña?
            <RouterLink
              to="/forgot-password"
              class="font-medium text-trail-ink hover:text-trail-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            >
              Restablecer contraseña
            </RouterLink>
          </Typography>
        </div>

        <Button type="submit" block :loading="isSubmitting">
          {{ isSubmitting ? 'Iniciando sesión…' : 'Iniciar sesión' }}
        </Button>
      </form>

      <Typography as="p" variant="body-sm" tone="muted" class="mt-5 text-center">
        ¿Todavía no tienes cuenta?
        <RouterLink
          to="/register"
          class="font-medium text-trail-ink hover:text-trail-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        >
          Regístrate
        </RouterLink>
      </Typography>
    </AuthCard>
  </AppPage>
</template>
