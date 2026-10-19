import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Profile } from '../types'
import { useProfile } from './useProfile'

const mocks = vi.hoisted(() => ({
  getMyProfile: vi.fn<() => Promise<Profile>>(),
}))

vi.mock('../services/profileService', () => ({
  getMyProfile: mocks.getMyProfile,
}))

function profileOf(overrides: Partial<Profile> = {}): Profile {
  return {
    id: 'user-1',
    displayName: 'Ana Pedal',
    avatarUrl: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

function mountComposable() {
  let composables: ReturnType<typeof useProfile>

  const Parent = defineComponent({
    setup() {
      composables = useProfile()
      return () => null
    },
  })

  const wrapper = mount(Parent)

  return { wrapper, composables: () => composables! }
}

beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('useProfile', () => {
  it('loads the profile on mount', async () => {
    mocks.getMyProfile.mockResolvedValue(profileOf())
    const { composables } = mountComposable()

    expect(composables().isLoading.value).toBe(true)

    await flushPromises()

    expect(composables().isLoading.value).toBe(false)
    expect(composables().profile.value?.displayName).toBe('Ana Pedal')
    expect(composables().errorMessage.value).toBeNull()
  })

  it('exposes a friendly message when loading fails', async () => {
    mocks.getMyProfile.mockRejectedValue(new Error('No se ha podido cargar el perfil: rls'))
    const { composables } = mountComposable()

    await flushPromises()

    expect(composables().profile.value).toBeNull()
    expect(composables().errorMessage.value).toBe('No se ha podido cargar el perfil: rls')
  })

  it('falls back to a generic message for unknown errors', async () => {
    mocks.getMyProfile.mockRejectedValue('algo inesperado')
    const { composables } = mountComposable()

    await flushPromises()

    expect(composables().errorMessage.value).toBe('No se ha podido cargar tu perfil.')
  })

  it('reloads the profile on demand', async () => {
    mocks.getMyProfile.mockResolvedValue(profileOf())
    const { composables } = mountComposable()

    await flushPromises()
    mocks.getMyProfile.mockResolvedValue(profileOf({ displayName: 'Ana Ruta' }))

    await composables().loadProfile()

    expect(composables().profile.value?.displayName).toBe('Ana Ruta')
    expect(composables().isLoading.value).toBe(false)
  })
})
