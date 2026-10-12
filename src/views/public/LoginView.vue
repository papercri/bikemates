<script setup lang="ts">
import { useHead } from '@unhead/vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AppPage from '@/components/layout/AppPage.vue'
import AuthCard from '@/components/features/AuthCard.vue'
import FormLabel from '@/components/forms/FormLabel.vue'
import PasswordInput from '@/components/forms/PasswordInput.vue'
import Alert from '@/components/ui/Alert.vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Typography from '@/components/ui/Typography.vue'
import { loginUser } from '@/features/auth/services/authService'

useHead({
  title: 'Iniciar sesión | BikeMates',
})

const router = useRouter()

const email = ref('')
const password = ref('')
const isSubmitting = ref(false)
const errorMessage = ref('')

async function handleSubmit(): Promise<void> {
  errorMessage.value = ''

  if (!email.value.trim() || !password.value) {
    errorMessage.value = 'Introduce tu email y contraseña.'
    return
  }

  isSubmitting.value = true

  try {
    await loginUser({
      email: email.value,
      password: password.value,
    })

    await router.push('/rides')
  } catch {
    errorMessage.value =
      'No se ha podido iniciar sesión. Comprueba tus datos y que hayas confirmado tu email.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <AppPage size="narrow">
    <AuthCard title="Inicia sesión" description="Accede a tu cuenta de BikeMates.">
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

        <div>
          <div class="mb-2 flex items-center justify-between gap-3">
            <FormLabel id="password" :margin="false">Contraseña</FormLabel>

            <RouterLink to="/forgot-password" class="text-sm text-trail-ink hover:text-trail-dark">
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

      <Typography as="p" variant="body-sm" tone="muted" class="mt-6 text-center">
        ¿Todavía no tienes cuenta?
        <RouterLink to="/register" class="font-medium text-trail-ink hover:text-trail-dark">
          Regístrate
        </RouterLink>
      </Typography>
    </AuthCard>
  </AppPage>
</template>
