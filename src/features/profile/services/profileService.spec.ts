import { beforeEach, describe, expect, it, vi } from 'vitest'

interface SupabaseResult {
  data: unknown
  error: { message: string } | null
}

interface AuthUser {
  id: string
  user_metadata: Record<string, unknown>
}

const mocks = vi.hoisted(() => ({
  getUser: vi.fn<() => Promise<{ data: { user: AuthUser | null }; error: null }>>(),
  updateUser: vi.fn<() => Promise<{ error: { message: string } | null }>>(),
  from: vi.fn<(table: string) => QueryChain>(),
  upload: vi.fn<() => Promise<SupabaseResult>>(),
  getPublicUrl: vi.fn<(path: string) => { data: { publicUrl: string } }>(),
}))

vi.mock('@/services/supabase', () => ({
  supabase: {
    auth: { getUser: mocks.getUser, updateUser: mocks.updateUser },
    from: mocks.from,
    storage: {
      from: vi.fn<() => { upload: typeof mocks.upload; getPublicUrl: typeof mocks.getPublicUrl }>(
        () => ({ upload: mocks.upload, getPublicUrl: mocks.getPublicUrl }),
      ),
    },
  },
}))

import { getMyProfile, removeAvatar, saveAvatar, updateMyProfile } from './profileService'

interface QueryChain {
  select: () => QueryChainBase
  eq: () => QueryChainBase
  insert: () => QueryChainBase
  update: () => QueryChainBase
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
    insert: vi.fn<() => QueryChainBase>(() => chain),
    update: vi.fn<() => QueryChainBase>(() => chain),
    single: vi.fn<() => Promise<SupabaseResult>>(() => Promise.resolve(result)),
    maybeSingle: vi.fn<() => Promise<SupabaseResult>>(() => Promise.resolve(result)),
  }

  // El builder de Supabase real es "thenable" (el servicio hace `await
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

function profileRow(overrides: Partial<Record<string, unknown>> = {}): Record<string, unknown> {
  return {
    id: 'user-1',
    display_name: 'Ana Pedal',
    avatar_url: null,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-02T00:00:00.000Z',
    ...overrides,
  }
}

function userOf(metadata: Record<string, unknown> = { display_name: 'Ana Pedal' }) {
  return { id: 'user-1', user_metadata: metadata }
}

beforeEach(() => {
  vi.clearAllMocks()
  mocks.getUser.mockResolvedValue({ data: { user: userOf() }, error: null })
  mocks.updateUser.mockResolvedValue({ error: null })
  mocks.getPublicUrl.mockImplementation((path: string) => ({
    data: { publicUrl: `https://cdn.example/${path}` },
  }))
})

describe('getMyProfile', () => {
  it('returns the mapped profile row', async () => {
    mocks.from.mockReturnValue(createQueryChain({ data: profileRow(), error: null }))

    const profile = await getMyProfile()

    expect(profile).toEqual({
      id: 'user-1',
      displayName: 'Ana Pedal',
      avatarUrl: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-02T00:00:00.000Z',
    })
    expect(mocks.from).toHaveBeenCalledWith('profiles')
  })

  it('throws when there is no authenticated user', async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null }, error: null })

    await expect(getMyProfile()).rejects.toThrow('Debes iniciar sesión para gestionar tu perfil.')
  })

  it('creates the profile from Auth metadata when the row is missing', async () => {
    const insertResult = { data: profileRow({ display_name: 'Ana Pedal' }), error: null }
    let call = 0
    mocks.from.mockImplementation(() => {
      call += 1
      return createQueryChain(call === 1 ? { data: null, error: null } : insertResult)
    })

    const profile = await getMyProfile()

    expect(profile.displayName).toBe('Ana Pedal')
    expect(mocks.from).toHaveBeenCalledTimes(2)
  })

  it('falls back to a default name when Auth metadata has no display name', async () => {
    mocks.getUser.mockResolvedValue({
      data: { user: userOf({}) },
      error: null,
    })

    const insertResult = { data: profileRow({ display_name: 'Ciclista' }), error: null }
    let call = 0
    mocks.from.mockImplementation(() => {
      call += 1
      return createQueryChain(call === 1 ? { data: null, error: null } : insertResult)
    })

    const profile = await getMyProfile()

    expect(profile.displayName).toBe('Ciclista')
  })

  it('surfaces a select error', async () => {
    mocks.from.mockReturnValue(createQueryChain({ data: null, error: { message: 'rls' } }))

    await expect(getMyProfile()).rejects.toThrow('No se ha podido cargar el perfil: rls')
  })
})

