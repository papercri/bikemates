<script setup lang="ts">
import { reactive, ref } from 'vue'
import { registerUser } from '@/features/auth/services/authService'
import {
  validateRegisterForm,
  type RegisterErrors,
  type RegisterForm,
} from '@/utils/validators/registerValidator'
import AppHeader from '@/components/layout/AppHeader.vue'
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
  <div class="min-h-screen bg-slate-950 text-white">
    <AppHeader />

    <main class="mx-auto max-w-lg px-4 py-12 sm:px-6">
      <section class="rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8">
        <h1 class="text-3xl font-bold">Únete a BikeMates</h1>

        <p class="mt-3 text-slate-400">Crea tu cuenta para conectar con otros ciclistas.</p>

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
              class="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
              placeholder="Tu nombre"
            />

            <p v-if="submitted && errors.name" id="name-error" class="mt-2 text-sm text-red-400">
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
              class="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
              placeholder="nombre@ejemplo.com"
            />

            <p v-if="submitted && errors.email" id="email-error" class="mt-2 text-sm text-red-400">
              {{ errors.email }}
            </p>
          </div>

          <div>
            <label for="password" class="mb-2 block text-sm font-medium"> Contraseña </label>

            <input
              id="password"
              v-model="form.password"
              name="password"
              type="password"
              autocomplete="new-password"
              :aria-invalid="submitted && Boolean(errors.password)"
              :aria-describedby="
                ['password-help', ...(submitted && errors.password ? ['password-error'] : [])].join(
                  ' ',
                )
              "
              class="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
              placeholder="Mínimo 8 caracteres"
            />

            <p id="password-help" class="mt-2 text-sm text-slate-400">
              Utiliza al menos 8 caracteres.
            </p>

            <p
              v-if="submitted && errors.password"
              id="password-error"
              class="mt-2 text-sm text-red-400"
            >
              {{ errors.password }}
            </p>
          </div>

          <div>
            <label for="confirm-password" class="mb-2 block text-sm font-medium">
              Confirmar contraseña
            </label>

            <input
              id="confirm-password"
              v-model="form.confirmPassword"
              name="confirmPassword"
              type="password"
              autocomplete="new-password"
              :aria-invalid="submitted && Boolean(errors.confirmPassword)"
              :aria-describedby="
                submitted && errors.confirmPassword ? 'confirm-password-error' : undefined
              "
              class="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
              placeholder="Repite la contraseña"
            />

            <p
              v-if="submitted && errors.confirmPassword"
              id="confirm-password-error"
              class="mt-2 text-sm text-red-400"
            >
              {{ errors.confirmPassword }}
            </p>
          </div>

          <p
            v-if="submitted && Object.values(errors).some((error) => error !== '')"
            role="alert"
            class="text-sm text-red-400"
          >
            Revisa los campos indicados.
          </p>

          <p v-if="successMessage" role="status" class="text-sm text-emerald-400">
            {{ successMessage }}
          </p>
          <p v-if="submitError" role="alert" class="text-sm text-red-400">
            {{ submitError }}
          </p>
          <button
            type="submit"
            :disabled="isSubmitting"
            class="w-full rounded-lg bg-cyan-400 px-5 py-3 font-semibold text-slate-950 transition-colors hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          >
            {{ isSubmitting ? 'Creando cuenta…' : 'Crear cuenta' }}
          </button>
        </form>

        <p class="mt-6 text-center text-sm text-slate-400">
          ¿Ya tienes cuenta?
          <RouterLink to="/login" class="font-medium text-cyan-400 hover:text-cyan-300">
            Inicia sesión
          </RouterLink>
        </p>
      </section>
    </main>
  </div>
</template>
