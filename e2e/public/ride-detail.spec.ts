import { test, expect } from '../helpers/fixtures'
import { makeParticipant, makeRide, MEMBER, ORGANIZER } from '../helpers/seeds'

test.describe('ride detail', () => {
  test('shows the ride data for anonymous visitors', async ({ page, supabase }) => {
    supabase.state.rides = [makeRide({ id: 'ride-1' })]
    supabase.state.participants = [makeParticipant('ride-1', ORGANIZER)]

    await page.goto('/rides/ride-1')

    await expect(page.getByRole('heading', { level: 1, name: 'Vuelta por Collserola' })).toBeVisible()
    // El punto de encuentro aparece en la cabecera y en la sección de mapa.
    await expect(page.getByText('Plaça de l’Església, Barcelona').first()).toBeVisible()
    await expect(page.getByText('32', { exact: true }).first()).toBeVisible()
    await expect(page.getByText('+650', { exact: true }).first()).toBeVisible()
    await expect(page.getByRole('heading', { level: 2, name: 'Descripción' })).toBeVisible()
    await expect(page.getByRole('heading', { level: 2, name: 'Punto de encuentro' })).toBeVisible()

    // El visitante anónimo ve el contador y el aviso de iniciar sesión.
    await expect(page.getByText('1 inscrito')).toBeVisible()
    await expect(
      page.getByText('Inicia sesión para ver quién participa en esta ruta.'),
    ).toBeVisible()
    // El CTA de acceso es un enlace (Button con `to`).
    await expect(page.getByRole('link', { name: 'Iniciar sesión' })).toBeVisible()
  })

  test('shows the error state for an unknown ride', async ({ page }) => {
    // El servicio devuelve un error PGRST116 para un id inexistente.
    await page.goto('/rides/desconocida')

    await expect(
      page.getByRole('heading', { level: 1, name: 'No se ha podido cargar la ruta' }),
    ).toBeVisible()
    await expect(page.getByRole('link', { name: 'Ver todas las rutas' })).toBeVisible()
  })

  test('lets an authenticated non-participant join the ride', async ({ page, supabase }) => {
    supabase.state.rides = [makeRide({ id: 'ride-1', max_participants: 10 })]
    supabase.state.participants = [makeParticipant('ride-1', ORGANIZER)]
    supabase.state.users.push(MEMBER)
    await supabase.signInAs(MEMBER)

    await page.goto('/rides/ride-1')

    await expect(page.getByRole('heading', { level: 2, name: 'Participantes' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Participar en esta ruta' })).toBeVisible()

    await page.getByRole('button', { name: 'Participar en esta ruta' }).click()

    await expect(page.getByRole('button', { name: 'Dejar de participar' })).toBeVisible()
    await expect(page.getByText('2 ciclistas')).toBeVisible()
    expect(supabase.state.participants).toHaveLength(2)
  })

  test('lets a participant leave through the confirmation dialog', async ({ page, supabase }) => {
    supabase.state.rides = [makeRide({ id: 'ride-1' })]
    supabase.state.participants = [
      makeParticipant('ride-1', ORGANIZER),
      makeParticipant('ride-1', MEMBER),
    ]
    supabase.state.users.push(MEMBER)
    await supabase.signInAs(MEMBER)

    await page.goto('/rides/ride-1')

    await page.getByRole('button', { name: 'Dejar de participar' }).click()

    // Hay dos diálogos en la página: el de cookies y el de confirmación.
    const dialog = page.getByRole('dialog', { name: '¿Dejar de participar?' })
    await expect(dialog).toContainText('Puedes inscribirte de nuevo si quedan plazas libres.')

    await dialog.locator('[data-dialog-confirm]').click()

    await expect(page.getByRole('button', { name: 'Participar en esta ruta' })).toBeVisible()
    await expect(page.getByText('1 ciclista')).toBeVisible()
    expect(supabase.state.participants).toHaveLength(1)
  })

  test('cancels the leave action when the dialog is dismissed', async ({ page, supabase }) => {
    supabase.state.rides = [makeRide({ id: 'ride-1' })]
    supabase.state.participants = [makeParticipant('ride-1', MEMBER)]
    supabase.state.users.push(MEMBER)
    await supabase.signInAs(MEMBER)

    await page.goto('/rides/ride-1')

    const dialog = page.getByRole('dialog', { name: '¿Dejar de participar?' })

    await page.getByRole('button', { name: 'Dejar de participar' }).click()
    await expect(dialog).toBeVisible()

    await dialog.locator('[data-dialog-cancel]').click()
    await expect(dialog).toBeHidden()

    // Tras cancelar, el botón de la fila sigue presente y no se ha dado de baja.
    await expect(page.getByLabel('Dejar de participar', { exact: true })).toBeVisible()
    expect(supabase.state.participants).toHaveLength(1)
  })

  test('shows the organizer notice to the ride owner', async ({ page, supabase }) => {
    supabase.state.rides = [makeRide({ id: 'ride-1', organizer_id: ORGANIZER.id })]
    supabase.state.participants = [makeParticipant('ride-1', ORGANIZER)]
    supabase.state.users.push(ORGANIZER)
    await supabase.signInAs(ORGANIZER)

    await page.goto('/rides/ride-1')

    await expect(
      page.getByText(
        'Eres el organizador de esta ruta. Tu inscripción es automática y no puedes darte de baja.',
      ),
    ).toBeVisible()
    await expect(page.getByRole('link', { name: 'Editar ruta' })).toBeVisible()
  })

  test('shows the participant list to authenticated visitors', async ({ page, supabase }) => {
    supabase.state.rides = [makeRide({ id: 'ride-1' })]
    supabase.state.participants = [
      makeParticipant('ride-1', ORGANIZER),
      makeParticipant('ride-1', MEMBER),
    ]
    supabase.state.users.push(MEMBER)
    await supabase.signInAs(MEMBER)

    await page.goto('/rides/ride-1')

    await expect(page.getByText('Ana Pedal')).toBeVisible()
    await expect(page.getByText('Bruno Ruta')).toBeVisible()
    await expect(page.getByText('Organizador')).toBeVisible()
  })
})
