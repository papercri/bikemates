import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { createRouter, createWebHistory } from 'vue-router'
import AppBreadcrumb from '../AppBreadcrumb.vue'

async function mountBreadcrumb(path: string, meta?: Record<string, unknown>) {
  const router = createRouter({
    history: createWebHistory(),
    routes: [
      { path: '/', name: 'home', component: { template: '<div />' } },
      { path: '/rides', name: 'rides', component: { template: '<div />' }, meta },
      { path: '/profile', name: 'profile', component: { template: '<div />' } },
    ],
  })
  await router.push(path)
  await router.isReady()

  return mount(AppBreadcrumb, { global: { plugins: [router] } })
}

describe('AppBreadcrumb', () => {
  it('renders the trail defined in the route meta with the last item as current page', async () => {
    const wrapper = await mountBreadcrumb('/rides', {
      breadcrumb: [
        { label: 'Inicio', to: '/' },
        { label: 'Explorar rutas' },
      ],
    })

    const links = wrapper.findAll('a')
    expect(links).toHaveLength(1)
    expect(links[0]!.text()).toBe('Inicio')
    expect(links[0]!.attributes('href')).toBe('/')

    const current = wrapper.get('[aria-current="page"]')
    expect(current.text()).toBe('Explorar rutas')

    expect(wrapper.get('nav').attributes('aria-label')).toBe('Migas de pan')
  })

  it('renders nothing when the route has no breadcrumb meta', async () => {
    const wrapper = await mountBreadcrumb('/rides')

    expect(wrapper.find('nav').exists()).toBe(false)
  })

  it('appends the active profile tab reflected in the URL', async () => {
    const wrapper = await mountBreadcrumb('/profile?tab=my-rides', {
      breadcrumb: [
        { label: 'Inicio', to: '/' },
        { label: 'Mi perfil' },
      ],
    })

    expect(wrapper.text()).toContain('Mi perfil')
    expect(wrapper.get('[aria-current="page"]').text()).toBe('Mis rutas')
  })
})
