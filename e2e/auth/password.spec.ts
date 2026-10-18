import { test, expect } from '../helpers/fixtures'
import { ORGANIZER } from '../helpers/seeds'

test.describe('password recovery', () => {
  test('requests a reset link and shows the neutral confirmation', async ({ page }) => {
    await page.goto('/forgot-password')

    await expect(page.getByRole('heading', { level: 1, name: 'Recuperar contraseña' })).toBeVisible()
    await expect(page.getByLabel('Correo electrónico')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Enviar instrucciones' })).toBeVisible()

    await page.getByLabel('Correo electrónico').fill('ana@example.com')
    await page.getByRole('button', { name: 'Enviar instrucciones' }).click()

    // El mensaje es deliberadamente neutro por seguridad.
    await expect(page.getByRole('status')).toHaveText(
      'Si la dirección está registrada, recibirás un correo con las instrucciones para recuperar tu contraseña.',
    )
  })

  test('requires the email before submitting', async ({ page }) => {
    await page.goto('/forgot-password')
    await page.getByRole('button', { name: 'Enviar instrucciones' }).click()

    await expect(page.getByRole('alert')).toHaveText('Introduce tu correo electrónico.')
  })

  test('links back to the login page', async ({ page }) => {
    await page.goto('/forgot-password')

    await page.getByRole('link', { name: 'Volver al inicio de sesión' }).click()

    await expect(page).toHaveURL('/login')
  })

  test('blocks the reset form without a recovery session', async ({ page }) => {
    await page.goto('/reset-password')

    await expect(page.getByRole('heading', { level: 1, name: 'Nueva contraseña' })).toBeVisible()

    // El guard vive en el envío, no en el estado del botón.
    await page.getByLabel('Nueva contraseña', { exact: true }).fill('nuevapassword1')
    await page.getByLabel('Confirmar nueva contraseña').fill('nuevapassword1')
    await page.getByRole('button', { name: 'Guardar nueva contraseña' }).click()

    await expect(page.getByRole('alert')).toHaveText(
      'Debes acceder desde un enlace válido de recuperación enviado por email.',
    )
    await expect(page).toHaveURL('/reset-password')
  })

  test('updates the password after a valid recovery link', async ({ page, supabase }) => {
    supabase.state.users.push(ORGANIZER)

    // El enlace de recuperación llega a /auth/confirm con type=recovery.
    // verifyOtp devuelve una sesión y la vista marca el estado de recuperación.
    await page.goto(`/auth/confirm?type=recovery&token_hash=e2e-token`)

    // Tras verificar, se redirige al formulario de nueva contraseña.
    await expect(page).toHaveURL('/reset-password')
    await expect(page.getByRole('button', { name: 'Guardar nueva contraseña' })).toBeEnabled()

    await page.getByLabel('Nueva contraseña', { exact: true }).fill('nuevapassword1')
    await page.getByLabel('Confirmar nueva contraseña').fill('nuevapassword1')
    await page.getByRole('button', { name: 'Guardar nueva contraseña' }).click()

    await expect(page.getByRole('status')).toHaveText('Contraseña actualizada correctamente.')
    await expect(page).toHaveURL('/login')
  })

  test('rejects mismatched new passwords', async ({ page, supabase }) => {
    supabase.state.users.push(ORGANIZER)

    await page.goto(`/auth/confirm?type=recovery&token_hash=e2e-token`)
    await expect(page).toHaveURL('/reset-password')

    await page.getByLabel('Nueva contraseña', { exact: true }).fill('nuevapassword1')
    await page.getByLabel('Confirmar nueva contraseña').fill('otracosa123')
    await page.getByRole('button', { name: 'Guardar nueva contraseña' }).click()

    await expect(page.getByRole('alert')).toHaveText('Las contraseñas no coinciden.')
  })

  test('rejects a short new password', async ({ page, supabase }) => {
    supabase.state.users.push(ORGANIZER)

    await page.goto(`/auth/confirm?type=recovery&token_hash=e2e-token`)
    await expect(page).toHaveURL('/reset-password')

    await page.getByLabel('Nueva contraseña', { exact: true }).fill('corta')
    await page.getByLabel('Confirmar nueva contraseña').fill('corta')
    await page.getByRole('button', { name: 'Guardar nueva contraseña' }).click()

    await expect(page.getByRole('alert')).toHaveText(
      'La contraseña debe tener al menos 8 caracteres.',
    )
  })

  test('reports an expired recovery link', async ({ page }) => {
    await page.goto(`/auth/confirm?error_code=otp_expired`)

    await expect(page.getByRole('heading', { level: 1, name: 'No se ha podido verificar' })).toBeVisible()
    await expect(
      page.getByText('El enlace ha caducado o ya no es válido. Solicita uno nuevo.'),
    ).toBeVisible()
  })
})
