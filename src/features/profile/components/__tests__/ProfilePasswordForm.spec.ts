import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ProfilePasswordForm from '../ProfilePasswordForm.vue'

const mocks = vi.hoisted(() => ({
  verifyCurrentUserPassword: vi.fn<(password: string) => Promise<boolean>>(),
  updatePassword: vi.fn<(password: string) => Promise<void>>(),
}))

vi.mock('@/features/auth/services/authService', () => ({
  verifyCurrentUserPassword: mocks.verifyCurrentUserPassword,
  updatePassword: mocks.updatePassword,
}))

function passwordInputs(wrapper: ReturnType<typeof mount>) {
  const inputs = wrapper.findAll('input[type="password"], input[type="text"]')
  return {
    current: inputs[0]!,
    next: inputs[1]!,
    confirm: inputs[2]!,
  }
}

async function fillAndSubmit(
  wrapper: ReturnType<typeof mount>,
  { current, next, confirm }: { current: string; next: string; confirm: string },
): Promise<void> {
  const fields = passwordInputs(wrapper)
  await fields.current.setValue(current)
  await fields.next.setValue(next)
  await fields.confirm.setValue(confirm)
  await wrapper.get('form').trigger('submit')
  await flushPromises()
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('ProfilePasswordForm', () => {
  it('requires the current password', async () => {
    const wrapper = mount(ProfilePasswordForm)

    await fillAndSubmit(wrapper, { current: '', next: 'nuevaClave1', confirm: 'nuevaClave1' })

    expect(wrapper.text()).toContain('Introduce tu contraseña actual.')
    expect(mocks.verifyCurrentUserPassword).not.toHaveBeenCalled()
  })

  it('validates the new password with the shared rules', async () => {
    const wrapper = mount(ProfilePasswordForm)

    await fillAndSubmit(wrapper, { current: 'actual123', next: 'corta', confirm: 'corta' })

    expect(wrapper.text()).toContain('La contraseña debe tener al menos 8 caracteres.')
    expect(mocks.updatePassword).not.toHaveBeenCalled()
  })

  it('requires the confirmation to match', async () => {
    const wrapper = mount(ProfilePasswordForm)

    await fillAndSubmit(wrapper, {
      current: 'actual123',
      next: 'nuevaClave1',
      confirm: 'otraDistinta1',
    })

    expect(wrapper.text()).toContain('Las contraseñas no coinciden.')
  })

  it('rejects a wrong current password', async () => {
    mocks.verifyCurrentUserPassword.mockResolvedValue(false)
    const wrapper = mount(ProfilePasswordForm)

    await fillAndSubmit(wrapper, {
      current: 'mala12345',
      next: 'nuevaClave1',
      confirm: 'nuevaClave1',
    })

    expect(wrapper.text()).toContain('La contraseña actual no es correcta.')
    expect(mocks.updatePassword).not.toHaveBeenCalled()
  })

  it('verifies and updates the password on success', async () => {
    mocks.verifyCurrentUserPassword.mockResolvedValue(true)
    mocks.updatePassword.mockResolvedValue()
    const wrapper = mount(ProfilePasswordForm)

    await fillAndSubmit(wrapper, {
      current: 'actual123',
      next: 'nuevaClave1',
      confirm: 'nuevaClave1',
    })

    expect(mocks.verifyCurrentUserPassword).toHaveBeenCalledWith('actual123')
    expect(mocks.updatePassword).toHaveBeenCalledWith('nuevaClave1')
    expect(wrapper.text()).toContain('Contraseña actualizada correctamente.')

    const fields = passwordInputs(wrapper)
    expect((fields.current.element as HTMLInputElement).value).toBe('')
    expect((fields.next.element as HTMLInputElement).value).toBe('')
    expect((fields.confirm.element as HTMLInputElement).value).toBe('')
  })

  it('shows a generic error when the update fails', async () => {
    mocks.verifyCurrentUserPassword.mockResolvedValue(true)
    mocks.updatePassword.mockRejectedValue(new Error('offline'))
    const wrapper = mount(ProfilePasswordForm)

    await fillAndSubmit(wrapper, {
      current: 'actual123',
      next: 'nuevaClave1',
      confirm: 'nuevaClave1',
    })

    expect(wrapper.get('[role="alert"]').text()).toContain(
      'No se ha podido actualizar la contraseña. Inténtalo de nuevo más tarde.',
    )
  })
})
