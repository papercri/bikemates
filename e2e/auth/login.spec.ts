import { test, expect } from '../helpers/fixtures'

test.describe('login', () => {
  test('shows the form with its labels and helpers', async ({ page }) => {
    await page.goto('/login')

    await expect(page.getByRole('heading', { level: 1, name: 'Inicia sesión' })).toBeVisible()
    await expect(page.getByLabel('Correo electrónico')).toBeVisible()
    await expect(page.getByLabel('Contraseña', { exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Iniciar sesión' })).toBeVisible()
    await expect(page.getByRole('link', { name: '¿La has olvidado?' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Regístrate' })).toBeVisible()
  })

  test('requires both fields before submitting', async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('button', { name: 'Iniciar sesión' }).click()

    await expect(page.getByRole('alert')).toHaveText('Introduce tu email y contraseña.')
  })

  test('shows an error for wrong credentials', async ({ page, supabase }) => {
    supabase.state.users.push({
      id: 'user-1',
      email: 'ana@example.com',
      displayName: 'Ana Pedal',
      password: 'pedaleando123',
    })

    await page.goto('/login')
    await page.getByLabel('Correo electrónico').fill('ana@example.com')
    await page.getByLabel('Contraseña', { exact: true }).fill('malapassword')
    await page.getByRole('button', { name: 'Iniciar sesión' }).click()

    await expect(page.getByRole('alert')).toContainText(
      'No se ha podido iniciar sesión. Comprueba tus datos y que hayas confirmado tu email.',
    )
  })

  test('signs in and redirects to the rides list', async ({ page, supabase }) => {
    supabase.state.users.push({
      id: 'user-1',
      email: 'ana@example.com',
      displayName: 'Ana Pedal',
      password: 'pedaleando123',
    })

    await page.goto('/login')
    await page.getByLabel('Correo electrónico').fill('ana@example.com')
    await page.getByLabel('Contraseña', { exact: true }).fill('pedaleando123')
    await page.getByRole('button', { name: 'Iniciar sesión' }).click()

    await expect(page).toHaveURL('/rides')
    // "Mi perfil" vive en el bloque de sesión, fuera del <nav>.
    await expect(page.getByRole('banner')).toContainText('Mi perfil')
  })

  test('shows the busy label while the request is running', async ({ page, supabase }) => {
    supabase.state.users.push({
      id: 'user-1',
      email: 'ana@example.com',
      displayName: 'Ana Pedal',
      password: 'pedaleando123',
    })
    supabase.state.authDelayMs = 600

    await page.goto('/login')
    await page.getByLabel('Correo electrónico').fill('ana@example.com')
    await page.getByLabel('Contraseña', { exact: true }).fill('pedaleando123')
    await page.getByRole('button', { name: 'Iniciar sesión' }).click()

    await expect(page.getByRole('button', { name: 'Iniciando sesión…' })).toBeDisabled()
  })

  test('links to the registration page', async ({ page }) => {
    await page.goto('/login')

    await page.getByRole('link', { name: 'Regístrate' }).click()

    await expect(page).toHaveURL('/register')
    await expect(page.getByRole('heading', { level: 1, name: 'Únete a BikeMates' })).toBeVisible()
  })
})
