import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { CreateRideInput, UpdateRideInput } from '../types'

interface SupabaseResult {
  data: unknown
  error: { message: string } | null
}

const mocks = vi.hoisted(() => ({
  getUser: vi.fn<() => Promise<{ data: { user: { id: string } | null }; error: null }>>(),
  from: vi.fn<(table: string) => QueryChain>(),
  rpc: vi.fn<() => Promise<SupabaseResult>>(),
  getPublicUrl: vi.fn<(path: string) => { data: { publicUrl: string } }>(),
}))

vi.mock('@/services/supabase', () => ({
  supabase: {
    auth: { getUser: mocks.getUser },
    from: mocks.from,
    rpc: mocks.rpc,
    storage: {
      from: vi.fn<() => { getPublicUrl: typeof mocks.getPublicUrl }>(() => ({
        getPublicUrl: mocks.getPublicUrl,
      })),
    },
  },
}))

import {
  createRide,
  deleteRide,
  getMyParticipatingRideIds,
  getMyRides,
  getPublishedRides,
  getRideById,
  getRideForEdit,
  getRideParticipantCount,
  getRideParticipants,
  joinRide,
  leaveRide,
  updateRide,
} from './rideService'

/** Cadena consultable que devuelve el resultado al esperarse (single, maybeSingle o await). */
interface QueryChain {
  select: () => QueryChainBase
  eq: () => QueryChainBase
  in: () => QueryChainBase
  order: () => QueryChainBase
  insert: () => QueryChainBase
  update: () => QueryChainBase
  delete: () => QueryChainBase
  single: () => Promise<SupabaseResult>
  maybeSingle: () => Promise<SupabaseResult>
  then: (
    onFulfilled?: (value: SupabaseResult) => unknown,
    onRejected?: (reason: unknown) => unknown,
  ) => Promise<unknown>
}

type QueryChainBase = Omit<QueryChain, 'then'>

function createQueryChain(result: SupabaseResult): QueryChain {
  const chain: QueryChainBase = {
    select: vi.fn<() => QueryChainBase>(() => chain),
    eq: vi.fn<() => QueryChainBase>(() => chain),
    in: vi.fn<() => QueryChainBase>(() => chain),
    order: vi.fn<() => QueryChainBase>(() => chain),
    insert: vi.fn<() => QueryChainBase>(() => chain),
    update: vi.fn<() => QueryChainBase>(() => chain),
    delete: vi.fn<() => QueryChainBase>(() => chain),
    single: vi.fn<() => Promise<SupabaseResult>>(() => Promise.resolve(result)),
    maybeSingle: vi.fn<() => Promise<SupabaseResult>>(() => Promise.resolve(result)),
  }

  // El builder de Supabase real es "thenable" (los servicios hacen `await
  // supabase.from(...).insert(...)` sin `.single()`), así que el doble debe
  // reproducir ese contrato. La supresión es local y justificada.
  return Object.assign(chain, {
    // oxlint-disable-next-line unicorn/no-thenable
    then: (
      onFulfilled?: (value: SupabaseResult) => unknown,
      onRejected?: (reason: unknown) => unknown,
    ): Promise<unknown> => Promise.resolve(result).then(onFulfilled, onRejected),
  })
}

function rideRow(overrides: Partial<Record<string, unknown>> = {}): Record<string, unknown> {
  return {
    id: 'ride-1',
    organizer_id: 'user-1',
    title: 'Vuelta por Collserola',
    description: 'Recorrido sencillo por pista forestal.',
    starts_at: '2026-06-10T09:30:00.000Z',
    meeting_point: 'Plaça de l’Església, Barcelona',
    meeting_point_details: null,
    latitude: 41.4,
    longitude: 2.17,
    bike_type: 'gravel',
    level: 'Intermedio',
    distance_km: 30,
    elevation_m: 300,
    duration_minutes: 120,
    image_path: null,
    wikiloc_url: null,
    audience: 'everyone',
    max_participants: null,
    route_type: null,
    status: 'published',
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-02T00:00:00.000Z',
    ...overrides,
  }
}

function createInput(overrides: Partial<CreateRideInput> = {}): CreateRideInput {
  return {
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
    imagePath: null,
    wikilocUrl: null,
    audience: 'everyone',
    maxParticipants: null,
    routeType: 'circular',
    status: 'published',
    ...overrides,
  }
}

