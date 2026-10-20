import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Ride } from '../types'
import { useRideList } from './useRideList'

const mocks = vi.hoisted(() => ({
  getPublishedRides: vi.fn<() => Promise<Ride[]>>(),
  getMyParticipatingRideIds: vi.fn<() => Promise<string[]>>(),
}))

vi.mock('../services/rideService', () => ({
  getPublishedRides: mocks.getPublishedRides,
  getMyParticipatingRideIds: mocks.getMyParticipatingRideIds,
}))

function mountList() {
  const Harness = defineComponent({
    setup() {
      return useRideList()
    },
    render: () => null,
  })

  return mount(Harness)
}

describe('useRideList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.getMyParticipatingRideIds.mockResolvedValue([])
  })

  it('starts loading and stores the published rides on mount', async () => {
    const rides = [{ id: 'ride-1' }] as Ride[]
    mocks.getPublishedRides.mockResolvedValue(rides)

    const wrapper = mountList()

    expect(wrapper.vm.isLoading).toBe(true)
    await flushPromises()

    expect(wrapper.vm.rides).toEqual(rides)
    expect(wrapper.vm.isLoading).toBe(false)
    expect(wrapper.vm.errorMessage).toBeNull()
  })

  it('stores the ids of the rides the user participates in', async () => {
    mocks.getPublishedRides.mockResolvedValue([])
    mocks.getMyParticipatingRideIds.mockResolvedValue(['ride-9'])

    const wrapper = mountList()
    await flushPromises()

    expect(wrapper.vm.participatingRideIds).toEqual(['ride-9'])
  })

  it('explains a failed load with the service message', async () => {
    mocks.getPublishedRides.mockRejectedValue(new Error('No se pudieron cargar las rutas: offline'))

    const wrapper = mountList()
    await flushPromises()

    expect(wrapper.vm.errorMessage).toBe('No se pudieron cargar las rutas: offline')
    expect(wrapper.vm.isLoading).toBe(false)
  })

  it('falls back to a generic message for unknown failures', async () => {
    mocks.getPublishedRides.mockRejectedValue('boom')

    const wrapper = mountList()
    await flushPromises()

    expect(wrapper.vm.errorMessage).toBe('No se han podido cargar las rutas. Inténtalo de nuevo.')
  })

  it('can reload the list on demand', async () => {
    mocks.getPublishedRides.mockResolvedValue([])

    const wrapper = mountList()
    await flushPromises()

    mocks.getPublishedRides.mockResolvedValue([{ id: 'ride-2' }] as Ride[])
    await wrapper.vm.loadRides()

    expect(mocks.getPublishedRides).toHaveBeenCalledTimes(2)
    expect(wrapper.vm.rides).toEqual([{ id: 'ride-2' }] as Ride[])
  })
})
