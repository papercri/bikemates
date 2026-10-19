import { flushPromises, mount } from '@vue/test-utils'
import { ref } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ProfileDetailsTab from '../ProfileDetailsTab.vue'
import type { Profile } from '../../types'

const mocks = vi.hoisted(() => ({
  getMyProfile: vi.fn<() => Promise<Profile>>(),
  updateMyProfile: vi.fn<(name: string) => Promise<Profile>>(),
  saveAvatar: vi.fn<(file: File) => Promise<Profile>>(),
}))

vi.mock('@/features/profile/services/profileService', () => ({
  getMyProfile: mocks.getMyProfile,
  updateMyProfile: mocks.updateMyProfile,
  saveAvatar: mocks.saveAvatar,
}))

vi.mock('@/features/auth/stores/authStore', () => ({
  useAuthStore: () => ({
    user: ref({ email: 'ana@example.com' }),
    deleteAccount: vi.fn<() => Promise<void>>(),
  }),
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

beforeEach(() => {
  vi.clearAllMocks()
})

describe('ProfileDetailsTab', () => {
  it('shows a loading state while the profile loads', () => {
    mocks.getMyProfile.mockReturnValue(new Promise(() => {}))
    const wrapper = mount(ProfileDetailsTab)

    expect(wrapper.get('[role="status"]').text()).toContain('Cargando tu perfil')
  })

  it('surfaces a load error with a retry action', async () => {
    mocks.getMyProfile.mockRejectedValueOnce(new Error('No se ha podido cargar el perfil: rls'))
    mocks.getMyProfile.mockResolvedValue(profileOf())
    const wrapper = mount(ProfileDetailsTab)

    await flushPromises()

    expect(wrapper.get('[role="alert"]').text()).toContain('No se ha podido cargar el perfil: rls')

    await wrapper.get('button').trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('Foto de perfil')
    expect(mocks.getMyProfile).toHaveBeenCalledTimes(2)
  })

  it('renders the profile sections with the loaded data', async () => {
    mocks.getMyProfile.mockResolvedValue(
      profileOf({ displayName: 'Ana Pedal', avatarUrl: 'https://cdn.example/a.png' }),
    )
    const wrapper = mount(ProfileDetailsTab)

    await flushPromises()

    expect(wrapper.text()).toContain('Foto de perfil')
    expect(wrapper.text()).toContain('Correo electrónico')
    expect(wrapper.text()).toContain('ana@example.com')
    expect(
      (wrapper.get('input[id="profile-display-name"]').element as HTMLInputElement).value,
    ).toBe('Ana Pedal')
    expect(wrapper.get('img').attributes('src')).toBe('https://cdn.example/a.png')
  })

  it('reflects a saved name change in the shared profile state', async () => {
    mocks.getMyProfile.mockResolvedValue(profileOf())
    mocks.updateMyProfile.mockResolvedValue(profileOf({ displayName: 'Ana Ruta' }))
    const wrapper = mount(ProfileDetailsTab)

    await flushPromises()

    await wrapper.get('input[id="profile-display-name"]').setValue('Ana Ruta')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(
      (wrapper.get('input[id="profile-display-name"]').element as HTMLInputElement).value,
    ).toBe('Ana Ruta')
    // Las iniciales del bloque de foto se actualizan con el nuevo nombre.
    expect(wrapper.text()).toContain('AR')
  })
})
