import { mount, flushPromises } from '@vue/test-utils'
import type { User } from '@supabase/supabase-js'
import { describe, expect, it } from 'vitest'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import AppHeader from '@/components/layout/AppHeader.vue'
import { useAuthStore } from '@/features/auth/stores/authStore'

const signedInUser: User = {
  id: 'user-1',
  aud: 'authenticated',
  email: 'ana@ejemplo.com',
  app_metadata: { provider: 'email' },
  user_metadata: {},
  identities: [],
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
}

const routes = [
  { path: '/', component: { template: '<div>Inicio</div>' } },
  { path: '/rides', component: { template: '<div>Rutas</div>' } },
  { path: '/login', component: { template: '<div>Entrar</div>' } },
  { path: '/register', component: { template: '<div>Alta</div>' } },
  { path: '/community-rules', component: { template: '<div>Normas</div>' } },
  { path: '/privacy', component: { template: '<div>Privacidad</div>' } },
  {
    path: '/landing',
    component: { template: '<div>Landing</div>' },
    meta: { overlayHeader: true },
  },
]

async function mountHeader(path = '/') {
  const router = createRouter({ history: createWebHistory(), routes })
  await router.push(path)
  await router.isReady()

  const wrapper = mount(AppHeader, {
    global: { plugins: [router, createPinia()] },
    // Adjuntar al documento permite verificar el foco tras cerrar con Escape.
    attachTo: document.body,
  })

  return { wrapper, router }
}

function menuButton(wrapper: ReturnType<typeof mount>) {
  return wrapper.get('button[aria-controls="primary-mobile-nav"]')
}

describe('AppHeader', () => {
  it('renders the mobile menu button with a closed disclosure state', async () => {
    const { wrapper } = await mountHeader()

    const button = menuButton(wrapper)

    expect(button.attributes('aria-expanded')).toBe('false')
    expect(button.text()).toContain('Abrir menú')
    expect(wrapper.get('#primary-mobile-nav').isVisible()).toBe(false)
  })

  it('opens the menu on click and shows the navigation links', async () => {
    const { wrapper } = await mountHeader()
    const button = menuButton(wrapper)

    await button.trigger('click')

    expect(button.attributes('aria-expanded')).toBe('true')
    expect(button.text()).toContain('Cerrar menú')
    expect(wrapper.get('#primary-mobile-nav').isVisible()).toBe(true)
    expect(wrapper.get('#primary-mobile-nav').text()).toContain('Explorar rutas')
  })

  it('closes the menu on Escape and returns focus to the button', async () => {
    const { wrapper } = await mountHeader()
    const button = menuButton(wrapper)

    await button.trigger('click')
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await flushPromises()

    expect(button.attributes('aria-expanded')).toBe('false')
    expect(wrapper.get('#primary-mobile-nav').isVisible()).toBe(false)
    expect(document.activeElement).toBe(button.element)
  })

  it('closes the menu when the route changes', async () => {
    const { wrapper, router } = await mountHeader()
    const button = menuButton(wrapper)

    await button.trigger('click')
    await router.push('/rides')
    await flushPromises()

    expect(button.attributes('aria-expanded')).toBe('false')
    expect(wrapper.get('#primary-mobile-nav').isVisible()).toBe(false)
  })

  it('shows the pending-session status until the session is known', async () => {
    const { wrapper } = await mountHeader()

    expect(wrapper.text()).toContain('Comprobando sesión…')

    await menuButton(wrapper).trigger('click')

    expect(wrapper.get('#primary-mobile-nav').text()).toContain('Comprobando sesión…')
  })

  it('shows the guest actions once the session is known', async () => {
    const { wrapper } = await mountHeader()
    const authStore = useAuthStore()

    authStore.isInitialized = true
    await flushPromises()
    await menuButton(wrapper).trigger('click')

    const panel = wrapper.get('#primary-mobile-nav')
    expect(panel.text()).toContain('Iniciar sesión')
    expect(panel.text()).toContain('Registrarse')
  })

  it('shows the session actions as square icon-only controls with tooltips', async () => {
    const { wrapper } = await mountHeader()
    const authStore = useAuthStore()

    authStore.isInitialized = true
    authStore.user = signedInUser
    await flushPromises()

    const profile = wrapper
      .findAll('a[href="/profile"]')
      .find((link) => link.find('[role="tooltip"]').exists())
    expect(profile).toBeDefined()
    expect(profile!.text()).toContain('Mi perfil')
    expect(profile!.classes()).toContain('size-10')

    const logout = wrapper
      .findAll('button')
      .find((button) => button.find('[role="tooltip"]').exists())
    expect(logout).toBeDefined()
    expect(logout!.text()).toContain('Cerrar sesión')
    expect(logout!.classes()).toContain('size-10')

    // El nombre accesible vive en un texto para lectores, no en el globo oculto.
    expect(profile!.get('.sr-only').text()).toBe('Mi perfil')
    expect(logout!.get('.sr-only').text()).toBe('Cerrar sesión')
  })

  it('switches the overlay header to a solid background once the page is scrolled', async () => {
    const { wrapper } = await mountHeader('/landing')

    expect(wrapper.get('header').classes()).toContain('bg-transparent')

    Object.defineProperty(window, 'scrollY', { value: 120, configurable: true })
    window.dispatchEvent(new Event('scroll'))
    await flushPromises()

    expect(wrapper.get('header').classes()).toContain('bg-canvas/95')
    expect(wrapper.get('header').classes()).not.toContain('bg-transparent')

    Object.defineProperty(window, 'scrollY', { value: 0, configurable: true })
    window.dispatchEvent(new Event('scroll'))
  })

  it('offers legal links in the mobile menu and a borderless logout action', async () => {
    const { wrapper } = await mountHeader()
    const authStore = useAuthStore()

    authStore.isInitialized = true
    authStore.user = signedInUser
    await flushPromises()

    await menuButton(wrapper).trigger('click')
    const panel = wrapper.get('#primary-mobile-nav')

    expect(panel.get('a[href="/community-rules"]').text()).toBe('Normas de la comunidad')
    expect(panel.get('a[href="/privacy"]').text()).toBe('Política de privacidad')

    // El cierre de sesión comparte estilo con los enlaces del panel: sin filete.
    const logout = panel.findAll('button').find((button) => button.text().includes('Cerrar sesión'))
    expect(logout).toBeDefined()
    expect(logout!.classes()).toContain('text-sm')
    expect(logout!.classes()).not.toContain('border-line-strong')
    expect(logout!.classes()).not.toContain('bg-white')
  })
})
