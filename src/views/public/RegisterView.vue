<script setup lang="ts">
import { reactive, ref } from 'vue'
import { registerUser } from '@/features/auth/services/authService'
import {
  validateRegisterForm,
  type RegisterErrors,
  type RegisterForm,
} from '@/utils/validators/registerValidator'
import AppHeader from '@/components/layout/AppHeader.vue'
import RidgeStrip from '@/components/ui/RidgeStrip.vue'
import PasswordInput from '@/components/ui/PasswordInput.vue'
const form = reactive<RegisterForm>({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const errors = reactive<RegisterErrors>({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
})

function validateForm(): boolean {
  const validationErrors = validateRegisterForm(form)

  Object.assign(errors, validationErrors)

  return Object.values(errors).every((error) => error === '')
}
const submitted = ref(false)
const isSubmitting = ref(false)
const submitError = ref('')
const successMessage = ref('')

async function handleSubmit(): Promise<void> {
  submitted.value = true
  submitError.value = ''
  successMessage.value = ''

  if (!validateForm()) {
    return
  }

  isSubmitting.value = true

  try {
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
  } catch (error: unknown) {
    if (error instanceof Error) {
      submitError.value = error.message
    } else {
      submitError.value = 'No se ha podido completar el registro. Inténtalo de nuevo.'
    }
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-snow text-ink">
    <AppHeader />

    <main class="mx-auto max-w-lg px-4 py-12 sm:px-6">
      <section class="overflow-hidden rounded-card border border-line bg-canvas shadow-card">
        <RidgeStrip />

        <div class="p-6 pt-4 sm:p-8 sm:pt-5">
          <h1 class="text-3xl font-bold">Únete a BikeMates</h1>

          <p class="mt-3 text-graphite">Crea tu cuenta para conectar con otros ciclistas.</p>

          <form novalidate @submit.prevent="handleSubmit" class="mt-8 space-y-5">
            <div>
              <label for="name" class="mb-2 block text-sm font-medium"> Nombre </label>

              <input
                id="name"
                v-model="form.name"
                name="name"
                type="text"
                autocomplete="name"
                :aria-invalid="submitted && Boolean(errors.name)"
                :aria-describedby="submitted && errors.name ? 'name-error' : undefined"
                class="w-full rounded-btn border border-line bg-canvas px-4 py-3 text-ink outline-none transition-colors placeholder:text-graphite focus:border-trail focus:ring-2 focus:ring-trail/25"
                placeholder="Tu nombre"
              />

              <p v-if="submitted && errors.name" id="name-error" class="mt-2 text-sm text-red-600">
                {{ errors.name }}
              </p>
            </div>

            <div>
              <label for="email" class="mb-2 block text-sm font-medium"> Correo electrónico </label>

              <input
                id="email"
                v-model="form.email"
                name="email"
                type="email"
                autocomplete="email"
                :aria-invalid="submitted && Boolean(errors.email)"
                :aria-describedby="submitted && errors.email ? 'email-error' : undefined"
                class="w-full rounded-btn border border-line bg-canvas px-4 py-3 text-ink outline-none transition-colors placeholder:text-graphite focus:border-trail focus:ring-2 focus:ring-trail/25"
                placeholder="nombre@ejemplo.com"
              />

              <p
                v-if="submitted && errors.email"
                id="email-error"
                class="mt-2 text-sm text-red-600"
              >
                {{ errors.email }}
              </p>
            </div>

            <div>
              <label for="password" class="mb-2 block text-sm font-medium"> Contraseña </label>

              <PasswordInput
                id="password"
                v-model="form.password"
                name="password"
                autocomplete="new-password"
                :aria-invalid="submitted && Boolean(errors.password)"
                :aria-describedby="
                  [
                    'password-help',
                    ...(submitted && errors.password ? ['password-error'] : []),
                  ].join(' ')
                "
                placeholder="Mínimo 8 caracteres"
              />

              <p id="password-help" class="mt-2 text-sm text-graphite">
                Utiliza al menos 8 caracteres.
              </p>

              <p
                v-if="submitted && errors.password"
                id="password-error"
                class="mt-2 text-sm text-red-600"
              >
                {{ errors.password }}
              </p>
            </div>

            <div>
              <label for="confirm-password" class="mb-2 block text-sm font-medium">
                Confirmar contraseña
              </label>

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

              <p
                v-if="submitted && errors.confirmPassword"
                id="confirm-password-error"
                class="mt-2 text-sm text-red-600"
              >
                {{ errors.confirmPassword }}
              </p>
            </div>

            <p
              v-if="submitted && Object.values(errors).some((error) => error !== '')"
              role="alert"
              class="text-sm text-red-600"
            >
              Revisa los campos indicados.
            </p>

            <p v-if="successMessage" role="status" class="text-sm text-trail-ink">
              {{ successMessage }}
            </p>
            <p v-if="submitError" role="alert" class="text-sm text-red-600">
              {{ submitError }}
            </p>
            <button
              type="submit"
              :disabled="isSubmitting"
              class="w-full rounded-btn bg-trail px-5 py-3 font-semibold text-ink transition-colors hover:bg-trail-deep disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
            >
              {{ isSubmitting ? 'Creando cuenta…' : 'Crear cuenta' }}
            </button>
          </form>

          <p class="mt-6 text-center text-sm text-graphite">
            ¿Ya tienes cuenta?
            <RouterLink to="/login" class="font-medium text-trail-ink hover:text-trail-dark">
              Inicia sesión
            </RouterLink>
          </p>
        </div>
      </section>
    </main>
  </div>
</template>
