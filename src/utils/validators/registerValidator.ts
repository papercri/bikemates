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

export function validateRegisterForm(form: RegisterForm): RegisterErrors {
  const errors: RegisterErrors = {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  }

  if (form.name.trim().length < 2) {
    errors.name = 'El nombre debe tener al menos 2 caracteres.'
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!emailPattern.test(form.email.trim())) {
    errors.email = 'Introduce un correo electrónico válido.'
  }

  if (form.password.length < 8) {
    errors.password = 'La contraseña debe tener al menos 8 caracteres.'
  }

  if (form.confirmPassword !== form.password) {
    errors.confirmPassword = 'Las contraseñas no coinciden.'
  }

  return errors
}
