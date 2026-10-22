import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, type PropType } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import type { Ride } from '@/features/rides/types'
import ProfileMyRidesTab from '../ProfileMyRidesTab.vue'

const mocks = vi.hoisted(() => ({
  getMyRides: vi.fn<() => Promise<Ride[]>>(),
  deleteRide: vi.fn<(id: string) => Promise<void>>(),
}))

vi.mock('@/features/rides/services/rideService', () => ({
  getMyRides: mocks.getMyRides,
  deleteRide: mocks.deleteRide,
}))

/** Sustituye RideCard por un nodo plano que deja leer el título y el estado "pasada". */
const RideCardStub = defineComponent({
  name: 'RideCard',
  props: {
    ride: { type: Object as PropType<Ride>, required: true },
    past: { type: Boolean, default: false },
    bare: { type: Boolean, default: false },
  },
  setup(props) {
    return () =>
      h('div', { 'data-testid': 'ride-card', 'data-past': String(props.past) }, props.ride.title)
  },
})

function rideOf(overrides: Partial<Ride> & { id: string }): Ride {
  return {
    organizerId: 'organizer-1',
    title: `Ruta ${overrides.id}`,
    description: 'Descripción de prueba para la ruta.',
    startsAt: '2027-06-10T09:30:00.000Z',
    meetingPoint: 'Plaça de l’Església, Barcelona',
    latitude: 41.4,
    longitude: 2.17,
    bikeType: 'gravel',
    level: 'Intermedio',
    distanceKm: 30,
    elevationM: 300,
    durationMinutes: 120,
    imagePath: null,
    wikilocUrl: null,
    audience: 'everyone',
    maxParticipants: null,
    routeType: null,
    status: 'published',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    imageUrl: null,
    ...overrides,
  }
}

const routes = [
  { path: '/', name: 'home', component: { template: '<div />' } },
  { path: '/rides/create', name: 'ride-create', component: { template: '<div />' } },
  { path: '/rides/:id', name: 'ride-detail', component: { template: '<div />' } },
  { path: '/rides/:id/edit', name: 'ride-edit', component: { template: '<div />' } },
]

async function mountComponent() {
  const router = createRouter({ history: createWebHistory(), routes })
  await router.push('/')
  await router.isReady()

  return mount(ProfileMyRidesTab, {
    global: { plugins: [router], stubs: { RideCard: RideCardStub } },
    attachTo: document.body,
  })
}

function cardTitles(wrapper: Awaited<ReturnType<typeof mountComponent>>): string[] {
  return wrapper.findAll('[data-testid="ride-card"]').map((card) => card.text())
}

function dialogButton(selector: '[data-dialog-confirm]' | '[data-dialog-cancel]') {
  const button = document.querySelector<HTMLButtonElement>(selector)
  expect(button).not.toBeNull()
  return button!
}

beforeEach(() => {
  vi.clearAllMocks()
  document.body.innerHTML = ''
})

