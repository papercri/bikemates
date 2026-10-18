import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createRouter, createWebHistory } from 'vue-router'
import AppBackBar from '../AppBackBar.vue'

const routes = [
  { path: '/', name: 'home', component: { template: '<div />' } },
  { path: '/rides', name: 'rides', component: { template: '<div />' } },
  { path: '/rides/ride-1/edit', name: 'ride-edit', component: { template: '<div />' } },
]

async function mountBar() {
  const router = createRouter({ history: createWebHistory(), routes })
  await router.push('/rides/ride-1/edit')
  await router.isReady()

  const wrapper = mount(AppBackBar, {
    global: { plugins: [router] },
    props: { fallback: '/rides', showAllRidesLink: true },
  })

  return { wrapper, router }
}

beforeEach(() => {
  window.history.replaceState(null, '')
})

describe('AppBackBar', () => {
  it('renders the back control and the all-rides link', async () => {
    const { wrapper } = await mountBar()

    expect(wrapper.get('button').text()).toContain('Volver')

    const allRides = wrapper.get('a[href="/rides"]')
    expect(allRides.text()).toContain('Ver todas las rutas')
  })

  it('goes back through the browser history when there is a previous entry', async () => {
    const { wrapper, router } = await mountBar()
    const backSpy = vi.spyOn(router, 'back').mockImplementation(() => {})

    window.history.replaceState({ back: '/rides' }, '')
    await wrapper.get('button').trigger('click')

    expect(backSpy).toHaveBeenCalledOnce()

    backSpy.mockRestore()
  })

  it('pushes the fallback route when there is no history entry', async () => {
    const { wrapper, router } = await mountBar()
    const backSpy = vi.spyOn(router, 'back').mockImplementation(() => {})

    await wrapper.get('button').trigger('click')
    await flushPromises()

    expect(backSpy).not.toHaveBeenCalled()
    expect(router.currentRoute.value.path).toBe('/rides')
  })
})
