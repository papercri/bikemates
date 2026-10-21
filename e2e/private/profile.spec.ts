import { test, expect } from '../helpers/fixtures'
import { makeRide, ORGANIZER } from '../helpers/seeds'

test.describe('profile', () => {
  test('requires authentication and shows the profile tabs', async ({ page, supabase }) => {
    supabase.state.users.push(ORGANIZER)
    await supabase.signInAs(ORGANIZER)

    await page.goto('/profile')

    await expect(page.getByRole('heading', { level: 1, name: 'Mi perfil' })).toBeVisible()
    await expect(page.getByRole('tab', { name: 'Mis datos' })).toBeVisible()
    await expect(page.getByRole('tab', { name: 'Mis rutas' })).toBeVisible()
    await expect(page.getByRole('tab', { name: 'Rutas guardadas' })).toBeVisible()
  })

  test('shows the account data sections on the details tab', async ({ page, supabase }) => {
    supabase.state.users.push(ORGANIZER)
    await supabase.signInAs(ORGANIZER)

    await page.goto('/profile')

    const panel = page.getByRole('tabpanel', { name: 'Mis datos' })

    await expect(panel.getByRole('heading', { name: 'Foto de perfil' })).toBeVisible()
    await expect(panel.getByRole('heading', { name: 'Nombre' })).toBeVisible()
    await expect(panel.getByRole('heading', { name: 'Correo electrónico' })).toBeVisible()
    await expect(panel.getByRole('heading', { name: 'Contraseña' })).toBeVisible()

    await expect(panel.getByRole('textbox', { name: 'Nombre' })).toHaveValue('Ana Pedal')
    await expect(panel.getByText('ana@example.com')).toBeVisible()

    await expect(
      panel.getByText(
        'Eliminar tu cuenta borra de forma permanente tu perfil y tus datos asociados. Esta acción es irreversible.',
      ),
    ).toBeVisible()
    await expect(panel.getByRole('button', { name: 'Eliminar mi cuenta' })).toBeVisible()
  })

  test('switches between the details and my rides tabs', async ({ page, supabase }) => {
    supabase.state.users.push(ORGANIZER)
    await supabase.signInAs(ORGANIZER)

    await page.goto('/profile')

    await page.getByRole('tab', { name: 'Mis rutas' }).click()
    await expect(page.locator('#panel-my-rides')).toBeVisible()
    await expect(page.getByText('Todavía no has publicado ninguna ruta.')).toBeVisible()
    await expect(page.locator('#panel-details')).toBeHidden()
    // La pestaña activa queda registrada en la URL para poder volver a ella.
    await expect(page).toHaveURL(/tab=my-rides/)

    await page.getByRole('tab', { name: 'Mis datos' }).click()
    await expect(page.locator('#panel-details')).toBeVisible()
    await expect(page.locator('#panel-my-rides')).toBeHidden()
    await expect(page).toHaveURL(/\/profile$/)
  })

  test('shows saved rides in the saved tab', async ({ page, supabase }) => {
    supabase.state.users.push(ORGANIZER)
    supabase.state.rides = [makeRide({ id: 'ride-1', title: 'Favorita de Ana' })]
    supabase.state.savedRides = [
      { ride_id: 'ride-1', user_id: ORGANIZER.id, created_at: '2026-06-01T10:00:00.000Z' },
    ]
    await supabase.signInAs(ORGANIZER)

    await page.goto('/profile?tab=saved-rides')

    const panel = page.getByRole('tabpanel', { name: 'Rutas guardadas' })
    await expect(panel).toBeVisible()
    await expect(panel.getByRole('link', { name: /Favorita de Ana/ })).toBeVisible()

    await page.getByRole('tab', { name: 'Mis datos' }).click()
    await expect(page.locator('#panel-saved-rides')).toBeHidden()
  })

  test('supports arrow-key navigation between tabs', async ({ page, supabase }) => {
    supabase.state.users.push(ORGANIZER)
    await supabase.signInAs(ORGANIZER)

    await page.goto('/profile')

    const detailsTab = page.getByRole('tab', { name: 'Mis datos' })
    await detailsTab.focus()
    await page.keyboard.press('ArrowRight')

    await expect(page.getByRole('tab', { name: 'Mis rutas' })).toHaveAttribute(
      'aria-selected',
      'true',
    )

    // Con dos pestañas, ArrowRight en la última vuelve a la primera.
    await page.keyboard.press('ArrowRight')

    await expect(detailsTab).toHaveAttribute('aria-selected', 'true')
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
    // Tras volver al inicio, el usuario ya no tiene sesión activa.
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Encuentra tu grupeta.')
  })

  test('cancels the account deletion', async ({ page, supabase }) => {
    supabase.state.users.push(ORGANIZER)
    await supabase.signInAs(ORGANIZER)

    await page.goto('/profile')

    const dialog = page.getByRole('dialog', { name: '¿Eliminar tu cuenta?' })
    const deleteButton = page.getByRole('tabpanel', { name: 'Mis datos' }).getByRole('button', {
      name: 'Eliminar mi cuenta',
    })

    await deleteButton.click()
    await expect(dialog).toBeVisible()

    await dialog.locator('[data-dialog-cancel]').click()
    await expect(dialog).toBeHidden()

    await expect(page).toHaveURL('/profile')
    await expect(deleteButton).toBeVisible()
  })

  test('surfaces an account deletion error', async ({ page, supabase }) => {
    supabase.state.users.push(ORGANIZER)
    supabase.state.deleteAccountError = 'permiso denegado'
    await supabase.signInAs(ORGANIZER)

    await page.goto('/profile')

    await page
      .getByRole('tabpanel', { name: 'Mis datos' })
      .getByRole('button', { name: 'Eliminar mi cuenta' })
      .click()
    await page
      .getByRole('dialog', { name: '¿Eliminar tu cuenta?' })
      .locator('[data-dialog-confirm]')
      .click()

    await expect(page.getByRole('alert')).toContainText(
      'No se ha podido eliminar la cuenta. Inténtalo de nuevo más tarde.',
    )
    await expect(page).toHaveURL('/profile')
  })

  test('links from the my rides empty state to the create form', async ({ page, supabase }) => {
    supabase.state.users.push(ORGANIZER)
    await supabase.signInAs(ORGANIZER)

    await page.goto('/profile')

    const myRidesPanel = page.getByRole('tabpanel', { name: 'Mis rutas' })
    await page.getByRole('tab', { name: 'Mis rutas' }).click()
    await expect(myRidesPanel.getByRole('link', { name: 'Publicar ruta' })).toHaveAttribute(
      'href',
      '/rides/create',
    )
  })

  test('lists my published rides and deletes one with confirmation', async ({ page, supabase }) => {
    supabase.state.users.push(ORGANIZER)
    supabase.state.rides.push(makeRide(), makeRide({ id: 'ride-2', title: 'Subida al turó' }))
    await supabase.signInAs(ORGANIZER)

    await page.goto('/profile')
    await page.getByRole('tab', { name: 'Mis rutas' }).click()

    const panel = page.getByRole('tabpanel', { name: 'Mis rutas' })
    await expect(panel.getByRole('article')).toHaveCount(2)
    await expect(panel.getByText('2 rutas publicadas')).toBeVisible()

    await panel.getByRole('button', { name: 'Eliminar' }).first().click()

    const dialog = page.getByRole('dialog', { name: '¿Eliminar «Vuelta por Collserola»?' })
    await dialog.locator('[data-dialog-confirm]').click()

    await expect(panel.getByRole('article')).toHaveCount(1)
    await expect(panel.getByText('Subida al turó')).toBeVisible()
    await expect(panel.getByText('1 ruta publicada')).toBeVisible()
  })
})
