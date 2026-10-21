import { test, expect } from '../helpers/fixtures'
import { makeRide } from '../helpers/seeds'

test.describe('home', () => {
  test('shows the hero and primary CTAs for anonymous visitors', async ({ page, supabase }) => {
    supabase.state.rides = [makeRide()]

    await page.goto('/')

    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      'Encuentra tu grupeta.Comparte la ruta.',
    )

    await expect(
      page.getByText('Conecta con ciclistas cerca de ti, organiza salidas y descubre nuevas rutas'),
    ).toBeVisible()

    // CTAs para visitantes anónimos.
    await expect(page.getByRole('link', { name: 'Explorar rutas' }).first()).toBeVisible()
    await expect(page.getByRole('link', { name: 'Únete a BikeMates' })).toBeVisible()
  })

  test('shows the published ride preview and links to the rides list', async ({
    page,
    supabase,
  }) => {
    // La sección de salidas solo se renderiza con al menos dos rutas futuras.
    supabase.state.rides = [
      makeRide({ title: 'Ruta de prueba' }),
      makeRide({ id: 'ride-2', title: 'Segunda salida' }),
    ]

    await page.goto('/')

    await expect(page.getByRole('link', { name: 'Ver próximas salidas' })).toBeVisible()

    // El enlace del CTA inferior apunta a la lista pública de rutas.
    const exploreLink = page.getByRole('link', { name: 'Explorar rutas' }).first()
    await expect(exploreLink).toHaveAttribute('href', '/rides')
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

    await expect(page.getByRole('link', { name: 'Publicar ruta' }).first()).toBeVisible()
    await expect(page.getByRole('link', { name: 'Publicar ruta' }).first()).toHaveAttribute(
      'href',
      '/rides/create',
    )
  })

  test('renders Open Graph metadata for social sharing', async ({ page }) => {
    await page.goto('/')

    await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'website')
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
      'content',
      'BikeMates | Encuentra ciclistas y rutas',
    )
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', /\/$/)
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      'content',
      /\/photos\/grupeta-camino\.webp$/,
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

    await expect(
      page.getByRole('heading', { level: 2, name: 'Cada salida es una oportunidad para conectar' }),
    ).toBeVisible()
    await expect(
      page.getByRole('heading', { level: 2, name: 'Encuentra una excursión a tu ritmo' }),
    ).toBeVisible()
    await expect(
      page.getByRole('heading', { level: 2, name: 'Encuentra tu próxima grupeta' }),
    ).toBeVisible()
  })
})
