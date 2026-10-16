import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ConfirmDialog from '../ConfirmDialog.vue'

function mountDialog(open = true) {
  return mount(ConfirmDialog, {
    props: {
      open,
      title: '¿Eliminar tu cuenta?',
      description: 'Esta acción es irreversible.',
      confirmLabel: 'Eliminar',
      tone: 'danger',
    },
    attachTo: document.body,
  })
}

function dialog() {
  return document.querySelector('[role="dialog"]')
}

describe('ConfirmDialog', () => {
  it('renders nothing while closed', async () => {
    const wrapper = mountDialog(false)
    await wrapper.vm.$nextTick()

    expect(dialog()).toBeNull()

    wrapper.unmount()
  })

  it('exposes an accessible modal dialog while open', async () => {
    const wrapper = mountDialog()
    await wrapper.vm.$nextTick()

    const panel = dialog()
    expect(panel).not.toBeNull()
    expect(panel?.getAttribute('aria-modal')).toBe('true')

    const labelledBy = panel?.getAttribute('aria-labelledby')
    expect(document.getElementById(labelledBy ?? '')?.textContent).toContain('¿Eliminar tu cuenta?')

    const focused = document.activeElement
    expect(focused?.textContent?.trim()).toBe('Cancelar')

    wrapper.unmount()
  })

  it('emits cancel on Escape and on backdrop click', async () => {
    const wrapper = mountDialog()
    await wrapper.vm.$nextTick()

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('cancel')).toHaveLength(1)

    const backdrop = document.querySelector('[role="dialog"]')?.previousElementSibling
    backdrop?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('cancel')).toHaveLength(2)

    wrapper.unmount()
  })

  it('emits confirm when the confirm button is clicked', async () => {
    const wrapper = mountDialog()
    await wrapper.vm.$nextTick()

    const confirmButton = document.querySelector<HTMLElement>('[data-dialog-confirm]')
    confirmButton?.click()
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('confirm')).toHaveLength(1)
    expect(wrapper.emitted('cancel')).toBeUndefined()

    wrapper.unmount()
  })

  it('keeps focus inside the dialog when tabbing past the last control', async () => {
    const wrapper = mountDialog()
    await wrapper.vm.$nextTick()

    const buttons = document.querySelectorAll<HTMLElement>(
      '[data-dialog-cancel], [data-dialog-confirm]',
    )
    const last = buttons[buttons.length - 1]
    const first = buttons[0]
    last?.focus()

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab' }))
    await wrapper.vm.$nextTick()

    expect(document.activeElement).toBe(first)

    wrapper.unmount()
  })
})
