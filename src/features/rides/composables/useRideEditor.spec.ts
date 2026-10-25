import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Ride, RideFormSubmission, RideFormValues } from '../types'
import { useRideEditor } from './useRideEditor'
import { MEETING_POINT_ERROR } from '../validators/rideFormValidator'

const mocks = vi.hoisted(() => ({
  push: vi.fn<(location: unknown) => Promise<unknown>>(),
  uploadRideImage: vi.fn<(file: File) => Promise<string>>(),
  deleteRideImage: vi.fn<(path: string) => Promise<void>>(),
  getRideForEdit: vi.fn<(id: string) => Promise<Ride>>(),
  updateRide: vi.fn<(id: string, input: unknown) => Promise<Ride>>(),
}))

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mocks.push }),
}))

vi.mock('../services/rideImageService', () => ({
  uploadRideImage: mocks.uploadRideImage,
  deleteRideImage: mocks.deleteRideImage,
}))

vi.mock('../services/rideService', () => ({
  getRideForEdit: mocks.getRideForEdit,
  updateRide: mocks.updateRide,
}))

function rideOf(overrides: Partial<Ride> = {}): Ride {
  return {
    id: 'ride-1',
    organizerId: 'user-1',
    title: 'Vuelta por Collserola',
    description: 'Recorrido sencillo por pista forestal.',
    startsAt: '2026-06-10T09:30:00.000Z',
    meetingPoint: 'Plaça de l’Església, Barcelona',
    meetingPointDetails: null,
    latitude: 41.4,
    longitude: 2.17,
    bikeType: 'gravel',
    level: 'Intermedio',
    distanceKm: 30,
    elevationM: 300,
    durationMinutes: 120,
    imagePath: 'user-1/antigua.jpg',
    wikilocUrl: null,
    audience: 'everyone',
    maxParticipants: null,
    routeType: null,
    status: 'published',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    imageUrl: 'https://cdn.example/antigua.jpg',
    ...overrides,
  }
}

function formValues(overrides: Partial<RideFormValues> = {}): RideFormValues {
  return {
    title: 'Vuelta por Collserola',
    description: 'Recorrido sencillo por pista forestal.',
    startsAt: '2026-06-10T11:30',
    meetingPoint: 'Plaça de l’Església, Barcelona',
    meetingPointDetails: '',
    latitude: 41.4,
    longitude: 2.17,
    bikeType: 'gravel',
    level: 'Intermedio',
    distanceKm: '30',
    elevationM: '300',
    durationMinutes: '120',
    wikilocUrl: '',
    audience: 'everyone',
    maxParticipants: '',
    isCircular: true,
    ...overrides,
  }
}

function submission(overrides: Partial<RideFormSubmission> = {}): RideFormSubmission {
  return {
    values: formValues(),
    image: null,
    removeCurrentImage: false,
    ...overrides,
  }
}

function mountEditor(rideId: string | null) {
  const Harness = defineComponent({
    setup() {
      return useRideEditor(rideId)
    },
    render: () => null,
  })

  return mount(Harness)
}

