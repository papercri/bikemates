import { test, expect } from '../helpers/fixtures'
import { makePlace, ORGANIZER } from '../helpers/seeds'

test.describe('create ride', () => {
  test('requires authentication', async ({ page }) => {
    await page.goto('/rides/create')

    await expect(page).toHaveURL('/login?redirect=/rides/create')
  })

  test('shows the form with its editorial sections and defaults', async ({ page, supabase }) => {
    supabase.state.users.push(ORGANIZER)
    await supabase.signInAs(ORGANIZER)

    await page.goto('/rides/create')

    await expect(page.getByRole('heading', { level: 1, name: 'Publica una ruta' })).toBeVisible()
    await expect(page.getByText('Organiza tu próxima salida y encuentra ciclistas')).toBeVisible()

    await expect(page.getByRole('group', { name: 'Datos básicos' })).toBeVisible()
    await expect(page.getByRole('group', { name: 'Recorrido' })).toBeVisible()
    await expect(page.getByRole('group', { name: 'Detalles de la salida' })).toBeVisible()
    await expect(page.getByRole('group', { name: 'Imagen de portada' })).toBeVisible()

    // Valores por defecto del formulario.
    await expect(page.locator('#bikeType')).toHaveValue('gravel')
    await expect(page.locator('#level')).toHaveValue('Intermedio')
    await expect(page.locator('#distanceKm')).toHaveValue('')
    await expect(page.locator('#elevationM')).toHaveValue('')
    await expect(page.locator('#durationMinutes')).toHaveValue('')

    await expect(page.getByRole('button', { name: 'Publicar ruta' })).toBeVisible()
  })

  test('blocks submission until every required field is valid', async ({ page, supabase }) => {
    supabase.state.users.push(ORGANIZER)
    await supabase.signInAs(ORGANIZER)

    await page.goto('/rides/create')
    await page.getByRole('checkbox').check()
    await page.getByRole('button', { name: 'Publicar ruta' }).click()

    await expect(page.getByRole('alert')).toHaveText(
      'El título debe tener entre 5 y 100 caracteres.',
    )
  })

  test('validates the description length', async ({ page, supabase }) => {
    supabase.state.users.push(ORGANIZER)
    await supabase.signInAs(ORGANIZER)

    await page.goto('/rides/create')
    await page.getByLabel('Nombre de la ruta').fill('Ruta de prueba')
    await page.getByRole('checkbox').check()
    await page.getByRole('button', { name: 'Publicar ruta' }).click()

    await expect(page.getByRole('alert')).toHaveText(
      'La descripción debe tener entre 10 y 8000 caracteres.',
    )
  })

  test('searches and selects a meeting point', async ({ page, supabase }) => {
    supabase.state.users.push(ORGANIZER)
    supabase.state.places = [makePlace()]
    await supabase.signInAs(ORGANIZER)

    await page.goto('/rides/create')

    await page.getByLabel('Punto de encuentro').fill('Monistrol')
    await page.getByRole('button', { name: 'Buscar' }).click()

    await expect(page.getByRole('button', { name: /Monistrol de Montserrat/ })).toBeVisible()
    await page.getByRole('button', { name: /Monistrol de Montserrat/ }).click()

    await expect(page.getByText('Lugar seleccionado')).toBeVisible()
    await expect(page.getByText('Punto seleccionado: Monistrol de Montserrat')).toBeVisible()
  })

  test('reports when no places match the search', async ({ page, supabase }) => {
    supabase.state.users.push(ORGANIZER)
    supabase.state.places = []
    await supabase.signInAs(ORGANIZER)

    await page.goto('/rides/create')

    await page.getByLabel('Punto de encuentro').fill('zzzzzzzz')
    await page.getByRole('button', { name: 'Buscar' }).click()

    await expect(page.getByRole('alert')).toHaveText('No se han encontrado lugares.')
  })

  test('publishes a valid ride and navigates to its detail page', async ({ page, supabase }) => {
    supabase.state.users.push(ORGANIZER)
    supabase.state.places = [makePlace()]
    await supabase.signInAs(ORGANIZER)

    await page.goto('/rides/create')

    await page.getByLabel('Nombre de la ruta').fill('Ruta de prueba E2E')
    await page
      .getByLabel('Descripción')
      .fill('Recorrido de prueba por el Montseny con parada de café al final.')
    await page.getByLabel('Punto de encuentro').fill('Monistrol')
    await page.getByRole('button', { name: 'Buscar' }).click()
    await page.getByRole('button', { name: /Monistrol de Montserrat/ }).click()

    await page.locator('#distanceKm').fill('45')
    await page.locator('#elevationM').fill('700')
    await page.locator('#durationMinutes').fill('180')

    // Fecha futura en formato datetime-local.
    const future = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    const local = new Date(future.getTime() - future.getTimezoneOffset() * 60_000)
    await page.locator('#startsAt').fill(local.toISOString().slice(0, 16))

    await page.getByRole('checkbox').check()
    await page.getByRole('button', { name: 'Publicar ruta' }).click()

    // Redirige al detalle de la ruta recién creada.
    await expect(page).toHaveURL(/\/rides\/ride-\d+/)
    await expect(page.getByRole('heading', { level: 1, name: 'Ruta de prueba E2E' })).toBeVisible()

    // La petición de inserción llegó al mock con los datos del formulario.
    expect(supabase.state.lastInsertedRide).toMatchObject({
      title: 'Ruta de prueba E2E',
      meeting_point: 'Monistrol de Montserrat, Cataluña, España',
      latitude: 41.7633,
      longitude: 1.8428,
    })
  })

  test('shows the busy label while publishing', async ({ page, supabase }) => {
    supabase.state.users.push(ORGANIZER)
    supabase.state.places = [makePlace()]
    await supabase.signInAs(ORGANIZER)

    await page.route('**/rest/v1/rides', async (route) => {
      if (route.request().method() === 'POST') {
        await new Promise((resolve) => setTimeout(resolve, 400))
      }
      await route.continue()
    })

    await page.goto('/rides/create')

    await page.getByLabel('Nombre de la ruta').fill('Ruta lenta')
    await page
      .getByLabel('Descripción')
      .fill('Recorrido que tarda en guardarse para poder observar el estado de carga.')
    await page.getByLabel('Punto de encuentro').fill('Monistrol')
    await page.getByRole('button', { name: 'Buscar' }).click()
    await page.getByRole('button', { name: /Monistrol de Montserrat/ }).click()

    await page.locator('#distanceKm').fill('45')
    await page.locator('#elevationM').fill('700')
    await page.locator('#durationMinutes').fill('180')

    const future = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    const local = new Date(future.getTime() - future.getTimezoneOffset() * 60_000)
    await page.locator('#startsAt').fill(local.toISOString().slice(0, 16))

    await page.getByRole('checkbox').check()
    await page.getByRole('button', { name: 'Publicar ruta' }).click()

    await expect(page.getByRole('button', { name: 'Publicando…' })).toBeDisabled()
  })

  test('validates a wikiloc URL when provided', async ({ page, supabase }) => {
    supabase.state.users.push(ORGANIZER)
    supabase.state.places = [makePlace()]
    await supabase.signInAs(ORGANIZER)

    await page.goto('/rides/create')

    await page.getByLabel('Nombre de la ruta').fill('Ruta con wikiloc')
    await page
      .getByLabel('Descripción')
      .fill('Recorrido con enlace a Wikiloc para seguir la traza del trayecto.')
    await page.getByLabel('Punto de encuentro').fill('Monistrol')
    await page.getByRole('button', { name: 'Buscar' }).click()
    await page.getByRole('button', { name: /Monistrol de Montserrat/ }).click()

    await page.locator('#distanceKm').fill('45')
    await page.locator('#elevationM').fill('700')
    await page.locator('#durationMinutes').fill('180')

    const future = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    const local = new Date(future.getTime() - future.getTimezoneOffset() * 60_000)
    await page.locator('#startsAt').fill(local.toISOString().slice(0, 16))

    await page.getByLabel('Enlace del recorrido (opcional)').fill('no-es-una-url')
    await page.getByRole('checkbox').check()
    await page.getByRole('button', { name: 'Publicar ruta' }).click()

    await expect(page.getByRole('alert')).toHaveText(
      'Introduce una URL HTTPS válida (Wikiloc, Strava, Meetup…).',
    )
  })

  test('counts the description characters', async ({ page, supabase }) => {
    supabase.state.users.push(ORGANIZER)
    await supabase.signInAs(ORGANIZER)

    await page.goto('/rides/create')

    await page.getByLabel('Descripción').fill('Recorrido corto.')

    await expect(page.getByText('16/8000')).toBeVisible()
  })
})
