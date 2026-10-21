<script setup lang="ts">
import { useHead } from '@unhead/vue'
import { reactive, ref } from 'vue'
import AppPage from '@/components/layout/AppPage.vue'
import AuthCard from '@/features/auth/components/AuthCard.vue'
import FormError from '@/components/ui/FormError.vue'
import FormHelp from '@/components/ui/FormHelp.vue'
import FormLabel from '@/components/ui/FormLabel.vue'
import PasswordInput from '@/components/ui/PasswordInput.vue'
import Alert from '@/components/ui/Alert.vue'
import Button from '@/components/ui/Button.vue'
import Checkbox from '@/components/ui/Checkbox.vue'
import CommunityRulesDialog from '@/components/community/CommunityRulesDialog.vue'
import PrivacyDialog from '@/components/legal/PrivacyDialog.vue'
import Input from '@/components/ui/Input.vue'
import Typography from '@/components/ui/Typography.vue'
import { registerUser } from '@/features/auth/services/authService'
import { useAuthForm } from '@/features/auth/composables/useAuthForm'
import {
  validateRegisterForm,
  type RegisterErrors,
  type RegisterForm,
} from '@/features/auth/validators/registerValidator'

useHead({
  title: 'Crear cuenta | BikeMates',
})

const form = reactive<RegisterForm>({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  acceptedRules: false,
})

const errors = reactive<RegisterErrors>({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  acceptedRules: '',
})

function validateForm(): boolean {
  const validationErrors = validateRegisterForm(form)

  Object.assign(errors, validationErrors)

  return Object.values(errors).every((error) => error === '')
}

const submitted = ref(false)
const showRulesDialog = ref(false)
const showPrivacyDialog = ref(false)
const {
  isSubmitting,
  errorMessage: submitError,
  successMessage,
  clearMessages,
  submit,
} = useAuthForm()

async function handleSubmit(): Promise<void> {
  submitted.value = true
  clearMessages()

  if (!validateForm()) {
    return
  }

  await submit(
    async () => {
      const data = await registerUser({
        name: form.name,
        email: form.email,
        password: form.password,
      })

      if (data.user && !data.session) {
        successMessage.value = 'Cuenta creada. Revisa tu correo para confirmar tu dirección.'
      } else if (data.user && data.session) {
        successMessage.value = 'Registro completado. Ya tienes una sesión activa.'
      } else {
        successMessage.value = 'Solicitud procesada. Comprueba tu correo para continuar.'
      }
    },
    (error) =>
      error instanceof Error
        ? error.message
        : 'No se ha podido completar el registro. Inténtalo de nuevo.',
  )
}
</script>

<template>
  <AppPage>
    <AuthCard
      title="Únete a BikeMates"
      description="Crea tu cuenta para conectar con otros ciclistas."
    >
      <form novalidate class="mt-6 space-y-4" @submit.prevent="handleSubmit">
        <div>
          <FormLabel id="name">Nombre</FormLabel>

          <Input
            id="name"
            v-model="form.name"
            name="name"
            type="text"
            autocomplete="name"
            :aria-invalid="submitted && Boolean(errors.name)"
            :aria-describedby="submitted && errors.name ? 'name-error' : undefined"
            placeholder="Tu nombre"
          />

          <FormError v-if="submitted && errors.name" id="name-error">
            {{ errors.name }}
          </FormError>
        </div>

        <div>
          <FormLabel id="email">Correo electrónico</FormLabel>

          <Input
            id="email"
            v-model="form.email"
            name="email"
            type="email"
            autocomplete="email"
            :aria-invalid="submitted && Boolean(errors.email)"
            :aria-describedby="submitted && errors.email ? 'email-error' : undefined"
            placeholder="nombre@ejemplo.com"
          />

          <FormError v-if="submitted && errors.email" id="email-error">
            {{ errors.email }}
          </FormError>
        </div>

        <div>
          <FormLabel id="password">Contraseña</FormLabel>

          <PasswordInput
            id="password"
            v-model="form.password"
            name="password"
            autocomplete="new-password"
            :aria-invalid="submitted && Boolean(errors.password)"
            :aria-describedby="
              ['password-help', ...(submitted && errors.password ? ['password-error'] : [])].join(
                ' ',
              )
            "
            placeholder="Mínimo 8 caracteres"
          />

          <FormHelp id="password-help">Utiliza al menos 8 caracteres.</FormHelp>

          <FormError v-if="submitted && errors.password" id="password-error">
            {{ errors.password }}
          </FormError>
        </div>

        <div>
          <FormLabel id="confirm-password">Confirmar contraseña</FormLabel>

          <PasswordInput
            id="confirm-password"
            v-model="form.confirmPassword"
            name="confirmPassword"
            autocomplete="new-password"
            :aria-invalid="submitted && Boolean(errors.confirmPassword)"
            :aria-describedby="
              submitted && errors.confirmPassword ? 'confirm-password-error' : undefined
            "
            placeholder="Repite la contraseña"
          />

          <FormError v-if="submitted && errors.confirmPassword" id="confirm-password-error">
            {{ errors.confirmPassword }}
          </FormError>
        </div>

        <div>
          <Checkbox
            id="accepted-rules"
            v-model="form.acceptedRules"
            size="xs"
            :aria-invalid="submitted && Boolean(errors.acceptedRules)"
            :aria-describedby="
              submitted && errors.acceptedRules ? 'accepted-rules-error' : undefined
            "
          >
            He leído y acepto las
            <button
              type="button"
              class="text-graphite underline underline-offset-2 transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
              @click.stop.prevent="showRulesDialog = true"
            >
              normas de la comunidad
            </button>
            y la
            <button
              type="button"
              class="text-graphite underline underline-offset-2 transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
              @click.stop.prevent="showPrivacyDialog = true"
            >
              política de privacidad
            </button>
          </Checkbox>

          <FormError v-if="submitted && errors.acceptedRules" id="accepted-rules-error">
            {{ errors.acceptedRules }}
          </FormError>
        </div>

        <Alert v-if="submitted && Object.values(errors).some((error) => error !== '')">
          Revisa los campos indicados.
        </Alert>

        <Alert v-if="successMessage" variant="success">
          {{ successMessage }}
        </Alert>

        <Alert v-if="submitError">
          {{ submitError }}
        </Alert>

        <Button type="submit" block :loading="isSubmitting">
          {{ isSubmitting ? 'Creando cuenta…' : 'Crear cuenta' }}
        </Button>
      </form>

      <CommunityRulesDialog :open="showRulesDialog" @close="showRulesDialog = false" />
      <PrivacyDialog :open="showPrivacyDialog" @close="showPrivacyDialog = false" />

      <Typography as="p" variant="body-sm" tone="muted" class="mt-5 text-center">
        ¿Ya tienes cuenta?
        <RouterLink
          to="/login"
          class="font-medium text-trail-ink hover:text-trail-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        >
          Inicia sesión
        </RouterLink>
      </Typography>
    </AuthCard>
  </AppPage>
</template>
