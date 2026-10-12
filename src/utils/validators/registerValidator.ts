export interface RegisterForm {
  name: string
  email: string
  password: string
  confirmPassword: string
}

export interface RegisterErrors {
  name: string
  email: string
  password: string
  confirmPassword: string
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
  }

  if (!email) {
    errors.email = 'El correo electrónico es obligatorio.'
  } else if (CONTROL_CHARACTERS.test(email)) {
    errors.email = 'El correo contiene caracteres no permitidos.'
  } else if (email.length > 254 || !EMAIL_PATTERN.test(email)) {
    errors.email = 'Introduce un correo electrónico válido.'
  }

  if (!form.password) {
    errors.password = 'La contraseña es obligatoria.'
  } else if (form.password.length < 8) {
    errors.password = 'La contraseña debe tener al menos 8 caracteres.'
  } else if (form.password.length > 128) {
    errors.password = 'La contraseña no puede superar los 128 caracteres.'
  } else if (CONTROL_CHARACTERS.test(form.password)) {
    errors.password = 'La contraseña contiene caracteres de control no permitidos.'
  } else if (!/[A-Za-zÀ-ÿ]/.test(form.password)) {
    errors.password = 'La contraseña debe incluir al menos una letra.'
  } else if (!/\d/.test(form.password)) {
    errors.password = 'La contraseña debe incluir al menos un número.'
  }

  if (!form.confirmPassword) {
    errors.confirmPassword = 'Confirma tu contraseña.'
  } else if (form.confirmPassword !== form.password) {
    errors.confirmPassword = 'Las contraseñas no coinciden.'
  }

  return errors
}
