import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent, ref, type PropType } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Ride } from '../types'
import { useRideDetail } from './useRideDetail'

const mocks = vi.hoisted(() => ({
  getRideById: vi.fn<(id: string) => Promise<Ride>>(),
}))

vi.mock('../services/rideService', () => ({
  getRideById: mocks.getRideById,
}))

function mountDetail(rideId: string | null) {
  const Harness = defineComponent({
    props: {
      id: { type: String as PropType<string | null>, default: null },
    },
    setup(props) {
      const id = ref<string | null>(props.id)
      return { ...useRideDetail(id), id }
    },
    render: () => null,
  })

  return mount(Harness, { props: { id: rideId } })
}

describe('useRideDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('loads the ride on mount and exposes it', async () => {
    const ride = { id: 'ride-1', title: 'Vuelta por Collserola' } as Ride
    mocks.getRideById.mockResolvedValue(ride)

    const wrapper = mountDetail('ride-1')

    expect(wrapper.vm.isLoading).toBe(true)
    await flushPromises()

    expect(mocks.getRideById).toHaveBeenCalledWith('ride-1')
    expect(wrapper.vm.ride).toEqual(ride)
    expect(wrapper.vm.isLoading).toBe(false)
    expect(wrapper.vm.errorMessage).toBeNull()
  })

  it('reports an invalid identifier without calling the service', async () => {
    const wrapper = mountDetail(null)
    await flushPromises()

    expect(mocks.getRideById).not.toHaveBeenCalled()
    expect(wrapper.vm.errorMessage).toBe('El identificador de la ruta no es válido.')
    expect(wrapper.vm.isLoading).toBe(false)
    expect(wrapper.vm.ride).toBeNull()
  })

  it('explains a failed load with the service message', async () => {
    mocks.getRideById.mockRejectedValue(new Error('No se pudo cargar la ruta: gone'))

    const wrapper = mountDetail('ride-1')
    await flushPromises()

    expect(wrapper.vm.errorMessage).toBe('No se pudo cargar la ruta: gone')
    expect(wrapper.vm.ride).toBeNull()
  })

  it('falls back to a generic message for unknown failures', async () => {
    mocks.getRideById.mockRejectedValue(42)

    const wrapper = mountDetail('ride-1')
    await flushPromises()

    expect(wrapper.vm.errorMessage).toBe('No se ha podido cargar la ruta.')
  })

  it('reloads the ride whenever the identifier changes', async () => {
    mocks.getRideById.mockResolvedValue({ id: 'ride-1' } as Ride)

    const wrapper = mountDetail('ride-1')
    await flushPromises()

    mocks.getRideById.mockResolvedValue({ id: 'ride-2' } as Ride)
    wrapper.vm.id = 'ride-2'
    await flushPromises()

    expect(mocks.getRideById).toHaveBeenLastCalledWith('ride-2')
    expect(wrapper.vm.ride?.id).toBe('ride-2')
  })
})
