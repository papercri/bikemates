import { test, expect } from '../helpers/fixtures'

test.describe('navigation', () => {
  test('shows the public header links for anonymous visitors', async ({ page, isMobile }) => {
    await page.goto('/')

    if (isMobile) {
      // En móvil los enlaces viven dentro del panel desplegable.
      await page.getByRole('button', { name: 'Abrir menú' }).click()

      const mobileNav = page.locator('#primary-mobile-nav')
      await expect(mobileNav.getByRole('link', { name: 'Explorar rutas' })).toBeVisible()
      await expect(mobileNav.getByRole('link', { name: 'Iniciar sesión' })).toBeVisible()
      await expect(mobileNav.getByRole('link', { name: 'Registrarse' })).toBeVisible()
      return
    }

    // En escritorio "Explorar rutas" vive dentro del <nav>; el acceso y el
    // registro, en el bloque de sesión contiguo.
    const nav = page.getByRole('navigation', { name: 'Navegación principal' }).first()
    await expect(nav.getByRole('link', { name: 'Explorar rutas' })).toBeVisible()

    const banner = page.getByRole('banner')
    await expect(banner.getByRole('link', { name: 'Iniciar sesión' })).toBeVisible()
    await expect(banner.getByRole('link', { name: 'Registrarse' })).toBeVisible()
  })

  test('navigates from the logo back to the home page', async ({ page }) => {
    await page.goto('/rides')

    await page.getByRole('link', { name: 'BikeMates, página de inicio' }).first().click()

    await expect(page).toHaveURL('/')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })

  test('opens and closes the mobile menu', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'El menú móvil solo existe en viewports estrechos.')

    await page.goto('/')

    const toggle = page.getByRole('button', { name: 'Abrir menú' })
    await expect(toggle).toHaveAttribute('aria-expanded', 'false')

    await toggle.click()
    await expect(page.locator('#primary-mobile-nav')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Cerrar menú' })).toBeVisible()

    await page.getByRole('button', { name: 'Cerrar menú' }).click()
    await expect(page.locator('#primary-mobile-nav')).toBeHidden()
  })

  test('closes the mobile menu with the Escape key', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'El menú móvil solo existe en viewports estrechos.')

    await page.goto('/')
    await page.getByRole('button', { name: 'Abrir menú' }).click()
    await expect(page.locator('#primary-mobile-nav')).toBeVisible()

    await page.keyboard.press('Escape')

    await expect(page.locator('#primary-mobile-nav')).toBeHidden()
  })

  test('redirects unauthenticated users from the profile route to login', async ({ page }) => {
    await page.goto('/profile')

    await expect(page).toHaveURL('/login?redirect=/profile')
    await expect(page.getByRole('heading', { level: 1, name: 'Inicia sesión' })).toBeVisible()
  })

  test('redirects unauthenticated users from the create route to login', async ({ page }) => {
    await page.goto('/rides/create')

    await expect(page).toHaveURL('/login?redirect=/rides/create')
    await expect(page.getByRole('heading', { level: 1, name: 'Inicia sesión' })).toBeVisible()
  })
})
