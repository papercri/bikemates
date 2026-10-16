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
import { loginUser } from '@/features/auth/services/authService'
import { useAuthForm } from '@/features/auth/composables/useAuthForm'

useHead({
  title: 'Iniciar sesión | BikeMates',
})

const router = useRouter()

const email = ref('')
const password = ref('')
const { isSubmitting, errorMessage, clearMessages, submit } = useAuthForm()

async function handleSubmit(): Promise<void> {
  clearMessages()

  if (!email.value.trim() || !password.value) {
    errorMessage.value = 'Introduce tu email y contraseña.'
    return
  }

  await submit(async () => {
    await loginUser({
      email: email.value,
      password: password.value,
    })

    await router.push('/rides')
  }, 'No se ha podido iniciar sesión. Comprueba tus datos y que hayas confirmado tu email.')
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
              class="text-sm text-trail-ink hover:text-trail-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-trail"
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

        <Button type="submit" block :loading="isSubmitting">
          {{ isSubmitting ? 'Iniciando sesión…' : 'Iniciar sesión' }}
        </Button>
      </form>

      <Typography as="p" variant="body-sm" tone="muted" class="mt-5 text-center">
        ¿Todavía no tienes cuenta?
        <RouterLink
          to="/register"
          class="font-medium text-trail-ink hover:text-trail-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-trail"
        >
          Regístrate
        </RouterLink>
      </Typography>
    </AuthCard>
  </AppPage>
</template>
