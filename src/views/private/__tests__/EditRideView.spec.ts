import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import { ref } from 'vue'
import type { Ride } from '@/features/rides/types'
import EditRideView from '../EditRideView.vue'

const mocks = vi.hoisted(() => ({
  deleteRide: vi.fn<(id: string) => Promise<void>>(),
  saveRide: vi.fn<() => Promise<void>>(),
}))

vi.mock('@unhead/vue', () => ({
  useHead: () => ({}),
}))

vi.mock('@/features/rides/services/rideService', () => ({
  deleteRide: mocks.deleteRide,
}))

vi.mock('@/features/rides/services/rideImageService', () => ({
  getRideImageUrl: (path: string) => `https://cdn.example.test/${path}`,
}))

const ride = {
  id: 'ride-1',
  organizerId: 'organizer-1',
  title: 'Vuelta por Collserola',
  description: 'Recorrido sencillo por pista forestal.',
  startsAt: '2027-06-10T09:30:00.000Z',
  meetingPoint: 'Plaça de l’Església, Barcelona',
  latitude: 41.4,
  longitude: 2.17,
  bikeType: 'gravel',
  level: 'Intermedio',
  distanceKm: 32,
  elevationM: 650,
  durationMinutes: 150,
  imagePath: null,
  wikilocUrl: null,
  audience: 'everyone',
  maxParticipants: 30,
  routeType: null,
  status: 'published',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  imageUrl: null,
} satisfies Ride

vi.mock('@/features/rides/composables/useRideEditor', () => ({
  useRideEditor: () => ({
    ride: ref<Ride | null>(ride),
    isLoading: ref(false),
    isSubmitting: ref(false),
    errorMessage: ref(''),
    initialValues: ref({}),
    saveRide: mocks.saveRide,
  }),
}))

const routes = [
  { path: '/', name: 'home', component: { template: '<div />' } },
  { path: '/profile', name: 'profile', component: { template: '<div />' } },
  { path: '/rides/:id/edit', name: 'ride-edit', component: { template: '<div />' } },
]

async function mountComponent() {
  const router = createRouter({ history: createWebHistory(), routes })
  await router.push('/rides/ride-1/edit')
  await router.isReady()

  const wrapper = mount(EditRideView, {
    global: { plugins: [router, createPinia()], stubs: { RideForm: true } },
    attachTo: document.body,
  })

  return { wrapper, router }
}

function dialogButton(selector: '[data-dialog-confirm]' | '[data-dialog-cancel]') {
  const button = document.querySelector<HTMLButtonElement>(selector)
  expect(button).not.toBeNull()
  return button!
}

function deleteSectionButton(wrapper: Awaited<ReturnType<typeof mountComponent>>['wrapper']) {
  return wrapper.findAll('button').find((button) => button.text().includes('Eliminar ruta'))
}

beforeEach(() => {
  vi.clearAllMocks()
  document.body.innerHTML = ''
})

describe('EditRideView', () => {
  it('shows the delete section once the ride is loaded', async () => {
    const { wrapper } = await mountComponent()
    await flushPromises()

    expect(wrapper.get('h2').text()).toBe('Eliminar ruta')
    expect(deleteSectionButton(wrapper)).toBeTruthy()

    wrapper.unmount()
  })

  it('deletes the ride after confirmation and returns to my rides', async () => {
    mocks.deleteRide.mockResolvedValue()
    const { wrapper, router } = await mountComponent()
    await flushPromises()

    deleteSectionButton(wrapper)?.trigger('click')
    await wrapper.vm.$nextTick()

    const dialog = document.querySelector('[role="dialog"]')
    expect(dialog?.textContent).toContain('¿Eliminar «Vuelta por Collserola»?')

    dialogButton('[data-dialog-confirm]').click()
    await flushPromises()

    expect(mocks.deleteRide).toHaveBeenCalledWith('ride-1')
    expect(router.currentRoute.value.path).toBe('/profile')
    expect(router.currentRoute.value.query.tab).toBe('my-rides')

    wrapper.unmount()
  })

  it('keeps the ride when the deletion is cancelled', async () => {
    const { wrapper, router } = await mountComponent()
    await flushPromises()

    deleteSectionButton(wrapper)?.trigger('click')
    await wrapper.vm.$nextTick()

    dialogButton('[data-dialog-cancel]').click()
    await wrapper.vm.$nextTick()

    expect(mocks.deleteRide).not.toHaveBeenCalled()
    expect(router.currentRoute.value.path).toBe('/rides/ride-1/edit')

    wrapper.unmount()
  })

  it('surfaces an error when the deletion fails', async () => {
    mocks.deleteRide.mockRejectedValue(new Error('permiso'))
    const { wrapper, router } = await mountComponent()
    await flushPromises()

    deleteSectionButton(wrapper)?.trigger('click')
    await wrapper.vm.$nextTick()

    dialogButton('[data-dialog-confirm]').click()
    await flushPromises()

    expect(wrapper.text()).toContain('No se ha podido eliminar la ruta')
    expect(router.currentRoute.value.path).toBe('/rides/ride-1/edit')

    wrapper.unmount()
  })
})
