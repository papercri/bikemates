import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createRouter, createWebHistory } from 'vue-router'
import ProfileDeleteAccount from '../ProfileDeleteAccount.vue'

const mocks = vi.hoisted(() => ({
  deleteAccount: vi.fn<() => Promise<void>>(),
}))

vi.mock('@/features/auth/stores/authStore', () => ({
  useAuthStore: () => ({ deleteAccount: mocks.deleteAccount }),
}))

const routes = [
  { path: '/', name: 'home', component: { template: '<div />' } },
  { path: '/profile', name: 'profile', component: { template: '<div />' } },
]

async function mountComponent() {
  const router = createRouter({ history: createWebHistory(), routes })
  await router.push('/profile')
  await router.isReady()

  return mount(ProfileDeleteAccount, {
    global: { plugins: [router] },
    attachTo: document.body,
  })
}

function dialogButton(selector: '[data-dialog-confirm]' | '[data-dialog-cancel]') {
  const button = document.querySelector<HTMLButtonElement>(selector)
  expect(button).not.toBeNull()
  return button!
}

beforeEach(() => {
  vi.clearAllMocks()
  document.body.innerHTML = ''
})

describe('ProfileDeleteAccount', () => {
  it('opens the confirmation dialog and deletes the account on confirm', async () => {
    mocks.deleteAccount.mockResolvedValue()
    const wrapper = await mountComponent()

    await wrapper.get('button').trigger('click')
    await wrapper.vm.$nextTick()

    const dialog = document.querySelector('[role="dialog"]')
    expect(dialog?.textContent).toContain('¿Eliminar tu cuenta?')

    dialogButton('[data-dialog-confirm]').click()
    await flushPromises()

    expect(mocks.deleteAccount).toHaveBeenCalledOnce()
    expect(document.querySelector('[role="dialog"]')).toBeNull()

    wrapper.unmount()
  })

  it('keeps the account when the deletion is cancelled', async () => {
    const wrapper = await mountComponent()

    await wrapper.get('button').trigger('click')
    await wrapper.vm.$nextTick()

    dialogButton('[data-dialog-cancel]').click()
    await wrapper.vm.$nextTick()

    expect(mocks.deleteAccount).not.toHaveBeenCalled()
    expect(document.querySelector('[role="dialog"]')).toBeNull()

    wrapper.unmount()
  })

  it('surfaces an error when the deletion fails', async () => {
    mocks.deleteAccount.mockRejectedValue(new Error('permiso'))
    const wrapper = await mountComponent()

    await wrapper.get('button').trigger('click')
    await wrapper.vm.$nextTick()

    dialogButton('[data-dialog-confirm]').click()
    await flushPromises()

    expect(wrapper.get('[role="alert"]').text()).toContain(
      'No se ha podido eliminar la cuenta. Inténtalo de nuevo más tarde.',
    )

    wrapper.unmount()
  })
})
