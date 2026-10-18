import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Ride, RideFormSubmission, RideFormValues } from '../types'
import { useRideCreator } from './useRideCreator'

const mocks = vi.hoisted(() => ({
  push: vi.fn<(location: unknown) => Promise<unknown>>(),
  uploadRideImage: vi.fn<(file: File) => Promise<string>>(),
  deleteRideImage: vi.fn<(path: string) => Promise<void>>(),
  createRide: vi.fn<(input: unknown) => Promise<Ride>>(),
}))

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mocks.push }),
}))

vi.mock('../services/rideImageService', () => ({
  uploadRideImage: mocks.uploadRideImage,
  deleteRideImage: mocks.deleteRideImage,
}))

vi.mock('../services/rideService', () => ({
  createRide: mocks.createRide,
}))

function formValues(overrides: Partial<RideFormValues> = {}): RideFormValues {
  return {
    title: 'Vuelta por Collserola',
    description: 'Recorrido sencillo por pista forestal.',
    startsAt: '2026-06-10T11:30',
    meetingPoint: 'Plaça de l’Església, Barcelona',
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

describe('useRideCreator', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.push.mockResolvedValue(undefined)
    mocks.createRide.mockResolvedValue({ id: 'ride-nueva' } as Ride)
  })

  it('creates a published ride and navigates to its detail page', async () => {
    const { createPublishedRide, isSubmitting, errorMessage } = useRideCreator()

    await createPublishedRide(submission())

    expect(mocks.createRide).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Vuelta por Collserola',
        latitude: 41.4,
        status: 'published',
        imagePath: null,
      }),
    )
    expect(mocks.push).toHaveBeenCalledWith({ name: 'ride-detail', params: { id: 'ride-nueva' } })
    expect(errorMessage.value).toBeNull()
    expect(isSubmitting.value).toBe(false)
  })

  it('uploads the selected image and attaches its path to the ride', async () => {
    mocks.uploadRideImage.mockResolvedValue('user-1/portada.jpg')

    const { createPublishedRide } = useRideCreator()

    await createPublishedRide(submission({ image: new File(['x'], 'p.png', { type: 'image/png' }) }))

    expect(mocks.uploadRideImage).toHaveBeenCalledTimes(1)
    expect(mocks.createRide).toHaveBeenCalledWith(expect.objectContaining({ imagePath: 'user-1/portada.jpg' }))
  })

  it('rejects a payload without a valid meeting point before touching the services', async () => {
    const { createPublishedRide, errorMessage } = useRideCreator()

    await createPublishedRide(submission({ values: formValues({ latitude: null }) }))

    expect(errorMessage.value).toBe('Selecciona un punto de encuentro válido.')
    expect(mocks.uploadRideImage).not.toHaveBeenCalled()
    expect(mocks.createRide).not.toHaveBeenCalled()
  })

  it('deletes the uploaded image when the ride could not be created', async () => {
    mocks.uploadRideImage.mockResolvedValue('user-1/portada.jpg')
    mocks.createRide.mockRejectedValue(new Error('No se pudo crear la ruta: denied'))
    vi.spyOn(console, 'error').mockImplementation(() => undefined)

    const { createPublishedRide, errorMessage } = useRideCreator()

    await createPublishedRide(submission({ image: new File(['x'], 'p.png', { type: 'image/png' }) }))

    expect(mocks.deleteRideImage).toHaveBeenCalledWith('user-1/portada.jpg')
    expect(errorMessage.value).toBe('No se pudo crear la ruta: denied')
  })

  it('keeps the uploaded image when only the navigation fails', async () => {
    mocks.uploadRideImage.mockResolvedValue('user-1/portada.jpg')
    mocks.push.mockRejectedValue(new Error('navigation failed'))

    const { createPublishedRide, errorMessage } = useRideCreator()

    await createPublishedRide(submission({ image: new File(['x'], 'p.png', { type: 'image/png' }) }))

    expect(mocks.deleteRideImage).not.toHaveBeenCalled()
    expect(errorMessage.value).toBe(
      'La ruta se ha publicado, pero no se ha podido abrir su página.',
    )
  })

  it('falls back to a generic message for unknown creation failures', async () => {
    mocks.createRide.mockRejectedValue('boom')

    const { createPublishedRide, errorMessage } = useRideCreator()

    await createPublishedRide(submission())

    expect(errorMessage.value).toBe('No se ha podido publicar la ruta.')
  })

  it('ignores a new submission while another one is in flight', async () => {
    let release!: (ride: Ride) => void
    mocks.createRide.mockReturnValue(new Promise<Ride>((resolve) => (release = resolve)))

    const { createPublishedRide, isSubmitting } = useRideCreator()

    const first = createPublishedRide(submission())
    await createPublishedRide(submission())

    expect(mocks.createRide).toHaveBeenCalledTimes(1)
    expect(isSubmitting.value).toBe(true)

    release({ id: 'ride-nueva' } as Ride)
    await first
    expect(isSubmitting.value).toBe(false)
  })

  it('swallows a failed orphan-image cleanup without masking the main error', async () => {
    mocks.uploadRideImage.mockResolvedValue('user-1/portada.jpg')
    mocks.createRide.mockRejectedValue(new Error('No se pudo crear la ruta: denied'))
    mocks.deleteRideImage.mockRejectedValue(new Error('storage down'))

    const { createPublishedRide, errorMessage } = useRideCreator()

    await createPublishedRide(submission({ image: new File(['x'], 'p.png', { type: 'image/png' }) }))

    expect(mocks.deleteRideImage).toHaveBeenCalledWith('user-1/portada.jpg')
    expect(errorMessage.value).toBe('No se pudo crear la ruta: denied')
  })
})
