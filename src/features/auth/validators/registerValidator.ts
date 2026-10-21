import { canUseReservedAdminName, isReservedAdminName } from '@/utils/adminAccount'
import { validatePassword } from './passwordValidator'

export interface RegisterForm {
  name: string
  email: string
  password: string
  confirmPassword: string
  acceptedRules: boolean
}

export interface RegisterErrors {
  name: string
  email: string
  password: string
  confirmPassword: string
  acceptedRules: string
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
// oxlint-disable-next-line no-control-regex -- La detección de caracteres de control es intencional.
const CONTROL_CHARACTERS = /[\u0000-\u001F\u007F]/

export function validateRegisterForm(form: RegisterForm): RegisterErrors {
  const errors: RegisterErrors = {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptedRules: '',
  }

  const name = form.name.trim()
  const email = form.email.trim()

  if (!name) {
    errors.name = 'El nombre es obligatorio.'
  } else if (name.length < 2) {
    errors.name = 'El nombre debe tener al menos 2 caracteres.'
  } else if (name.length > 60) {
    errors.name = 'El nombre no puede superar los 60 caracteres.'
  } else if (CONTROL_CHARACTERS.test(name)) {
    errors.name = 'El nombre contiene caracteres no permitidos.'
  } else if (/[<>]/.test(name)) {
    errors.name = 'El nombre no puede contener etiquetas HTML.'
  } else if (isReservedAdminName(name) && !canUseReservedAdminName(email)) {
    errors.name = 'Solo la cuenta administradora puede usar ese nombre.'
  }

  if (!email) {
    errors.email = 'El correo electrónico es obligatorio.'
  } else if (CONTROL_CHARACTERS.test(email)) {
    errors.email = 'El correo contiene caracteres no permitidos.'
  } else if (email.length > 254 || !EMAIL_PATTERN.test(email)) {
    errors.email = 'Introduce un correo electrónico válido.'
  }

  errors.password = validatePassword(form.password) ?? ''

  if (!form.confirmPassword) {
    errors.confirmPassword = 'Confirma tu contraseña.'
  } else if (form.confirmPassword !== form.password) {
    errors.confirmPassword = 'Las contraseñas no coinciden.'
  }

  if (!form.acceptedRules) {
    errors.acceptedRules = 'Debes aceptar las normas de la comunidad y la política de privacidad.'
  }

  return errors
}
