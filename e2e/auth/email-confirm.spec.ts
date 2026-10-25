import { test, expect } from '../helpers/fixtures'
import { ORGANIZER } from '../helpers/seeds'

test.describe('email confirmation', () => {
  test('confirms a registered email when the session is already active', async ({
    page,
    supabase,
  }) => {
    // Simula el resultado del callback: el cliente de Supabase ya tiene sesión
    // con email confirmado gracias al hash de la URL.
    supabase.state.users.push(ORGANIZER)
    supabase.state.signUpCreatesSession = true
    await supabase.signInAs(ORGANIZER)

    // Con sesión activa y email confirmado, /auth/confirm muestra el éxito.
    await page.goto('/auth/confirm')

    await expect(page.getByRole('heading', { level: 1, name: '¡Email confirmado!' })).toBeVisible()
    await expect(
      page.getByText(
        'Tu dirección de correo se ha confirmado. Ya puedes iniciar sesión en BikeMates.',
      ),
    ).toBeVisible()
    await expect(page.getByRole('link', { name: 'Ir al inicio de sesión' })).toBeVisible()
  })

  test('reports a missing token when the confirmation cannot proceed', async ({ page }) => {
    // Sin sesión activa y sin token, la vista informa del fallo.
    await page.goto('/auth/confirm')

    await expect(
      page.getByRole('heading', { level: 1, name: 'No se ha podido verificar' }),
    ).toBeVisible()
    await expect(
      page.getByText('No se ha podido confirmar el email. Comprueba el enlace recibido.'),
    ).toBeVisible()
    await expect(page.getByRole('link', { name: 'Volver al inicio de sesión' })).toBeVisible()
  })

  test('offers a new recovery request after a failed link', async ({ page }) => {
    await page.goto('/auth/confirm?error_code=otp_expired')

    await expect(page.getByRole('link', { name: 'Solicitar nueva contraseña' })).toBeVisible()
  })

  test('shows the processing state briefly while verifying', async ({ page, supabase }) => {
    supabase.state.users.push(ORGANIZER)
    supabase.state.authDelayMs = 700

    await page.goto(`/auth/confirm?type=recovery&token_hash=lento`)

    await expect(page.getByRole('heading', { level: 1, name: 'Verificando enlace…' })).toBeVisible()
    await expect(page.getByText('Estamos comprobando la validez del enlace.')).toBeVisible()
  })
})
