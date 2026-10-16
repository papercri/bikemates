import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Ride } from '@/features/rides/types'
import { useRideList } from './useRideList'

const mocks = vi.hoisted(() => ({
  getPublishedRides: vi.fn<() => Promise<Ride[]>>(),
}))

vi.mock('@/features/rides/services/rideService', () => ({
  getPublishedRides: mocks.getPublishedRides,
}))

function ride(id: string): Ride {
  return {
    id,
    organizerId: 'user-1',
    title: `Ruta ${id}`,
    description: 'Subida tranquila.',
    startsAt: '2026-06-20T08:00:00.000Z',
    meetingPoint: 'Monistrol de Montserrat',
    latitude: 41.61,
    longitude: 1.84,
    bikeType: 'road',
    level: 'Intermedio',
    distanceKm: 42,
    elevationM: 900,
    durationMinutes: 180,
    imagePath: null,
    wikilocUrl: null,
    audience: 'everyone',
    maxParticipants: 12,
    status: 'published',
    createdAt: '2026-05-01T10:00:00.000Z',
    updatedAt: '2026-05-01T10:00:00.000Z',
  }
}

function mountList() {
  const Harness = defineComponent({
    setup() {
      const list = useRideList()
      return { list }
    },
    render: () => null,
  })

  return mount(Harness)
}

describe('useRideList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('loads the published rides on mount', async () => {
    const expected = [ride('ride-1'), ride('ride-2')]
    mocks.getPublishedRides.mockResolvedValue(expected)

    const wrapper = mountList()
    await flushPromises()

    expect(mocks.getPublishedRides).toHaveBeenCalledTimes(1)
    expect(wrapper.vm.list.rides.value).toEqual(expected)
    expect(wrapper.vm.list.isLoading.value).toBe(false)
    expect(wrapper.vm.list.errorMessage.value).toBeNull()
  })

  it('surfaces the service error message', async () => {
    mocks.getPublishedRides.mockRejectedValue(new Error('Base de datos no disponible.'))

    const wrapper = mountList()
    await flushPromises()

    expect(wrapper.vm.list.errorMessage.value).toBe('Base de datos no disponible.')
    expect(wrapper.vm.list.rides.value).toEqual([])
    expect(wrapper.vm.list.isLoading.value).toBe(false)
  })

  it('falls back to a generic message for unknown errors', async () => {
    mocks.getPublishedRides.mockRejectedValue(undefined)

    const wrapper = mountList()
    await flushPromises()

    expect(wrapper.vm.list.errorMessage.value).toBe(
      'No se han podido cargar las rutas. Inténtalo de nuevo.',
    )
  })
})
