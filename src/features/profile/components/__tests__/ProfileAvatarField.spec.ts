import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ProfileAvatarField from '../ProfileAvatarField.vue'
import type { Profile } from '../../types'

const mocks = vi.hoisted(() => ({
  saveAvatar: vi.fn<(file: File) => Promise<Profile>>(),
  removeAvatar: vi.fn<() => Promise<Profile>>(),
}))

vi.mock('@/features/profile/services/profileService', () => ({
  saveAvatar: mocks.saveAvatar,
  removeAvatar: mocks.removeAvatar,
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

function avatarFile(type = 'image/png'): File {
  const file = new File(['contenido'], 'avatar', { type })
  Object.defineProperty(file, 'size', { value: 2048 })
  return file
}

async function selectFile(wrapper: ReturnType<typeof mount>, file: File): Promise<void> {
  const input = wrapper.get('input[type="file"]').element as HTMLInputElement
  Object.defineProperty(input, 'files', { value: [file], configurable: true })
  await wrapper.get('input[type="file"]').trigger('change')
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.stubGlobal('URL', {
    ...URL,
    createObjectURL: vi.fn<() => string>(() => 'blob:preview'),
    revokeObjectURL: vi.fn<(url: string) => void>(),
  })
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('ProfileAvatarField', () => {
  it('shows the initials when there is no avatar', () => {
    const wrapper = mount(ProfileAvatarField, {
      props: { avatarUrl: null, displayName: 'Ana Pedal' },
    })

    expect(wrapper.text()).toContain('AP')
    expect(wrapper.find('img').exists()).toBe(false)
  })

  it('renders the saved avatar image', () => {
    const wrapper = mount(ProfileAvatarField, {
      props: { avatarUrl: 'https://cdn.example/a.png', displayName: 'Ana Pedal' },
    })

    const image = wrapper.get('img')
    expect(image.attributes('src')).toBe('https://cdn.example/a.png')
    expect(image.attributes('alt')).toBe('Foto de perfil de Ana Pedal')
  })

  it('rejects invalid image types before saving', async () => {
    const wrapper = mount(ProfileAvatarField, {
      props: { avatarUrl: null, displayName: 'Ana Pedal' },
    })

    await selectFile(wrapper, avatarFile('image/gif'))

    expect(wrapper.text()).toContain('Selecciona una imagen JPEG, PNG, WebP o AVIF.')
    expect(wrapper.text()).not.toContain('Guardar foto')
  })

  it('previews the selection and saves it, emitting the updated profile', async () => {
    const updated = profileOf({ avatarUrl: 'https://cdn.example/user-1/avatar.png?v=1' })
    mocks.saveAvatar.mockResolvedValue(updated)
    const wrapper = mount(ProfileAvatarField, {
      props: { avatarUrl: null, displayName: 'Ana Pedal' },
    })

    await selectFile(wrapper, avatarFile())
    expect(wrapper.text()).toContain('Guardar foto')

    await wrapper.get('button').trigger('click')
    await flushPromises()

    expect(mocks.saveAvatar).toHaveBeenCalledOnce()
    expect(wrapper.emitted('updated')?.[0]).toEqual([updated])
    expect(wrapper.text()).toContain('Foto de perfil actualizada.')
    expect(wrapper.text()).not.toContain('Guardar foto')
  })

  it('surfaces the service error when the upload fails', async () => {
    mocks.saveAvatar.mockRejectedValue(new Error('No se ha podido subir la imagen.'))
    const wrapper = mount(ProfileAvatarField, {
      props: { avatarUrl: null, displayName: 'Ana Pedal' },
    })

    await selectFile(wrapper, avatarFile())
    await wrapper.get('button').trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('No se ha podido subir la imagen.')
    expect(wrapper.emitted('updated')).toBeUndefined()
  })

  it('discards the pending selection and shows the saved avatar again', async () => {
    const wrapper = mount(ProfileAvatarField, {
      props: { avatarUrl: 'https://cdn.example/a.png', displayName: 'Ana Pedal' },
    })

    await selectFile(wrapper, avatarFile())
    expect(wrapper.get('img').attributes('src')).toBe('blob:preview')

    const discard = wrapper.findAll('button').find((b) => b.text() === 'Descartar')
    await discard!.trigger('click')

    expect(wrapper.get('img').attributes('src')).toBe('https://cdn.example/a.png')
    expect(wrapper.text()).not.toContain('Guardar foto')
  })

  it('offers the delete button only when there is a saved avatar', () => {
    const withAvatar = mount(ProfileAvatarField, {
      props: { avatarUrl: 'https://cdn.example/a.png', displayName: 'Ana Pedal' },
    })
    const withoutAvatar = mount(ProfileAvatarField, {
      props: { avatarUrl: null, displayName: 'Ana Pedal' },
    })

    expect(withAvatar.text()).toContain('Eliminar imagen')
    expect(withoutAvatar.text()).not.toContain('Eliminar imagen')
  })

  it('removes the saved avatar and emits the updated profile', async () => {
    const updated = profileOf({ avatarUrl: null })
    mocks.removeAvatar.mockResolvedValue(updated)
    const wrapper = mount(ProfileAvatarField, {
      props: { avatarUrl: 'https://cdn.example/a.png', displayName: 'Ana Pedal' },
    })

    const remove = wrapper.findAll('button').find((b) => b.text() === 'Eliminar imagen')
    await remove!.trigger('click')
    await flushPromises()

    expect(mocks.removeAvatar).toHaveBeenCalledOnce()
    expect(wrapper.emitted('updated')?.[0]).toEqual([updated])
  })

  it('surfaces the service error when removing the avatar fails', async () => {
    mocks.removeAvatar.mockRejectedValue(new Error('No se ha podido eliminar la foto.'))
    const wrapper = mount(ProfileAvatarField, {
      props: { avatarUrl: 'https://cdn.example/a.png', displayName: 'Ana Pedal' },
    })

    const remove = wrapper.findAll('button').find((b) => b.text() === 'Eliminar imagen')
    await remove!.trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('No se ha podido eliminar la foto.')
    expect(wrapper.emitted('updated')).toBeUndefined()
    expect(wrapper.get('img').attributes('src')).toBe('https://cdn.example/a.png')
  })
})
