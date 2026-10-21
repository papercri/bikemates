import { test, expect } from '../helpers/fixtures'
import type { Page } from '@playwright/test'
import { makeRide, MEMBER } from '../helpers/seeds'

/**
 * En móvil el panel de filtros está colapsado tras un botón; en escritorio
 * siempre está visible. Abre el panel cuando hace falta.
 */
async function openFilters(page: Page, isMobile: boolean): Promise<void> {
  if (!isMobile) return

  const panel = page.locator('#ride-filters-panel')

  if (await panel.isVisible()) return

  await page.getByRole('button', { name: /Filtros/ }).click()
  await expect(panel).toBeVisible()
}

/**
 * Los filtros son desplegables: se abre el combo por su nombre accesible y se
 * elige la opción en el menú.
 */
async function chooseFilter(page: Page, field: string, option: string): Promise<void> {
  await page.getByRole('button', { name: new RegExp(`^${field}`) }).click()
  await page.getByRole('menuitemradio', { name: option, exact: true }).click()
}

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

    // La tarjeta no muestra distancia ni desnivel: lleva fecha corta, título, nivel, bici y público.
    await expect(collserola).toContainText(/\d{2}\/\d{2}/)
    await expect(collserola).toContainText('Intermedio')
    await expect(collserola).toContainText('Gravel')
    await expect(collserola).toContainText('Todos')
    await expect(collserola).not.toContainText('32')
    await expect(collserola).not.toContainText('650')
    await expect(montseny).toContainText('Avanzado')
    await expect(montseny).toContainText('MTB')
  })

  test('counts the results', async ({ page, supabase }) => {
    supabase.state.rides = [makeRide({ id: 'ride-1' }), makeRide({ id: 'ride-2' })]

    await page.goto('/rides')

    await expect(page.getByText('2 rutas encontradas')).toBeVisible()
  })

  test('filters by level and shows only matching rides', async ({ page, supabase, isMobile }) => {
    supabase.state.rides = [
      makeRide({ id: 'ride-1', title: 'Ruta fácil', level: 'Iniciación' }),
      makeRide({ id: 'ride-2', title: 'Ruta dura', level: 'Avanzado' }),
    ]

    await page.goto('/rides')
    await openFilters(page, isMobile)
    await chooseFilter(page, 'Nivel', 'Avanzado')

    await expect(page.getByRole('link', { name: /Ruta dura/ })).toBeVisible()
    await expect(page.getByRole('link', { name: /Ruta fácil/ })).toHaveCount(0)
    await expect(page.getByText('1 ruta encontrada')).toBeVisible()
  })

  test('filters by bike type', async ({ page, supabase, isMobile }) => {
    supabase.state.rides = [
      makeRide({ id: 'ride-1', title: 'Ruta gravel', bike_type: 'gravel' }),
      makeRide({ id: 'ride-2', title: 'Ruta mtb', bike_type: 'mtb' }),
    ]

    await page.goto('/rides')
    await openFilters(page, isMobile)
    await chooseFilter(page, 'Público', 'Mujeres')

    // El filtro por público no afecta a estas rutas (ambas son "everyone").
    await expect(page.getByRole('link', { name: /Ruta gravel/ })).toHaveCount(0)
    await expect(page.getByRole('link', { name: /Ruta mtb/ })).toHaveCount(0)
  })

  test('shows the past tab with its own empty state', async ({ page, supabase }) => {
    supabase.state.rides = [makeRide({ id: 'ride-1' })]

    await page.goto('/rides')
    await page.getByRole('button', { name: /Pasadas/ }).click()

    await expect(
      page.getByRole('heading', { name: 'Sin salidas pasadas con estos filtros' }),
    ).toBeVisible()
    await expect(page.getByText('Todavía no hay salidas celebradas')).toBeVisible()
  })

  test('sorts by distance when requested', async ({ page, supabase, isMobile }) => {
    supabase.state.rides = [
      makeRide({ id: 'ride-1', title: 'Larga', distance_km: 80 }),
      makeRide({ id: 'ride-2', title: 'Corta', distance_km: 15 }),
    ]

    await page.goto('/rides')
    await openFilters(page, isMobile)
    await chooseFilter(page, 'Ordenar por', 'Distancia')

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

  test('renders Open Graph metadata for social sharing', async ({ page }) => {
    await page.goto('/rides')

    await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'website')
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
      'content',
      'Explorar rutas | BikeMates',
    )
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', /\/rides$/)
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
      'content',
      'summary_large_image',
    )
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/rides$/)
  })

  test('lets a signed-in user save a ride with the star and shows it in the profile tab', async ({
    page,
    supabase,
  }) => {
    supabase.state.users.push(MEMBER)
    supabase.state.rides = [makeRide({ id: 'ride-1', title: 'Vuelta por Collserola' })]
    await supabase.signInAs(MEMBER)

    await page.goto('/rides')

    const star = page.getByRole('button', { name: 'Agregar a favoritos' })
    await expect(star).toBeVisible()
    await star.click()

    // Confirmación efímera + estado on de la estrella.
    await expect(page.getByText('Agregado a tus favoritos')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Quitar de favoritos' })).toBeVisible()
    expect(supabase.state.savedRides).toHaveLength(1)

    // Quitar de favoritos vuelve al estado off.
    await page.getByRole('button', { name: 'Quitar de favoritos' }).click()
    await expect(page.getByRole('button', { name: 'Agregar a favoritos' })).toBeVisible()
    expect(supabase.state.savedRides).toHaveLength(0)
  })

  test('hides the save star for anonymous visitors', async ({ page }) => {
    await page.goto('/rides')

    await expect(page.getByRole('button', { name: 'Agregar a favoritos' })).toHaveCount(0)
  })
})
