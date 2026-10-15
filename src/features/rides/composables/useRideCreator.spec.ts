import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Ride, RideFormValues } from '@/features/rides/types'
import { createEmptyRideFormValues } from '@/features/rides/utils/rideFormMapping'
import { useRideCreator } from './useRideCreator'

const mocks = vi.hoisted(() => ({
  createRide: vi.fn<(input: unknown) => Promise<Ride>>(),
  uploadRideImage: vi.fn<(file: File) => Promise<string>>(),
  deleteRideImage: vi.fn<(path: string) => Promise<void>>(),
  push: vi.fn<(location: unknown) => Promise<unknown>>(),
}))

vi.mock('@/features/rides/services/rideService', () => ({
  createRide: mocks.createRide,
}))

vi.mock('@/features/rides/services/rideImageService', () => ({
  uploadRideImage: mocks.uploadRideImage,
  deleteRideImage: mocks.deleteRideImage,
}))

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mocks.push }),
}))

function formValues(overrides: Partial<RideFormValues> = {}): RideFormValues {
  return createEmptyRideFormValues({
    title: 'Ruta a Montserrat',
    description: 'Subida tranquila.',
    startsAt: '2026-06-20T08:00',
    meetingPoint: 'Monistrol de Montserrat',
    latitude: 41.61,
    longitude: 1.84,
    distanceKm: '42',
    elevationM: '900',
    durationMinutes: '180',
    ...overrides,
  })
}

function ride(id: string): Ride {
  return {
    id,
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
    maxParticipants: null,
    status: 'published',
    createdAt: '2026-05-01T10:00:00.000Z',
    updatedAt: '2026-05-01T10:00:00.000Z',
  }
}

describe('useRideCreator', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('creates the ride and redirects to its detail page', async () => {
    mocks.createRide.mockResolvedValue(ride('ride-1'))

    const creator = useRideCreator()
    await creator.createPublishedRide({
      values: formValues(),
      image: null,
      removeCurrentImage: false,
    })

    expect(mocks.createRide).toHaveBeenCalledTimes(1)
    expect(mocks.push).toHaveBeenCalledWith({ name: 'ride-detail', params: { id: 'ride-1' } })
    expect(creator.errorMessage.value).toBeNull()
    expect(creator.isSubmitting.value).toBe(false)
  })

  it('refuses to create without a valid meeting point', async () => {
    const creator = useRideCreator()
    await creator.createPublishedRide({
      values: formValues({ latitude: null, longitude: null }),
      image: null,
      removeCurrentImage: false,
    })

    expect(mocks.createRide).not.toHaveBeenCalled()
    expect(creator.errorMessage.value).toBe('Selecciona un punto de encuentro válido.')
  })

  it('uploads the image and cleans it up when the ride is not created', async () => {
    const file = new File(['contenido'], 'foto.jpg', { type: 'image/jpeg' })
    mocks.uploadRideImage.mockResolvedValue('rides/foto.jpg')
    mocks.createRide.mockRejectedValue(new Error('Sin permisos'))

    const creator = useRideCreator()
    await creator.createPublishedRide({
      values: formValues(),
      image: file,
      removeCurrentImage: false,
    })

    expect(mocks.deleteRideImage).toHaveBeenCalledWith('rides/foto.jpg')
    expect(creator.errorMessage.value).toBe('Sin permisos')
  })

  it('keeps the image when the ride was created but the redirect failed', async () => {
    const file = new File(['contenido'], 'foto.jpg', { type: 'image/jpeg' })
    mocks.uploadRideImage.mockResolvedValue('rides/foto.jpg')
    mocks.createRide.mockResolvedValue(ride('ride-1'))
    mocks.push.mockRejectedValue(new Error('navegación caída'))

    const creator = useRideCreator()
    await creator.createPublishedRide({
      values: formValues(),
      image: file,
      removeCurrentImage: false,
    })

    expect(mocks.deleteRideImage).not.toHaveBeenCalled()
    expect(creator.errorMessage.value).toBe(
      'La ruta se ha publicado, pero no se ha podido abrir su página.',
    )
  })
})
