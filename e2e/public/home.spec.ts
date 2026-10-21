import { test, expect } from '../helpers/fixtures'
import { makeRide } from '../helpers/seeds'

test.describe('home', () => {
  test('shows the hero and primary CTAs for anonymous visitors', async ({ page, supabase }) => {
    supabase.state.rides = [makeRide()]

    await page.goto('/')

    // Un único H1 de página; el texto de marketing puede cambiar sin tocar el test.
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

    // CTAs para visitantes anónimos, localizados por destino.
    await expect(page.locator('header a[href="/rides"]').first()).toBeVisible()
    await expect(page.getByRole('link', { href: '/register' }).first()).toBeVisible()
  })

  test('shows the published ride preview when at least two future rides exist', async ({
    page,
    supabase,
  }) => {
    supabase.state.rides = [
      makeRide({ title: 'Ruta de prueba' }),
      makeRide({ id: 'ride-2', title: 'Segunda salida' }),
    ]

    await page.goto('/')

    // Las tarjetas enlazan al detalle de cada salida.
    await expect(page.locator('a[href^="/rides/"]').first()).toBeVisible()

    // El CTA del listado apunta a la página pública de rutas.
    await expect(page.locator('a[href="/rides"]').first()).toBeVisible()
  })

  test('hides the rides preview section when fewer than two future rides exist', async ({
    page,
    supabase,
  }) => {
    supabase.state.rides = [makeRide()]

    await page.goto('/')

    await expect(page.locator('a[href^="/rides/"]')).toHaveCount(0)
  })

  test('offers the publish CTA once the session is active', async ({ page, supabase }) => {
    await supabase.signInAs({
      id: 'user-1',
      email: 'ana@example.com',
      displayName: 'Ana Pedal',
      password: 'pedaleando123',
    })
    supabase.state.users.push({
      id: 'user-1',
      email: 'ana@example.com',
      displayName: 'Ana Pedal',
      password: 'pedaleando123',
    })

    await page.goto('/')

    await expect(page.getByRole('link', { href: '/rides/create' }).first()).toBeVisible()
  })

  test('renders Open Graph metadata for social sharing', async ({ page }) => {
    await page.goto('/')

    await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'website')
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', /BikeMates/)
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', /\/$/)
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      'content',
      /\/photos\/.+\.webp$/,
    )
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
      'content',
      'summary_large_image',
    )
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/$/)
  })

  test('renders the feature and CTA sections', async ({ page, supabase }) => {
    supabase.state.rides = [makeRide(), makeRide({ id: 'ride-2' })]

    await page.goto('/')

    // Estructura de secciones (tres H2), sin atar el texto de marketing.
    await expect(page.getByRole('heading', { level: 2 })).toHaveCount(3)
  })
})