describe('useRideEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    mocks.push.mockResolvedValue(undefined)
    mocks.getRideForEdit.mockResolvedValue(rideOf())
    mocks.updateRide.mockImplementation(async (id: string) => ({ id }) as Ride)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('loadRide', () => {
    it('loads the ride on mount and maps the form values', async () => {
      const wrapper = mountEditor('ride-1')
      await flushPromises()

      expect(mocks.getRideForEdit).toHaveBeenCalledWith('ride-1')
      expect(wrapper.vm.ride?.id).toBe('ride-1')
      expect(wrapper.vm.initialValues.title).toBe('Vuelta por Collserola')
      expect(wrapper.vm.initialValues.distanceKm).toBe('30')
      expect(wrapper.vm.isLoading).toBe(false)
    })

    it('reports an invalid identifier without calling the service', async () => {
      const wrapper = mountEditor(null)
      await flushPromises()

      expect(mocks.getRideForEdit).not.toHaveBeenCalled()
      expect(wrapper.vm.errorMessage).toBe('El identificador de la ruta no es válido.')
      expect(wrapper.vm.isLoading).toBe(false)
    })

    it('explains a failed load with a permission-aware message', async () => {
      mocks.getRideForEdit.mockRejectedValue(new Error('denied'))

      const wrapper = mountEditor('ride-1')
      await flushPromises()

      expect(wrapper.vm.errorMessage).toBe(
        'No se ha podido cargar la ruta. Comprueba que existe y que tienes permiso para editarla.',
      )
      expect(wrapper.vm.isLoading).toBe(false)
    })
  })

  describe('saveRide', () => {
    it('updates the ride keeping the current image and navigates back', async () => {
      mocks.getRideForEdit.mockResolvedValue(rideOf({ imagePath: 'user-1/antigua.jpg' }))

      const wrapper = mountEditor('ride-1')
      await flushPromises()

      await wrapper.vm.saveRide(submission())

      expect(mocks.updateRide).toHaveBeenCalledWith(
        'ride-1',
        expect.objectContaining({ imagePath: 'user-1/antigua.jpg' }),
      )
      expect(mocks.deleteRideImage).not.toHaveBeenCalled()
      expect(mocks.push).toHaveBeenCalledWith({ name: 'ride-detail', params: { id: 'ride-1' } })
      expect(wrapper.vm.isSubmitting).toBe(false)
      expect(wrapper.vm.errorMessage).toBeNull()
    })

    it('uploads a new image, saves and only then deletes the previous one', async () => {
      mocks.uploadRideImage.mockResolvedValue('user-1/nueva.jpg')
      mocks.getRideForEdit.mockResolvedValue(rideOf({ imagePath: 'user-1/antigua.jpg' }))

      const wrapper = mountEditor('ride-1')
      await flushPromises()

      await wrapper.vm.saveRide(
        submission({ image: new File(['x'], 'n.png', { type: 'image/png' }) }),
      )

      expect(mocks.updateRide).toHaveBeenCalledWith(
        'ride-1',
        expect.objectContaining({ imagePath: 'user-1/nueva.jpg' }),
      )
      expect(mocks.deleteRideImage).toHaveBeenCalledWith('user-1/antigua.jpg')
    })

    it('clears the image path when the user removes the current image', async () => {
      const wrapper = mountEditor('ride-1')
      await flushPromises()

      await wrapper.vm.saveRide(submission({ removeCurrentImage: true }))

      expect(mocks.updateRide).toHaveBeenCalledWith(
        'ride-1',
        expect.objectContaining({ imagePath: null }),
      )
      expect(mocks.deleteRideImage).toHaveBeenCalledWith('user-1/antigua.jpg')
    })

    it('deletes the new image when the update fails', async () => {
      mocks.uploadRideImage.mockResolvedValue('user-1/nueva.jpg')
      mocks.updateRide.mockRejectedValue(new Error('denied'))

      const wrapper = mountEditor('ride-1')
      await flushPromises()

      await wrapper.vm.saveRide(
        submission({ image: new File(['x'], 'n.png', { type: 'image/png' }) }),
      )

      expect(mocks.deleteRideImage).toHaveBeenCalledWith('user-1/nueva.jpg')
      expect(wrapper.vm.errorMessage).toBe(
        'No se han podido guardar los cambios. Inténtalo de nuevo.',
      )
      expect(wrapper.vm.isSubmitting).toBe(false)
    })

    it('reports a payload without a valid meeting point', async () => {
      const wrapper = mountEditor('ride-1')
      await flushPromises()

      await wrapper.vm.saveRide(submission({ values: formValues({ longitude: null }) }))

      expect(mocks.updateRide).not.toHaveBeenCalled()
      expect(wrapper.vm.errorMessage).toBe(MEETING_POINT_ERROR)
    })

    it('ignores the save when the ride has not been loaded yet', async () => {
      mocks.getRideForEdit.mockRejectedValue(new Error('denied'))

      const wrapper = mountEditor('ride-1')
      await flushPromises()

      await wrapper.vm.saveRide(submission())

      expect(mocks.updateRide).not.toHaveBeenCalled()
      expect(mocks.uploadRideImage).not.toHaveBeenCalled()
    })

    it('falls back to a generic message for unknown update failures', async () => {
      mocks.updateRide.mockRejectedValue('boom')

      const wrapper = mountEditor('ride-1')
      await flushPromises()

      await wrapper.vm.saveRide(submission())

      expect(wrapper.vm.errorMessage).toBe(
        'No se han podido guardar los cambios. Inténtalo de nuevo.',
      )
    })
  })
})
