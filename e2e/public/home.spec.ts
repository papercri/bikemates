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

  test('shows the published ride preview and links to the rides list', async ({ page, supabase }) => {
    supabase.state.rides = [makeRide({ title: 'Ruta de prueba' })]

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

  test('renders the feature and CTA sections', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('heading', { level: 2, name: 'Todo empieza con una ruta' })).toBeVisible()
    await expect(page.getByRole('heading', { level: 2, name: 'Así se vive una salida' })).toBeVisible()
    await expect(
      page.getByRole('heading', { level: 2, name: 'Tu próxima salida empieza aquí' }),
    ).toBeVisible()
  })
})
