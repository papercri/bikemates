import { test, expect } from '../helpers/fixtures'
import { makeRide } from '../helpers/seeds'

test.describe('rides list', () => {
  test('shows the heading and empty state when there are no rides', async ({ page }) => {
    await page.goto('/rides')

    await expect(page.getByRole('heading', { level: 1, name: 'Explorar rutas' })).toBeVisible()
    await expect(
      page.getByRole('heading', { name: 'Sin próximas rutas con estos filtros' }),
    ).toBeVisible()
  })

  test('lists published rides with their key data', async ({ page, supabase }) => {
    supabase.state.rides = [
      makeRide({ id: 'ride-1', title: 'Vuelta por Collserola', distance_km: 32, elevation_m: 650 }),
      makeRide({
        id: 'ride-2',
        title: 'Ruta al Montseny',
        distance_km: 48,
        elevation_m: 900,
        level: 'Avanzado',
        bike_type: 'mtb',
      }),
    ]

    await page.goto('/rides')

    const collserola = page.getByRole('link', { name: /Vuelta por Collserola/ })
    const montseny = page.getByRole('link', { name: /Ruta al Montseny/ })

    await expect(collserola).toBeVisible()
    await expect(montseny).toBeVisible()

    // La distancia y el desnivel van en spans separados dentro de la tarjeta.
    await expect(collserola).toContainText('32')
    await expect(collserola).toContainText('+650')
    await expect(collserola).toContainText('Intermedio')
    await expect(montseny).toContainText('48')
    await expect(montseny).toContainText('Avanzado')
  })

  test('counts the results', async ({ page, supabase }) => {
    supabase.state.rides = [makeRide({ id: 'ride-1' }), makeRide({ id: 'ride-2' })]

    await page.goto('/rides')

    await expect(page.getByText('2 rutas encontradas')).toBeVisible()
  })

  test('filters by level and shows only matching rides', async ({ page, supabase }) => {
    supabase.state.rides = [
      makeRide({ id: 'ride-1', title: 'Ruta fácil', level: 'Iniciación' }),
      makeRide({ id: 'ride-2', title: 'Ruta dura', level: 'Avanzado' }),
    ]

    await page.goto('/rides')
    await page.selectOption('#ride-level-filter', 'Avanzado')

    await expect(page.getByRole('link', { name: /Ruta dura/ })).toBeVisible()
    await expect(page.getByRole('link', { name: /Ruta fácil/ })).toHaveCount(0)
    await expect(page.getByText('1 ruta encontrada')).toBeVisible()
  })

  test('filters by bike type', async ({ page, supabase }) => {
    supabase.state.rides = [
      makeRide({ id: 'ride-1', title: 'Ruta gravel', bike_type: 'gravel' }),
      makeRide({ id: 'ride-2', title: 'Ruta mtb', bike_type: 'mtb' }),
    ]

    await page.goto('/rides')
    await page.selectOption('#ride-audience-filter', 'women')

    // El filtro por público no afecta a estas rutas (ambas son "everyone").
    await expect(page.getByRole('link', { name: /Ruta gravel/ })).toHaveCount(0)
    await expect(page.getByRole('link', { name: /Ruta mtb/ })).toHaveCount(0)
  })

  test('shows the past tab with its own empty state', async ({ page, supabase }) => {
    supabase.state.rides = [makeRide({ id: 'ride-1' })]

    await page.goto('/rides')
    await page.getByRole('button', { name: /Pasadas/ }).click()

    await expect(page.getByRole('heading', { name: 'Sin salidas pasadas con estos filtros' })).toBeVisible()
    await expect(page.getByText('Todavía no hay salidas celebradas')).toBeVisible()
  })

  test('sorts by distance when requested', async ({ page, supabase }) => {
    supabase.state.rides = [
      makeRide({ id: 'ride-1', title: 'Larga', distance_km: 80 }),
      makeRide({ id: 'ride-2', title: 'Corta', distance_km: 15 }),
    ]

    await page.goto('/rides')
    await page.selectOption('#ride-sort-filter', 'distance')

    // El orden no por fecha se aplica de forma descendente en la ventana activa.
    const titles = await page.locator('article h2').allTextContents()
    expect(titles[0]).toContain('Larga')
    expect(titles[1]).toContain('Corta')
  })

  test('shows the error state and can retry', async ({ page, supabase }) => {
    supabase.state.ridesError = 'fallo de red'

    await page.goto('/rides')

    await expect(
      page.getByRole('heading', { name: 'No se han podido cargar las rutas' }),
    ).toBeVisible()

    supabase.state.ridesError = null
    supabase.state.rides = [makeRide({ id: 'ride-1' })]

    await page.getByRole('button', { name: 'Reintentar' }).click()

    await expect(page.getByRole('link', { name: /Vuelta por Collserola/ })).toBeVisible()
  })
})
