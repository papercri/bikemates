import { test, expect } from '../helpers/fixtures'
import { makeRide } from '../helpers/seeds'

test.describe('home', () => {
  test('shows the hero and primary CTAs for anonymous visitors', async ({ page, supabase }) => {
    supabase.state.rides = [makeRide()]

    await page.goto('/')

    // Un único H1 de página; el texto de marketing puede cambiar sin tocar el test.
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

    // CTAs para visitantes anónimos, localizados por destino en el hero: la
    // cabecera enlaza también, pero su link vive en el menú plegado en móvil.
    await expect(page.locator('main a[href="/rides"]').first()).toBeVisible()
    await expect(page.locator('main a[href="/register"]').first()).toBeVisible()
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
    await expect(page.locator('main a[href="/rides"]').first()).toBeVisible()
  })

  test('hides the rides preview section when fewer than two future rides exist', async ({
    page,
    supabase,
  }) => {
    supabase.state.rides = [makeRide()]

    await page.goto('/')

    await expect(page.locator('a[href^="/rides/"]')).toHaveCount(0)
  })

  test('fills the preview with recent rides when none are in the future', async ({
    page,
    supabase,
  }) => {
    const past = (days: number) => new Date(Date.now() - days * 86_400_000).toISOString()
    supabase.state.rides = [
      makeRide({ id: 'ride-1', title: 'Ruta celebrada', starts_at: past(2) }),
      makeRide({ id: 'ride-2', title: 'Otra celebrada', starts_at: past(9) }),
    ]

    await page.goto('/')

    // La portada no se queda sin escaparate aunque las salidas ya hayan pasado.
    await expect(page.locator('a[href^="/rides/"]')).toHaveCount(2)
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

    // Las tres secciones de la portada, identificadas por su heading asociado.
    await expect(page.locator('#features-title')).toBeVisible()
    await expect(page.locator('#gallery-title')).toBeVisible()
    await expect(page.locator('#cta-title')).toBeVisible()
  })
})