function authenticatedAs(id = 'user-1'): void {
  mocks.getUser.mockResolvedValue({ data: { user: { id } }, error: null })
}

function anonymous(): void {
  mocks.getUser.mockResolvedValue({ data: { user: null }, error: null })
}

/** Reparte las consultas: el rol sale de `profiles` y las rutas de su cadena. */
function mockRole(role: 'admin' | 'user'): QueryChain {
  const profiles = createQueryChain({ data: { role }, error: null })
  const rides = createQueryChain({ data: rideRow(), error: null })
  mocks.from.mockImplementation((table) => (table === 'profiles' ? profiles : rides))
  return rides
}

describe('rideService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    authenticatedAs()
    mocks.rpc.mockResolvedValue({ data: null, error: null })
    mocks.getPublicUrl.mockImplementation((path: string) => ({
      data: { publicUrl: `https://cdn.example/ride-images/${path}` },
    }))
  })

  describe('createRide', () => {
    it('inserts the snake_case payload owned by the signed-in user and maps it back', async () => {
      const chain = createQueryChain({ data: rideRow(), error: null })
      mocks.from.mockReturnValue(chain)

      const ride = await createRide(createInput({ imagePath: 'user-1/portada.jpg' }))

      expect(mocks.from).toHaveBeenCalledWith('rides')
      expect(chain.insert).toHaveBeenCalledWith({
        organizer_id: 'user-1',
        title: 'Vuelta por Collserola',
        description: 'Recorrido sencillo por pista forestal.',
        starts_at: '2026-06-10T09:30:00.000Z',
        meeting_point: 'Plaça de l’Església, Barcelona',
        meeting_point_details: null,
        latitude: 41.4,
        longitude: 2.17,
        bike_type: 'gravel',
        level: 'Intermedio',
        distance_km: 30,
        elevation_m: 300,
        duration_minutes: 120,
        image_path: 'user-1/portada.jpg',
        wikiloc_url: null,
        audience: 'everyone',
        max_participants: null,
        route_type: 'circular',
        status: 'published',
      })
      expect(chain.single).toHaveBeenCalled()
      expect(mocks.rpc).toHaveBeenCalledWith('join_ride', { p_ride_id: 'ride-1' })
      expect(ride).toMatchObject({
        id: 'ride-1',
        organizerId: 'user-1',
        bikeType: 'gravel',
        level: 'Intermedio',
        imageUrl: null,
      })
    })

    it('still returns the created ride when the organizer enrollment fails', async () => {
      const chain = createQueryChain({ data: rideRow(), error: null })
      mocks.from.mockReturnValue(chain)
      mocks.rpc.mockResolvedValueOnce({ data: null, error: { message: 'denied' } })

      const ride = await createRide(createInput())

      expect(ride.id).toBe('ride-1')
    })

    it('builds the public image url when the ride has an image path', async () => {
      const chain = createQueryChain({
        data: rideRow({ image_path: 'user-1/portada.jpg' }),
        error: null,
      })
      mocks.from.mockReturnValue(chain)

      const ride = await createRide(createInput())

      expect(ride.imageUrl).toBe('https://cdn.example/ride-images/user-1/portada.jpg')
    })

    it('requires an authenticated user', async () => {
      anonymous()

      await expect(createRide(createInput())).rejects.toThrow(
        'Debes iniciar sesión para publicar una ruta.',
      )
      expect(mocks.from).not.toHaveBeenCalled()
    })

    it('wraps insertion errors with a user-facing message', async () => {
      mocks.from.mockReturnValue(createQueryChain({ data: null, error: { message: 'denied' } }))

      await expect(createRide(createInput())).rejects.toThrow(
        'No se ha podido crear la ruta. Inténtalo de nuevo.',
      )
    })

    it('rejects rows whose domain values fall outside the known unions', async () => {
      mocks.from.mockReturnValue(
        createQueryChain({ data: rideRow({ level: 'Legendario' }), error: null }),
      )

      await expect(createRide(createInput())).rejects.toThrow(
        'La ruta contiene valores no válidos.',
      )
    })
  })

  describe('getPublishedRides', () => {
    it('queries published rides ordered by departure and maps every row', async () => {
      const chain = createQueryChain({
        data: [rideRow({ id: 'ride-1' }), rideRow({ id: 'ride-2' })],
        error: null,
      })
      mocks.from.mockReturnValue(chain)

      const rides = await getPublishedRides()

      expect(chain.select).toHaveBeenCalledWith('*')
      expect(chain.eq).toHaveBeenCalledWith('status', 'published')
      expect(chain.order).toHaveBeenCalledWith('starts_at', { ascending: true })
      expect(rides.map((ride) => ride.id)).toEqual(['ride-1', 'ride-2'])
    })

    it('wraps query errors with a user-facing message', async () => {
      mocks.from.mockReturnValue(createQueryChain({ data: null, error: { message: 'offline' } }))

      await expect(getPublishedRides()).rejects.toThrow(
        'No se han podido cargar las rutas. Inténtalo de nuevo.',
      )
    })
  })

  describe('getRideById', () => {
    it('filters by id and published status and returns a single ride', async () => {
      const chain = createQueryChain({ data: rideRow(), error: null })
      mocks.from.mockReturnValue(chain)

      const ride = await getRideById('ride-1')

      expect(chain.eq).toHaveBeenCalledWith('id', 'ride-1')
      expect(chain.eq).toHaveBeenCalledWith('status', 'published')
      expect(chain.single).toHaveBeenCalled()
      expect(ride.id).toBe('ride-1')
    })

    it('wraps query errors with a user-facing message', async () => {
      mocks.from.mockReturnValue(createQueryChain({ data: null, error: { message: 'gone' } }))

      await expect(getRideById('ride-1')).rejects.toThrow(
        'No se ha podido cargar la ruta. Inténtalo de nuevo.',
      )
    })
  })

  describe('getRideForEdit', () => {
    it('filters by ownership and requires the row to exist', async () => {
      const chain = createQueryChain({ data: rideRow(), error: null })
      mocks.from.mockReturnValue(chain)

      const ride = await getRideForEdit('ride-1')

      expect(chain.eq).toHaveBeenCalledWith('id', 'ride-1')
      expect(chain.eq).toHaveBeenCalledWith('organizer_id', 'user-1')
      expect(chain.maybeSingle).toHaveBeenCalled()
      expect(ride.organizerId).toBe('user-1')
    })

    it('lets the admin open any ride without the ownership filter', async () => {
      const rides = mockRole('admin')

      const ride = await getRideForEdit('ride-1')

      expect(rides.eq).toHaveBeenCalledWith('id', 'ride-1')
      expect(rides.eq).not.toHaveBeenCalledWith('organizer_id', 'user-1')
      expect(ride.organizerId).toBe('user-1')
    })

    it('requires an authenticated user', async () => {
      anonymous()

      await expect(getRideForEdit('ride-1')).rejects.toThrow(
        'Debes iniciar sesión para editar una ruta.',
      )
    })

    it('reports a missing or foreign ride', async () => {
      mocks.from.mockReturnValue(createQueryChain({ data: null, error: null }))

      await expect(getRideForEdit('ride-1')).rejects.toThrow(
        'La ruta no existe o no tienes permiso para editarla.',
      )
    })

    it('wraps query errors with a user-facing message', async () => {
      mocks.from.mockReturnValue(createQueryChain({ data: null, error: { message: 'denied' } }))

      await expect(getRideForEdit('ride-1')).rejects.toThrow(
        'No se ha podido cargar la ruta. Inténtalo de nuevo.',
      )
    })
  })

  describe('getMyRides', () => {
    it('queries the rides of the signed-in organizer, skipping drafts', async () => {
      const chain = createQueryChain({ data: [rideRow()], error: null })
      mocks.from.mockReturnValue(chain)

      const rides = await getMyRides()

      expect(chain.eq).toHaveBeenCalledWith('organizer_id', 'user-1')
      expect(chain.in).toHaveBeenCalledWith('status', ['published', 'completed', 'cancelled'])
      expect(rides).toHaveLength(1)
    })

    it('requires an authenticated user', async () => {
      anonymous()

      await expect(getMyRides()).rejects.toThrow('Debes iniciar sesión para consultar tus rutas.')
    })

    it('wraps query errors with a user-facing message', async () => {
      mocks.from.mockReturnValue(createQueryChain({ data: null, error: { message: 'offline' } }))

      await expect(getMyRides()).rejects.toThrow(
        'No se han podido cargar tus rutas. Inténtalo de nuevo.',
      )
    })
  })

  describe('deleteRide', () => {
    it('deletes only rides owned by the signed-in user', async () => {
      const chain = createQueryChain({ data: { id: 'ride-1' }, error: null })
      mocks.from.mockReturnValue(chain)

      await deleteRide('ride-1')

      expect(chain.delete).toHaveBeenCalled()
      expect(chain.eq).toHaveBeenCalledWith('id', 'ride-1')
      expect(chain.eq).toHaveBeenCalledWith('organizer_id', 'user-1')
      expect(chain.select).toHaveBeenCalledWith('id')
    })

    it('requires an authenticated user', async () => {
      anonymous()

      await expect(deleteRide('ride-1')).rejects.toThrow(
        'Debes iniciar sesión para eliminar una ruta.',
      )
    })

    it('reports a missing or foreign ride', async () => {
      mocks.from.mockReturnValue(createQueryChain({ data: null, error: null }))

      await expect(deleteRide('ride-1')).rejects.toThrow(
        'La ruta no existe o no tienes permiso para eliminarla.',
      )
    })

    it('wraps query errors with a user-facing message', async () => {
      mocks.from.mockReturnValue(createQueryChain({ data: null, error: { message: 'denied' } }))

      await expect(deleteRide('ride-1')).rejects.toThrow(
        'No se ha podido eliminar la ruta. Inténtalo de nuevo.',
      )
    })
  })

  describe('updateRide', () => {
    const input: UpdateRideInput = {
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
      imagePath: null,
      wikilocUrl: null,
      audience: 'everyone',
      maxParticipants: null,
      routeType: 'circular',
    }

    it('updates the owned ride and maps the returned row', async () => {
      const chain = createQueryChain({ data: rideRow(), error: null })
      mocks.from.mockReturnValue(chain)

      const ride = await updateRide('ride-1', input)

      expect(chain.update).toHaveBeenCalledWith({
        title: 'Vuelta por Collserola',
        description: 'Recorrido sencillo por pista forestal.',
        starts_at: '2026-06-10T09:30:00.000Z',
        meeting_point: 'Plaça de l’Església, Barcelona',
        meeting_point_details: null,
        latitude: 41.4,
        longitude: 2.17,
        bike_type: 'gravel',
        level: 'Intermedio',
        distance_km: 30,
        elevation_m: 300,
        duration_minutes: 120,
        image_path: null,
        wikiloc_url: null,
        audience: 'everyone',
        max_participants: null,
        route_type: 'circular',
      })
      expect(chain.eq).toHaveBeenCalledWith('organizer_id', 'user-1')
      expect(ride.id).toBe('ride-1')
    })

    it('lets the admin save a foreign ride', async () => {
      const rides = mockRole('admin')

      const ride = await updateRide('ride-1', input)

      expect(rides.update).toHaveBeenCalled()
      expect(rides.eq).toHaveBeenCalledWith('id', 'ride-1')
      expect(rides.eq).not.toHaveBeenCalledWith('organizer_id', 'user-1')
      expect(ride.id).toBe('ride-1')
    })

    it('requires an authenticated user', async () => {
      anonymous()

      await expect(updateRide('ride-1', input)).rejects.toThrow(
        'Debes iniciar sesión para editar una ruta.',
      )
    })

    it('reports a missing or foreign ride', async () => {
      mocks.from.mockReturnValue(createQueryChain({ data: null, error: null }))

      await expect(updateRide('ride-1', input)).rejects.toThrow(
        'La ruta no existe o no tienes permiso para editarla.',
      )
    })

    it('wraps query errors with a user-facing message', async () => {
      mocks.from.mockReturnValue(createQueryChain({ data: null, error: { message: 'denied' } }))

      await expect(updateRide('ride-1', input)).rejects.toThrow(
        'No se han podido guardar los cambios. Inténtalo de nuevo.',
      )
    })
  })

  describe('getRideParticipants', () => {
    it('joins the participant profiles and marks the organizer', async () => {
      const chain = createQueryChain({
        data: [
          {
            user_id: 'user-1',
            profiles: { id: 'user-1', display_name: 'Cristiana', avatar_url: null },
          },
          {
            user_id: 'user-2',
            profiles: { id: 'user-2', display_name: 'Marc', avatar_url: 'a.png' },
          },
        ],
        error: null,
      })
      mocks.from.mockReturnValue(chain)

      const participants = await getRideParticipants('ride-1', 'user-1')

      expect(mocks.from).toHaveBeenCalledWith('ride_participants')
      expect(chain.eq).toHaveBeenCalledWith('ride_id', 'ride-1')
      expect(chain.order).toHaveBeenCalledWith('joined_at', { ascending: true })
      expect(participants).toEqual([
        { id: 'user-1', displayName: 'Cristiana', avatarUrl: null, isOrganizer: true },
        { id: 'user-2', displayName: 'Marc', avatarUrl: 'a.png', isOrganizer: false },
      ])
    })

    it('throws when a participant profile could not be fetched', async () => {
      mocks.from.mockReturnValue(
        createQueryChain({ data: [{ user_id: 'x', profiles: null }], error: null }),
      )

      await expect(getRideParticipants('ride-1', 'user-1')).rejects.toThrow(
        'No se ha podido recuperar el perfil de un participante.',
      )
    })

    it('wraps query errors with a user-facing message', async () => {
      mocks.from.mockReturnValue(createQueryChain({ data: null, error: { message: 'offline' } }))

      await expect(getRideParticipants('ride-1', 'user-1')).rejects.toThrow(
        'No se han podido cargar los participantes. Inténtalo de nuevo.',
      )
    })
  })

  describe('getRideParticipantCount', () => {
    it('reads the count from the rpc and coerces it to a number', async () => {
      mocks.rpc.mockResolvedValue({ data: '4', error: null })

      await expect(getRideParticipantCount('ride-1')).resolves.toBe(4)
      expect(mocks.rpc).toHaveBeenCalledWith('get_ride_participant_count', { p_ride_id: 'ride-1' })
    })

    it('wraps rpc errors with a user-facing message', async () => {
      mocks.rpc.mockResolvedValue({ data: null, error: { message: 'offline' } })

      await expect(getRideParticipantCount('ride-1')).rejects.toThrow(
        'No se ha podido cargar el número de participantes. Inténtalo de nuevo.',
      )
    })
  })

  describe('getMyParticipatingRideIds', () => {
    it('returns the ride ids the signed-in user joined', async () => {
      const chain = createQueryChain({ data: [{ ride_id: 'ride-9' }], error: null })
      mocks.from.mockReturnValue(chain)

      const ids = await getMyParticipatingRideIds()

      expect(mocks.from).toHaveBeenCalledWith('ride_participants')
      expect(chain.eq).toHaveBeenCalledWith('user_id', 'user-1')
      expect(ids).toEqual(['ride-9'])
    })

    it('returns an empty list without a session', async () => {
      anonymous()

      await expect(getMyParticipatingRideIds()).resolves.toEqual([])
      expect(mocks.from).not.toHaveBeenCalled()
    })

    it('wraps query errors with a user-facing message', async () => {
      mocks.from.mockReturnValue(createQueryChain({ data: null, error: { message: 'offline' } }))

      await expect(getMyParticipatingRideIds()).rejects.toThrow(
        'No se han podido cargar tus inscripciones. Inténtalo de nuevo.',
      )
    })
  })

  describe('joinRide', () => {
    it('calls the join rpc with the ride id', async () => {
      mocks.rpc.mockResolvedValue({ data: null, error: null })

      await joinRide('ride-1')

      expect(mocks.rpc).toHaveBeenCalledWith('join_ride', { p_ride_id: 'ride-1' })
    })

    it('wraps the rpc error with a user-facing message', async () => {
      const error = { message: 'full', code: 'P0001' }
      mocks.rpc.mockResolvedValue({ data: null, error })

      await expect(joinRide('ride-1')).rejects.toThrow(
        'No se ha podido completar la inscripción. Inténtalo de nuevo.',
      )
    })
  })

  describe('leaveRide', () => {
    it('calls the leave rpc with the ride id', async () => {
      mocks.rpc.mockResolvedValue({ data: null, error: null })

      await leaveRide('ride-1')

      expect(mocks.rpc).toHaveBeenCalledWith('leave_ride', { p_ride_id: 'ride-1' })
    })

    it('wraps rpc errors with a user-facing message', async () => {
      mocks.rpc.mockResolvedValue({ data: null, error: { message: 'not found' } })

      await expect(leaveRide('ride-1')).rejects.toThrow(
        'No se ha podido cancelar la inscripción. Inténtalo de nuevo.',
      )
    })
  })
})