describe('ProfileMyRidesTab', () => {
  it('loads my rides and shows the published count', async () => {
    mocks.getMyRides.mockResolvedValue([
      rideOf({ id: 'a', title: 'Ruta del río' }),
      rideOf({ id: 'b', title: 'Ruta de la sierra' }),
    ])
    const wrapper = await mountComponent()
    await flushPromises()

    expect(cardTitles(wrapper)).toEqual(['Ruta del río', 'Ruta de la sierra'])
    expect(wrapper.text()).toContain('2 rutas publicadas')

    wrapper.unmount()
  })

  it('renders the empty state when there are no published rides', async () => {
    mocks.getMyRides.mockResolvedValue([])
    const wrapper = await mountComponent()
    await flushPromises()

    expect(wrapper.text()).toContain('Todavía no has publicado ninguna ruta')
    expect(wrapper.get('a[href="/rides/create"]').text()).toBe('Publicar ruta')

    wrapper.unmount()
  })

  it('surfaces a load error and retries on demand', async () => {
    mocks.getMyRides.mockRejectedValueOnce(new Error('fallo'))
    const wrapper = await mountComponent()
    await flushPromises()

    expect(wrapper.text()).toContain('No se han podido cargar tus rutas')

    mocks.getMyRides.mockResolvedValueOnce([rideOf({ id: 'a' })])
    await wrapper
      .findAll('button')
      .find((button) => button.text().trim() === 'Reintentar')!
      .trigger('click')
    await flushPromises()

    expect(mocks.getMyRides).toHaveBeenCalledTimes(2)
    expect(cardTitles(wrapper)).toEqual(['Ruta a'])

    wrapper.unmount()
  })

  it('reorders the rides when the sort criterion changes', async () => {
    mocks.getMyRides.mockResolvedValue([
      rideOf({
        id: 'corta',
        title: 'Ruta corta',
        distanceKm: 20,
        startsAt: '2027-05-01T09:00:00.000Z',
      }),
      rideOf({
        id: 'larga',
        title: 'Ruta larga',
        distanceKm: 80,
        startsAt: '2027-07-01T09:00:00.000Z',
      }),
    ])
    const wrapper = await mountComponent()
    await flushPromises()

    // Por defecto: fecha ascendente (la de mayo antes que la de julio).
    expect(cardTitles(wrapper)).toEqual(['Ruta corta', 'Ruta larga'])

    // El orden ahora vive en un menú desplegable (misma UI que la página de rutas).
    await wrapper.get('button[aria-haspopup="menu"]').trigger('click')
    await wrapper
      .findAll('[role="menuitemradio"]')
      .find((item) => item.text() === 'Distancia')
      ?.trigger('click')
    await flushPromises()

    // Por distancia descendente: la larga primero.
    expect(cardTitles(wrapper)).toEqual(['Ruta larga', 'Ruta corta'])

    wrapper.unmount()
  })

  it('shows the integrated card actions for each ride', async () => {
    mocks.getMyRides.mockResolvedValue([
      rideOf({ id: 'a', title: 'Ruta del río' }),
      rideOf({ id: 'b', title: 'Ruta de la sierra' }),
    ])
    const wrapper = await mountComponent()
    await flushPromises()

    const editLinks = wrapper.findAll('a').filter((link) => link.text().trim() === 'Modificar')
    expect(editLinks).toHaveLength(2)
    expect(editLinks[0]!.attributes('href')).toBe('/rides/a/edit')
    expect(editLinks[1]!.attributes('href')).toBe('/rides/b/edit')

    const deleteButtons = wrapper
      .findAll('button')
      .filter((button) => button.text().trim() === 'Eliminar')
    expect(deleteButtons).toHaveLength(2)

    wrapper.unmount()
  })

  it('filters the rides by title while typing', async () => {
    mocks.getMyRides.mockResolvedValue([
      rideOf({ id: 'a', title: 'Ruta del río' }),
      rideOf({ id: 'b', title: 'Ruta de la sierra' }),
    ])
    const wrapper = await mountComponent()
    await flushPromises()

    await wrapper.get('input[type="search"]').setValue('sierra')
    await flushPromises()

    expect(cardTitles(wrapper)).toEqual(['Ruta de la sierra'])
    expect(wrapper.text()).toContain('1 ruta publicada')

    await wrapper.get('input[type="search"]').setValue('zzz')
    await flushPromises()

    expect(cardTitles(wrapper)).toEqual([])
    expect(wrapper.text()).toContain('Ninguna ruta coincide con la búsqueda.')

    wrapper.unmount()
  })

  it('deletes a ride after confirmation', async () => {
    mocks.getMyRides.mockResolvedValue([
      rideOf({ id: 'a', title: 'Ruta del río' }),
      rideOf({ id: 'b', title: 'Ruta de la sierra' }),
    ])
    mocks.deleteRide.mockResolvedValue()
    const wrapper = await mountComponent()
    await flushPromises()

    const deleteButtons = wrapper
      .findAll('button')
      .filter((button) => button.text().trim() === 'Eliminar')
    expect(deleteButtons).toHaveLength(2)

    await deleteButtons[0]!.trigger('click')
    await wrapper.vm.$nextTick()

    const dialog = document.querySelector('[role="dialog"]')
    expect(dialog?.textContent).toContain('¿Eliminar «Ruta del río»?')

    dialogButton('[data-dialog-confirm]').click()
    await flushPromises()

    expect(mocks.deleteRide).toHaveBeenCalledWith('a')
    expect(cardTitles(wrapper)).toEqual(['Ruta de la sierra'])
    expect(document.querySelector('[role="dialog"]')).toBeNull()

    wrapper.unmount()
  })

  it('keeps the ride when the deletion is cancelled', async () => {
    mocks.getMyRides.mockResolvedValue([rideOf({ id: 'a', title: 'Ruta del río' })])
    const wrapper = await mountComponent()
    await flushPromises()

    await wrapper
      .findAll('button')
      .find((button) => button.text().trim() === 'Eliminar')!
      .trigger('click')
    await wrapper.vm.$nextTick()

    dialogButton('[data-dialog-cancel]').click()
    await wrapper.vm.$nextTick()

    expect(mocks.deleteRide).not.toHaveBeenCalled()
    expect(cardTitles(wrapper)).toEqual(['Ruta del río'])

    wrapper.unmount()
  })

  it('surfaces an error when the ride deletion fails', async () => {
    mocks.getMyRides.mockResolvedValue([rideOf({ id: 'a', title: 'Ruta del río' })])
    mocks.deleteRide.mockRejectedValue(new Error('permiso'))
    const wrapper = await mountComponent()
    await flushPromises()

    await wrapper
      .findAll('button')
      .find((button) => button.text().trim() === 'Eliminar')!
      .trigger('click')
    await wrapper.vm.$nextTick()

    dialogButton('[data-dialog-confirm]').click()
    await flushPromises()

    expect(wrapper.text()).toContain('No se ha podido eliminar la ruta')
    expect(cardTitles(wrapper)).toEqual(['Ruta del río'])

    wrapper.unmount()
  })
})
