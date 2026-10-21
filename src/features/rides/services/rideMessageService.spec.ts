import { beforeEach, describe, expect, it, vi } from 'vitest'

interface Result {
  data: unknown
  error: { message: string } | null
}

const mocks = vi.hoisted(() => ({
  getUser: vi.fn<() => Promise<{ data: { user: { id: string } | null }; error: null }>>(),
  from: vi.fn<(table: string) => ReturnType<typeof chain>>(),
}))

vi.mock('@/services/supabase', () => ({
  supabase: { auth: { getUser: mocks.getUser }, from: mocks.from },
}))

import { createRideMessage, getRideMessages } from './rideMessageService'

function chain(result: Result) {
  const base = {
    select: vi.fn(() => base),
    eq: vi.fn(() => base),
    order: vi.fn(() => Promise.resolve(result)),
    insert: vi.fn(() => base),
    single: vi.fn(() => Promise.resolve(result)),
    then: (
      onFulfilled?: (value: Result) => unknown,
      onRejected?: (reason: unknown) => unknown,
    ) => Promise.resolve(result).then(onFulfilled, onRejected),
  }
  return base
}

const row = {
  id: 'msg-1',
  ride_id: 'ride-1',
  content: '¡Nos vemos allí!',
  created_at: '2026-06-01T10:00:00.000Z',
  author: { id: 'user-1', display_name: 'Marc', avatar_url: null },
}

describe('rideMessageService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null })
  })

  it('lists ride messages in chronological order', async () => {
    mocks.from.mockReturnValue(chain({ data: [row], error: null }))

    const messages = await getRideMessages('ride-1')

    expect(mocks.from).toHaveBeenCalledWith('ride_messages')
    expect(messages).toEqual([
      {
        id: 'msg-1',
        rideId: 'ride-1',
        content: '¡Nos vemos allí!',
        createdAt: '2026-06-01T10:00:00.000Z',
        author: { id: 'user-1', displayName: 'Marc', avatarUrl: null },
      },
    ])
  })

  it('wraps list errors with a user-facing message', async () => {
    mocks.from.mockReturnValue(chain({ data: null, error: { message: 'denied' } }))

    await expect(getRideMessages('ride-1')).rejects.toThrow(
      'No se pudieron cargar los comentarios: denied',
    )
  })

  it('inserts a trimmed comment owned by the signed-in user', async () => {
    const c = chain({ data: row, error: null })
    mocks.from.mockReturnValue(c)

    const message = await createRideMessage('ride-1', '  ¡Hola!  ')

    expect(c.insert).toHaveBeenCalledWith({
      ride_id: 'ride-1',
      author_id: 'user-1',
      content: '¡Hola!',
    })
    expect(message.author.displayName).toBe('Marc')
  })

  it('strips html tags and enforces the max length', async () => {
    const c = chain({ data: row, error: null })
    mocks.from.mockReturnValue(c)

    await createRideMessage('ride-1', '<b>Saludo</b>')

    expect(c.insert).toHaveBeenCalledWith(
      expect.objectContaining({ content: 'Saludo' }),
    )

    await expect(createRideMessage('ride-1', 'a'.repeat(1001))).rejects.toThrow(
      'El comentario no puede superar los 1000 caracteres.',
    )
  })

  it('requires an authenticated user and a non-empty comment', async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null }, error: null })
    await expect(createRideMessage('ride-1', 'hola')).rejects.toThrow(
      'Debes iniciar sesión para comentar.',
    )

    mocks.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null })
    await expect(createRideMessage('ride-1', '   ')).rejects.toThrow(
      'El comentario no puede estar vacío.',
    )
  })
})