describe('updateMyProfile', () => {
  it('updates the display name and syncs Auth metadata', async () => {
    mocks.from.mockReturnValue(
      createQueryChain({ data: profileRow({ display_name: 'Ana Ruta' }), error: null }),
    )

    const profile = await updateMyProfile('  Ana Ruta  ')

    expect(profile.displayName).toBe('Ana Ruta')
    expect(mocks.updateUser).toHaveBeenCalledWith({ data: { display_name: 'Ana Ruta' } })
  })

  it('still returns the updated profile when the metadata sync fails', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    mocks.from.mockReturnValue(
      createQueryChain({ data: profileRow({ display_name: 'Ana Ruta' }), error: null }),
    )
    mocks.updateUser.mockResolvedValue({ error: { message: 'metadata' } })

    const profile = await updateMyProfile('Ana Ruta')

    expect(profile.displayName).toBe('Ana Ruta')
    expect(consoleError).toHaveBeenCalled()
    consoleError.mockRestore()
  })

  it('throws when the update affects no row', async () => {
    mocks.from.mockReturnValue(createQueryChain({ data: null, error: null }))

    await expect(updateMyProfile('Ana Ruta')).rejects.toThrow(
      'No se ha podido guardar el nombre. Inténtalo de nuevo.',
    )
  })
})

describe('saveAvatar', () => {
  function avatarFile(type = 'image/png'): File {
    const file = new File(['contenido'], 'avatar', { type })
    Object.defineProperty(file, 'size', { value: 2048 })
    return file
  }

  it('uploads to the user folder and stores the cache-busted public URL', async () => {
    const chain = createQueryChain({ data: profileRow(), error: null })
    mocks.from.mockReturnValue(chain)
    mocks.upload.mockResolvedValue({ data: { path: 'user-1/avatar.png' }, error: null })

    await saveAvatar(avatarFile())

    expect(mocks.upload).toHaveBeenCalledWith(
      'user-1/avatar.png',
      expect.any(File),
      expect.objectContaining({ upsert: true, contentType: 'image/png' }),
    )
    expect(chain.update).toHaveBeenCalledWith(
      expect.objectContaining({
        avatar_url: expect.stringMatching(/^https:\/\/cdn\.example\/user-1\/avatar\.png\?v=\d+$/),
      }),
    )
  })

  it('rejects invalid image types before uploading', async () => {
    await expect(saveAvatar(avatarFile('image/gif'))).rejects.toThrow(
      'Selecciona una imagen JPEG, PNG, WebP o AVIF.',
    )
    expect(mocks.upload).not.toHaveBeenCalled()
  })

  it('throws when the storage upload fails', async () => {
    mocks.upload.mockResolvedValue({ data: null, error: { message: 'quota' } })

    await expect(saveAvatar(avatarFile())).rejects.toThrow(
      'No se ha podido subir la imagen. Inténtalo de nuevo.',
    )
  })

  it('throws when the profile row cannot be updated after the upload', async () => {
    mocks.upload.mockResolvedValue({ data: { path: 'user-1/avatar.png' }, error: null })
    mocks.from.mockReturnValue(createQueryChain({ data: null, error: null }))

    await expect(saveAvatar(avatarFile())).rejects.toThrow(
      'No se ha podido guardar el avatar. Inténtalo de nuevo.',
    )
  })
})

describe('removeAvatar', () => {
  it('sets the avatar url back to null', async () => {
    const chain = createQueryChain({ data: profileRow({ avatar_url: null }), error: null })
    mocks.from.mockReturnValue(chain)

    const profile = await removeAvatar()

    expect(chain.update).toHaveBeenCalledWith(
      expect.objectContaining({ avatar_url: null }),
    )
    expect(profile.avatarUrl).toBeNull()
  })

  it('throws when the profile row cannot be updated', async () => {
    mocks.from.mockReturnValue(createQueryChain({ data: null, error: { message: 'denied' } }))

    await expect(removeAvatar()).rejects.toThrow('No se ha podido eliminar la foto.')
  })
})
