import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ProfileNameForm from '../ProfileNameForm.vue'
import type { Profile } from '../../types'

const mocks = vi.hoisted(() => ({
  updateMyProfile: vi.fn<(name: string) => Promise<Profile>>(),
}))

vi.mock('@/features/profile/services/profileService', () => ({
  updateMyProfile: mocks.updateMyProfile,
}))

function profileOf(displayName: string): Profile {
  return {
    id: 'user-1',
    displayName,
    avatarUrl: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-02T00:00:00.000Z',
  }
}

function mountForm(displayName = 'Ana Pedal') {
  return mount(ProfileNameForm, { props: { displayName } })
}

beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('ProfileNameForm', () => {
  it('shows the current display name', () => {
    const wrapper = mountForm()

    expect(wrapper.get('input').element.value).toBe('Ana Pedal')
  })

  it('keeps the input in sync when the prop changes', async () => {
    const wrapper = mountForm()

    await wrapper.setProps({ displayName: 'Ana Ruta' })

    expect(wrapper.get('input').element.value).toBe('Ana Ruta')
  })

  it('shows a validation error without calling the service', async () => {
    const wrapper = mountForm()

    await wrapper.get('input').setValue('A')
    await wrapper.get('form').trigger('submit')

    expect(wrapper.text()).toContain('El nombre debe tener al menos 2 caracteres.')
    expect(mocks.updateMyProfile).not.toHaveBeenCalled()
  })

  it('saves a valid name and emits the updated profile', async () => {
    const updated = profileOf('Ana Ruta')
    mocks.updateMyProfile.mockResolvedValue(updated)
    const wrapper = mountForm()

    await wrapper.get('input').setValue('  Ana Ruta  ')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(mocks.updateMyProfile).toHaveBeenCalledWith('  Ana Ruta  ')
    expect(wrapper.emitted('updated')?.[0]).toEqual([updated])
    expect(wrapper.text()).toContain('Nombre actualizado correctamente.')
  })

  it('surfaces the service error', async () => {
    mocks.updateMyProfile.mockRejectedValue(new Error('No se ha podido guardar el nombre.'))
    const wrapper = mountForm()

    await wrapper.get('input').setValue('Ana Ruta')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(wrapper.text()).toContain('No se ha podido guardar el nombre.')
    expect(wrapper.emitted('updated')).toBeUndefined()
  })

  it('clears the success message when the name is edited again', async () => {
    mocks.updateMyProfile.mockResolvedValue(profileOf('Ana Ruta'))
    const wrapper = mountForm()

    await wrapper.get('input').setValue('Ana Ruta')
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    expect(wrapper.text()).toContain('Nombre actualizado correctamente.')

    await wrapper.get('input').setValue('Ana Ruta X')

    expect(wrapper.text()).not.toContain('Nombre actualizado correctamente.')
  })
})
