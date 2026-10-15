import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Ride } from '@/features/rides/types'
import { createEmptyRideFormValues } from '@/features/rides/utils/rideFormMapping'
import { useRideEditor } from './useRideEditor'

const mocks = vi.hoisted(() => ({
  getRideForEdit: vi.fn<(id: string) => Promise<Ride>>(),
  updateRide: vi.fn<(id: string, input: unknown) => Promise<void>>(),
  uploadRideImage: vi.fn<(file: File) => Promise<string>>(),
  deleteRideImage: vi.fn<(path: string) => Promise<void>>(),
  push: vi.fn<(location: unknown) => Promise<unknown>>(),
}))

vi.mock('@/features/rides/services/rideService', () => ({
  getRideForEdit: mocks.getRideForEdit,
  updateRide: mocks.updateRide,
}))

vi.mock('@/features/rides/services/rideImageService', () => ({
  uploadRideImage: mocks.uploadRideImage,
  deleteRideImage: mocks.deleteRideImage,
}))

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mocks.push }),
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
    imagePath: 'rides/antigua.jpg',
    wikilocUrl: null,
    audience: 'everyone',
    maxParticipants: null,
    status: 'published',
    createdAt: '2026-05-01T10:00:00.000Z',
    updatedAt: '2026-05-01T10:00:00.000Z',
    ...overrides,
  }
}

function mountEditor(rideId: string | null) {
  const Harness = defineComponent({
    setup() {
      const editor = useRideEditor(rideId)
      return { editor }
    },
    render: () => null,
  })

  return mount(Harness)
}

describe('useRideEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('loads the ride on mount and maps it to form values', async () => {
    mocks.getRideForEdit.mockResolvedValue(ride())

    const wrapper = mountEditor('ride-1')
    await flushPromises()

    expect(mocks.getRideForEdit).toHaveBeenCalledWith('ride-1')
    expect(wrapper.vm.editor.ride.value).toEqual(ride())
    expect(wrapper.vm.editor.initialValues.value.title).toBe('Ruta a Montserrat')
    expect(wrapper.vm.editor.isLoading.value).toBe(false)
  })

  it('reports an invalid identifier without calling the service', async () => {
    const wrapper = mountEditor(null)
    await flushPromises()

    expect(mocks.getRideForEdit).not.toHaveBeenCalled()
    expect(wrapper.vm.editor.errorMessage.value).toBe('El identificador de la ruta no es válido.')
  })

  it('saves the changes and deletes the previous image when it changed', async () => {
    mocks.getRideForEdit.mockResolvedValue(ride())
    mocks.updateRide.mockResolvedValue(undefined)

    const wrapper = mountEditor('ride-1')
    await flushPromises()

    const file = new File(['nueva'], 'nueva.jpg', { type: 'image/jpeg' })
    mocks.uploadRideImage.mockResolvedValue('rides/nueva.jpg')

    await wrapper.vm.editor.saveRide({
      values: createEmptyRideFormValues({
        title: 'Ruta actualizada',
        startsAt: '2026-06-20T08:00',
        meetingPoint: 'Monistrol de Montserrat',
        latitude: 41.61,
        longitude: 1.84,
      }),
      image: file,
      removeCurrentImage: false,
    })

    expect(mocks.updateRide).toHaveBeenCalledTimes(1)
    expect(mocks.deleteRideImage).toHaveBeenCalledWith('rides/antigua.jpg')
    expect(mocks.push).toHaveBeenCalledWith({ name: 'ride-detail', params: { id: 'ride-1' } })
    expect(wrapper.vm.editor.errorMessage.value).toBeNull()
  })

  it('keeps the previous image when the update fails and deletes the new one', async () => {
    mocks.getRideForEdit.mockResolvedValue(ride())
    mocks.uploadRideImage.mockResolvedValue('rides/nueva.jpg')
    mocks.updateRide.mockRejectedValue(new Error('Sin permisos'))

    const wrapper = mountEditor('ride-1')
    await flushPromises()

    const file = new File(['nueva'], 'nueva.jpg', { type: 'image/jpeg' })

    await wrapper.vm.editor.saveRide({
      values: createEmptyRideFormValues({
        title: 'Ruta actualizada',
        startsAt: '2026-06-20T08:00',
        meetingPoint: 'Monistrol de Montserrat',
        latitude: 41.61,
        longitude: 1.84,
      }),
      image: file,
      removeCurrentImage: false,
    })

    expect(mocks.deleteRideImage).toHaveBeenCalledTimes(1)
    expect(mocks.deleteRideImage).toHaveBeenCalledWith('rides/nueva.jpg')
    expect(wrapper.vm.editor.errorMessage.value).toBe(
      'No se han podido guardar los cambios. Inténtalo de nuevo.',
    )
    expect(wrapper.vm.editor.isSubmitting.value).toBe(false)
  })
})
