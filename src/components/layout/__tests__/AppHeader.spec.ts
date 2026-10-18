import { mount, flushPromises } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import AppHeader from '@/components/layout/AppHeader.vue'
import { useAuthStore } from '@/features/auth/stores/authStore'

const routes = [
  { path: '/', component: { template: '<div>Inicio</div>' } },
  { path: '/rides', component: { template: '<div>Rutas</div>' } },
  { path: '/login', component: { template: '<div>Entrar</div>' } },
  { path: '/register', component: { template: '<div>Alta</div>' } },
]

async function mountHeader() {
  const router = createRouter({ history: createWebHistory(), routes })
  await router.push('/')
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
})
