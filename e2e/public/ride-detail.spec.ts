import { test, expect } from '../helpers/fixtures'
import { makeParticipant, makeRide, MEMBER, ORGANIZER } from '../helpers/seeds'

test.describe('ride detail', () => {
  test('shows the ride data for anonymous visitors', async ({ page, supabase }) => {
    supabase.state.rides = [makeRide({ id: 'ride-1' })]
    supabase.state.participants = [makeParticipant('ride-1', ORGANIZER)]

    await page.goto('/rides/ride-1')

    await expect(
      page.getByRole('heading', { level: 1, name: 'Vuelta por Collserola' }),
    ).toBeVisible()
    // Las migas terminan en el título real de la ruta (acortado con elipsis en CSS).
    await expect(page.getByRole('navigation', { name: 'Migas de pan' })).toContainText(
      'Vuelta por Collserola',
    )
    // El punto de encuentro aparece en la cabecera y en la sección de mapa.
    await expect(page.getByText('Plaça de l’Església, Barcelona').first()).toBeVisible()
    await expect(page.getByText('32', { exact: true }).first()).toBeVisible()
    await expect(page.getByText('+650', { exact: true }).first()).toBeVisible()
    await expect(page.locator('#description-title')).toBeVisible()
    await expect(page.locator('#meeting-point-title')).toBeVisible()

    // Sin sesión solo se ve el número: el listado de nombres es privado.
    await expect(page.locator('#participants-title')).toBeVisible()
    await expect(page.getByText('1 ciclista')).toBeVisible()
    await expect(page.getByText('Para participar en la ruta tienes que iniciar sesión.')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Iniciar sesión' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Regístrate' })).toBeVisible()
    await expect(page.locator('#main-content ul li')).toHaveCount(0)
  })

  test('shows the error state for an unknown ride', async ({ page }) => {
    // El servicio devuelve un error PGRST116 para un id inexistente.
    await page.goto('/rides/desconocida')

    await expect(
      page.getByRole('heading', { level: 1, name: 'No se ha podido cargar la ruta' }),
    ).toBeVisible()
    // Hay dos accesos: el de la barra superior y el del estado de error.
    await expect(page.getByRole('link', { name: 'Ver todas las rutas' }).first()).toBeVisible()
  })

  test('copies the ride link from the share menu', async ({ page, context, supabase }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    supabase.state.rides = [makeRide({ id: 'ride-1' })]

    await page.goto('/rides/ride-1')
    await page.getByRole('button', { name: 'Compartir ruta' }).click()
    await page.getByRole('menuitem', { name: 'Copiar enlace' }).click()

    await expect(page.getByRole('status')).toHaveText('Enlace copiado al portapapeles')
    expect(await page.evaluate(() => navigator.clipboard.readText())).toContain('/rides/ride-1')
  })

  test('offers the social networks and Gmail in the share menu', async ({ page, supabase }) => {
    supabase.state.rides = [makeRide({ id: 'ride-1' })]

    await page.goto('/rides/ride-1')
    await page.getByRole('button', { name: 'Compartir ruta' }).click()

    const menu = page.getByRole('menu', { name: 'Compartir ruta' })
    await expect(menu.getByRole('menuitem', { name: 'WhatsApp' })).toBeVisible()
    await expect(menu.getByRole('menuitem', { name: 'Gmail' })).toBeVisible()
    await expect(menu.getByRole('menuitem', { name: 'Correo electrónico' })).toBeVisible()

    const whatsappHref = await menu.getByRole('menuitem', { name: 'WhatsApp' }).getAttribute('href')
    expect(whatsappHref).toContain(encodeURIComponent('/rides/ride-1'))
  })

  test('downloads an ics calendar file for the ride', async ({ page, supabase }) => {
    supabase.state.rides = [makeRide({ id: 'ride-1' })]

    await page.goto('/rides/ride-1')

    const downloadPromise = page.waitForEvent('download')
    await page.getByRole('button', { name: 'Añadir al calendario' }).click()
    await page.getByRole('menuitem', { name: 'Descargar .ics' }).click()
    const download = await downloadPromise

    expect(download.suggestedFilename()).toBe('bikemates-ride-1.ics')
    await expect(page.getByRole('status')).toHaveText('Archivo de calendario descargado')
  })

  test('offers Google Calendar and Outlook in the calendar menu', async ({ page, supabase }) => {
    supabase.state.rides = [makeRide({ id: 'ride-1' })]

    await page.goto('/rides/ride-1')
    await page.getByRole('button', { name: 'Añadir al calendario' }).click()

    const menu = page.getByRole('menu', { name: 'Añadir al calendario' })
    await expect(menu.getByRole('menuitem', { name: 'Google Calendar' })).toBeVisible()
    await expect(menu.getByRole('menuitem', { name: 'Outlook' })).toBeVisible()

    const googleHref = await menu
      .getByRole('menuitem', { name: 'Google Calendar' })
      .getAttribute('href')
    expect(googleHref).toContain('calendar.google.com')
  })

  test('renders Open Graph metadata for social sharing', async ({ page, supabase }) => {
    supabase.state.rides = [makeRide({ id: 'ride-1' })]

    await page.goto('/rides/ride-1')

    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
      'content',
      'Vuelta por Collserola',
    )
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
      'content',
      /\/rides\/ride-1$/,
    )
    await expect(page.locator('meta[property="og:description"]')).toHaveAttribute('content', /.+/)
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', /summary/)
  })

  test('lets an authenticated non-participant join the ride', async ({ page, supabase }) => {
    supabase.state.rides = [makeRide({ id: 'ride-1', max_participants: 10 })]
    supabase.state.participants = [makeParticipant('ride-1', ORGANIZER)]
    supabase.state.users.push(MEMBER)
    await supabase.signInAs(MEMBER)

    await page.goto('/rides/ride-1')

    await expect(page.locator('#participants-title')).toBeVisible()

    // El CTA está deshabilitado hasta aceptar las normas de la comunidad.
    const joinButton = page.getByRole('button', { name: 'Participar en esta ruta' })
    await expect(joinButton).toBeVisible()
    await expect(joinButton).toBeDisabled()

    await page.getByRole('checkbox').check()
    await expect(joinButton).toBeEnabled()

    await joinButton.click()

    await expect(page.getByRole('button', { name: 'Dejar de participar' })).toBeVisible()
    await expect(page.getByText('2 ciclistas')).toBeVisible()
    expect(supabase.state.participants).toHaveLength(2)
  })

  test('shows ride comments and lets a signed-in user post one', async ({ page, supabase }) => {
    supabase.state.rides = [makeRide({ id: 'ride-1' })]
    supabase.state.users.push(MEMBER, ORGANIZER)
    supabase.state.profiles.push(
      {
        id: MEMBER.id,
        display_name: MEMBER.displayName,
        avatar_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: ORGANIZER.id,
        display_name: ORGANIZER.displayName,
        avatar_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    )
    supabase.state.messages = [
      {
        id: 'msg-1',
        ride_id: 'ride-1',
        author_id: ORGANIZER.id,
        content: 'Nos vemos en el punto de encuentro.',
        created_at: '2026-06-01T10:00:00.000Z',
      },
    ]
    await supabase.signInAs(MEMBER)

    await page.goto('/rides/ride-1')

    await expect(page.getByRole('heading', { name: 'Comentarios' })).toBeVisible()
    await expect(page.getByText('Nos vemos en el punto de encuentro.')).toBeVisible()

    await page.getByLabel('Escribe un comentario').fill('Llevo cámara antipinchazos.')
    await page.getByRole('button', { name: 'Comentar' }).click()

    await expect(page.getByText('Llevo cámara antipinchazos.')).toBeVisible()
    expect(supabase.state.messages).toHaveLength(2)
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

  test('shows no join CTA to the ride organizer', async ({ page, supabase }) => {
    supabase.state.rides = [makeRide({ id: 'ride-1', organizer_id: ORGANIZER.id })]
    supabase.state.participants = [makeParticipant('ride-1', ORGANIZER)]
    supabase.state.users.push(ORGANIZER)
    await supabase.signInAs(ORGANIZER)

    await page.goto('/rides/ride-1')

    // El organizador no ve CTA de inscripción ni el aviso previo.
    await expect(page.getByText('Eres el organizador')).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Participar en esta ruta' })).toHaveCount(0)
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
