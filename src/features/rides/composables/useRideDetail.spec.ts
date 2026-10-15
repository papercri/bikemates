import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent, type PropType } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Ride } from '@/features/rides/types'
import { useRideDetail } from './useRideDetail'

const mocks = vi.hoisted(() => ({
  getRideById: vi.fn<(id: string) => Promise<Ride>>(),
}))

vi.mock('@/features/rides/services/rideService', () => ({
  getRideById: mocks.getRideById,
}))

function ride(overrides: Partial<Ride> = {}): Ride {
  return {
    id: 'ride-1',
    organizerId: 'user-1',
    title: 'Ruta a Montserrat',
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
    ...overrides,
  }
}

function mountDetail(initialRideId: string | null) {
  const Harness = defineComponent({
    props: {
      rideId: { type: String as PropType<string | null>, default: null },
    },
    setup(props) {
      const detail = useRideDetail(() => props.rideId)
      return { detail }
    },
    render: () => null,
  })

  return mount(Harness, { props: { rideId: initialRideId } })
}

describe('useRideDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('loads the ride on mount', async () => {
    const expected = ride()
    mocks.getRideById.mockResolvedValue(expected)

    const wrapper = mountDetail('ride-1')
    await flushPromises()

    expect(mocks.getRideById).toHaveBeenCalledWith('ride-1')
    expect(wrapper.vm.detail.ride.value).toEqual(expected)
    expect(wrapper.vm.detail.isLoading.value).toBe(false)
    expect(wrapper.vm.detail.errorMessage.value).toBeNull()
  })

  it('reports an invalid identifier without calling the service', async () => {
    const wrapper = mountDetail(null)
    await flushPromises()

    expect(mocks.getRideById).not.toHaveBeenCalled()
    expect(wrapper.vm.detail.errorMessage.value).toBe('El identificador de la ruta no es válido.')
    expect(wrapper.vm.detail.isLoading.value).toBe(false)
  })

  it('surfaces the service error message', async () => {
    mocks.getRideById.mockRejectedValue(new Error('Ruta no encontrada.'))

    const wrapper = mountDetail('ride-1')
    await flushPromises()

    expect(wrapper.vm.detail.errorMessage.value).toBe('Ruta no encontrada.')
    expect(wrapper.vm.detail.ride.value).toBeNull()
    expect(wrapper.vm.detail.isLoading.value).toBe(false)
  })

  it('falls back to a generic message for unknown errors', async () => {
    mocks.getRideById.mockRejectedValue('fallo raro')

    const wrapper = mountDetail('ride-1')
    await flushPromises()

    expect(wrapper.vm.detail.errorMessage.value).toBe('No se ha podido cargar la ruta.')
  })

  it('reloads the ride when the identifier changes', async () => {
    mocks.getRideById.mockResolvedValue(ride())

    const wrapper = mountDetail('ride-1')
    await flushPromises()

    const updated = ride({ id: 'ride-2', title: 'Ruta al Coll de Pal' })
    mocks.getRideById.mockResolvedValue(updated)

    await wrapper.setProps({ rideId: 'ride-2' })
    await flushPromises()

    expect(mocks.getRideById).toHaveBeenLastCalledWith('ride-2')
    expect(wrapper.vm.detail.ride.value).toEqual(updated)
  })
})
