import { test, expect } from '../helpers/fixtures'

test.describe('register', () => {
  test('shows the form with its labels and helpers', async ({ page }) => {
    await page.goto('/register')

    await expect(page.getByRole('heading', { level: 1, name: 'Únete a BikeMates' })).toBeVisible()
    await expect(page.getByLabel('Nombre')).toBeVisible()
    await expect(page.getByLabel('Correo electrónico')).toBeVisible()
    await expect(page.getByLabel('Contraseña', { exact: true })).toBeVisible()
    await expect(page.getByLabel('Confirmar contraseña')).toBeVisible()
    await expect(page.getByText('Utiliza al menos 8 caracteres.')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Crear cuenta' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Inicia sesión' })).toBeVisible()
  })

  test('validates every field before submitting', async ({ page }) => {
    await page.goto('/register')
    await page.getByRole('button', { name: 'Crear cuenta' }).click()

    await expect(page.getByText('Revisa los campos indicados.')).toBeVisible()
    await expect(page.locator('#name-error')).toHaveText('El nombre es obligatorio.')
    await expect(page.locator('#email-error')).toHaveText('El correo electrónico es obligatorio.')
    await expect(page.locator('#password-error')).toHaveText('La contraseña es obligatoria.')
    await expect(page.locator('#confirm-password-error')).toHaveText('Confirma tu contraseña.')
  })

  test('rejects a short password with a clear message', async ({ page }) => {
    await page.goto('/register')
    await page.getByLabel('Nombre').fill('Ana Pedal')
    await page.getByLabel('Correo electrónico').fill('ana@example.com')
    await page.getByLabel('Contraseña', { exact: true }).fill('corta')
    await page.getByLabel('Confirmar contraseña').fill('corta')
    await page.getByRole('button', { name: 'Crear cuenta' }).click()

    await expect(page.locator('#password-error')).toHaveText(
      'La contraseña debe tener al menos 8 caracteres.',
    )
  })

  test('rejects mismatched passwords', async ({ page }) => {
    await page.goto('/register')
    await page.getByLabel('Nombre').fill('Ana Pedal')
    await page.getByLabel('Correo electrónico').fill('ana@example.com')
    await page.getByLabel('Contraseña', { exact: true }).fill('pedaleando123')
    await page.getByLabel('Confirmar contraseña').fill('otracosa123')
    await page.getByRole('button', { name: 'Crear cuenta' }).click()

    await expect(page.locator('#confirm-password-error')).toHaveText(
      'Las contraseñas no coinciden.',
    )
  })

  test('rejects a password without a number', async ({ page }) => {
    await page.goto('/register')
    await page.getByLabel('Nombre').fill('Ana Pedal')
    await page.getByLabel('Correo electrónico').fill('ana@example.com')
    await page.getByLabel('Contraseña', { exact: true }).fill('sololettras')
    await page.getByLabel('Confirmar contraseña').fill('sololettras')
    await page.getByRole('button', { name: 'Crear cuenta' }).click()

    await expect(page.locator('#password-error')).toHaveText(
      'La contraseña debe incluir al menos un número.',
    )
  })

  test('creates the account and asks to confirm the email', async ({ page }) => {
    await page.goto('/register')
    await page.getByLabel('Nombre').fill('Ana Pedal')
    await page.getByLabel('Correo electrónico').fill('ana.nueva@example.com')
    await page.getByLabel('Contraseña', { exact: true }).fill('pedaleando123')
    await page.getByLabel('Confirmar contraseña').fill('pedaleando123')
    await page.getByRole('button', { name: 'Crear cuenta' }).click()

    await expect(page.getByRole('status')).toHaveText(
      'Cuenta creada. Revisa tu correo para confirmar tu dirección.',
    )
    // No se navega: la vista permanece en el formulario.
    await expect(page).toHaveURL('/register')
  })

  test('reports an already registered email', async ({ page, supabase }) => {
    supabase.state.users.push({
      id: 'user-1',
      email: 'ocupado@example.com',
      displayName: 'Ocupado',
      password: 'pedaleando123',
    })

    await page.goto('/register')
    await page.getByLabel('Nombre').fill('Ana Pedal')
    await page.getByLabel('Correo electrónico').fill('ocupado@example.com')
    await page.getByLabel('Contraseña', { exact: true }).fill('pedaleando123')
    await page.getByLabel('Confirmar contraseña').fill('pedaleando123')
    await page.getByRole('button', { name: 'Crear cuenta' }).click()

    await expect(page.getByRole('alert')).toContainText(
      'Email ya registrado. Por favor, inicia sesión o utiliza otro correo electrónico.',
    )
  })

  test('shows the busy label while creating the account', async ({ page, supabase }) => {
    supabase.state.authDelayMs = 600

    await page.goto('/register')
    await page.getByLabel('Nombre').fill('Ana Pedal')
    await page.getByLabel('Correo electrónico').fill('lenta@example.com')
    await page.getByLabel('Contraseña', { exact: true }).fill('pedaleando123')
    await page.getByLabel('Confirmar contraseña').fill('pedaleando123')
    await page.getByRole('button', { name: 'Crear cuenta' }).click()

    await expect(page.getByRole('button', { name: 'Creando cuenta…' })).toBeDisabled()
  })
})
