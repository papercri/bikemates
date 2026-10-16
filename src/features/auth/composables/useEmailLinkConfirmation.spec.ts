import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { EXPIRED_LINK_MESSAGE } from '@/features/auth/utils/emailLinkParams'
import { useEmailLinkConfirmation } from './useEmailLinkConfirmation'

const mocks = vi.hoisted(() => ({
  isEmailConfirmed: vi.fn<() => Promise<boolean>>(),
  verifyRecoveryToken: vi.fn<(tokenHash: string) => Promise<boolean>>(),
  replace: vi.fn<(location: unknown) => Promise<unknown>>(),
  markRecoverySession: vi.fn<() => void>(),
}))

vi.mock('@/features/auth/services/authService', () => ({
  isEmailConfirmed: mocks.isEmailConfirmed,
  verifyRecoveryToken: mocks.verifyRecoveryToken,
}))

vi.mock('vue-router', () => ({
  useRouter: () => ({ replace: mocks.replace }),
}))

vi.mock('@/features/auth/stores/authStore', () => ({
  useAuthStore: () => ({ markRecoverySession: mocks.markRecoverySession }),
}))

function mountLink(search: string, hash = '') {
  const Harness = defineComponent({
    props: {
      search: { type: String, required: true },
      hash: { type: String, default: '' },
    },
    setup(props) {
      const flow = useEmailLinkConfirmation(props.search, props.hash)
      return { flow }
    },
    render: () => null,
  })

  return mount(Harness, { props: { search, hash } })
}

describe('useEmailLinkConfirmation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('confirms the registration email', async () => {
    mocks.isEmailConfirmed.mockResolvedValue(true)

    const wrapper = mountLink('?type=signup')
    await flushPromises()

    expect(wrapper.vm.flow.isConfirmed.value).toBe(true)
    expect(wrapper.vm.flow.isProcessing.value).toBe(false)
    expect(wrapper.vm.flow.errorMessage.value).toBe('')
  })

  it('explains a generic verification error', async () => {
    mocks.isEmailConfirmed.mockResolvedValue(false)

    const wrapper = mountLink('?type=signup')
    await flushPromises()

    expect(wrapper.vm.flow.errorMessage.value).toBe(
      'No se ha podido confirmar el email. Comprueba el enlace recibido.',
    )
  })

  it('reports an expired link from the URL', async () => {
    const wrapper = mountLink('?error_code=otp_expired')
    await flushPromises()

    expect(mocks.isEmailConfirmed).not.toHaveBeenCalled()
    expect(wrapper.vm.flow.errorMessage.value).toBe(EXPIRED_LINK_MESSAGE)
  })

  it('marks the recovery session and redirects to the new password page', async () => {
    mocks.verifyRecoveryToken.mockResolvedValue(true)

    const wrapper = mountLink('?type=recovery&token_hash=abc123')
    await flushPromises()

    expect(mocks.verifyRecoveryToken).toHaveBeenCalledWith('abc123')
    expect(mocks.markRecoverySession).toHaveBeenCalledTimes(1)
    expect(mocks.replace).toHaveBeenCalledWith({ name: 'reset-password' })
    expect(wrapper.vm.flow.errorMessage.value).toBe('')
  })

  it('rejects a recovery link without token', async () => {
    const wrapper = mountLink('?type=recovery')
    await flushPromises()

    expect(wrapper.vm.flow.errorMessage.value).toBe(
      'El enlace de recuperación no contiene un token válido.',
    )
  })

  it('reports an expired recovery link', async () => {
    mocks.verifyRecoveryToken.mockResolvedValue(false)

    const wrapper = mountLink('?type=recovery&token_hash=abc123')
    await flushPromises()

    expect(mocks.markRecoverySession).not.toHaveBeenCalled()
    expect(wrapper.vm.flow.errorMessage.value).toBe(EXPIRED_LINK_MESSAGE)
  })

  it('falls back to a generic message when verification blows up', async () => {
    mocks.isEmailConfirmed.mockRejectedValue(new Error('red caída'))

    const wrapper = mountLink('?type=signup')
    await flushPromises()

    expect(wrapper.vm.flow.errorMessage.value).toBe(
      'Se ha producido un error al verificar el enlace. Inténtalo de nuevo.',
    )
    expect(wrapper.vm.flow.isProcessing.value).toBe(false)
  })
})
