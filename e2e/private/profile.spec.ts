import { test, expect } from '../helpers/fixtures'
import { ORGANIZER } from '../helpers/seeds'

test.describe('profile', () => {
  test('requires authentication and shows the profile tabs', async ({ page, supabase }) => {
    supabase.state.users.push(ORGANIZER)
    await supabase.signInAs(ORGANIZER)

    await page.goto('/profile')

    await expect(page.getByRole('heading', { level: 1, name: 'Mi perfil' })).toBeVisible()
    await expect(page.getByRole('tab', { name: 'Mis datos' })).toBeVisible()
    await expect(page.getByRole('tab', { name: 'Rutas guardadas' })).toBeVisible()
    await expect(page.getByRole('tab', { name: 'Rutas publicadas' })).toBeVisible()
  })

  test('shows the account deletion warning on the details tab', async ({ page, supabase }) => {
    supabase.state.users.push(ORGANIZER)
    await supabase.signInAs(ORGANIZER)

    await page.goto('/profile')

    await expect(
      page.getByText('La edición de tus datos personales estará disponible en una próxima versión.'),
    ).toBeVisible()
    await expect(
      page.getByText(
        'Eliminar tu cuenta borra de forma permanente tu perfil y tus datos asociados. Esta acción es irreversible.',
      ),
    ).toBeVisible()
    await expect(page.getByRole('button', { name: 'Eliminar mi cuenta' })).toBeVisible()
  })

  test('switches between the saved and published rides tabs', async ({ page, supabase }) => {
    supabase.state.users.push(ORGANIZER)
    await supabase.signInAs(ORGANIZER)

    await page.goto('/profile')

    await page.getByRole('tab', { name: 'Rutas guardadas' }).click()
    await expect(page.locator('#panel-saved-rides')).toBeVisible()
    await expect(page.getByText('Todavía no has guardado ninguna ruta.')).toBeVisible()
    await expect(page.locator('#panel-details')).toBeHidden()

    await page.getByRole('tab', { name: 'Rutas publicadas' }).click()
    await expect(page.locator('#panel-published-rides')).toBeVisible()
    await expect(page.getByText('Todavía no has publicado ninguna ruta.')).toBeVisible()
  })

  test('supports arrow-key navigation between tabs', async ({ page, supabase }) => {
    supabase.state.users.push(ORGANIZER)
    await supabase.signInAs(ORGANIZER)

    await page.goto('/profile')

    const detailsTab = page.getByRole('tab', { name: 'Mis datos' })
    await detailsTab.focus()
    await page.keyboard.press('ArrowRight')

    await expect(page.getByRole('tab', { name: 'Rutas guardadas' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
  })

  test('deletes the account and returns home', async ({ page, supabase }) => {
    supabase.state.users.push(ORGANIZER)
    await supabase.signInAs(ORGANIZER)

    await page.goto('/profile')

    await page.getByRole('button', { name: 'Eliminar mi cuenta' }).click()

    // Hay dos diálogos: el de cookies y el de confirmación.
    const dialog = page.getByRole('dialog', { name: '¿Eliminar tu cuenta?' })
    await expect(dialog).toContainText('Esta acción es irreversible.')

    await dialog.locator('[data-dialog-confirm]').click()

    await expect(page).toHaveURL('/')
    await expect(
      page.getByRole('navigation', { name: 'Navegación principal' }).first(),
    ).toContainText('Explorar rutas')
  })

  test('cancels the account deletion', async ({ page, supabase }) => {
    supabase.state.users.push(ORGANIZER)
    await supabase.signInAs(ORGANIZER)

    await page.goto('/profile')

    await page.getByRole('button', { name: 'Eliminar mi cuenta' }).click()
    await page
      .getByRole('dialog', { name: '¿Eliminar tu cuenta?' })
      .locator('[data-dialog-cancel]')
      .click()

    await expect(page).toHaveURL('/profile')
    await expect(page.getByRole('button', { name: 'Eliminar mi cuenta' })).toBeVisible()
  })

  test('surfaces an account deletion error', async ({ page, supabase }) => {
    supabase.state.users.push(ORGANIZER)
    supabase.state.deleteAccountError = 'permiso denegado'
    await supabase.signInAs(ORGANIZER)

    await page.goto('/profile')

    await page.getByRole('button', { name: 'Eliminar mi cuenta' }).click()
    await page
      .getByRole('dialog', { name: '¿Eliminar tu cuenta?' })
      .locator('[data-dialog-confirm]')
      .click()

    await expect(page.getByRole('alert')).toContainText(
      'No se ha podido eliminar la cuenta. Inténtalo de nuevo más tarde.',
    )
    await expect(page).toHaveURL('/profile')
  })

  test('links from the empty states to the public rides and the create form', async ({
    page,
    supabase,
  }) => {
    supabase.state.users.push(ORGANIZER)
    await supabase.signInAs(ORGANIZER)

    await page.goto('/profile')

    await page.getByRole('tab', { name: 'Rutas guardadas' }).click()
    await expect(page.getByRole('link', { name: 'Explorar rutas' })).toHaveAttribute('href', '/rides')

    await page.getByRole('tab', { name: 'Rutas publicadas' }).click()
    await expect(page.getByRole('link', { name: 'Publicar ruta' })).toHaveAttribute(
      'href',
      '/rides/create',
    )
  })
})
