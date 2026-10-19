import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import DropdownMenu from '../DropdownMenu.vue'

function mountMenu() {
  return mount(DropdownMenu, {
    props: {
      label: 'Acciones',
      triggerLabel: 'Abrir acciones',
      triggerClass: 'trigger-test-class',
    },
    slots: {
      trigger: 'Abrir',
      default: `
        <button role="menuitem" type="button">Primero</button>
        <button role="menuitem" type="button">Segundo</button>
      `,
    },
    attachTo: document.body,
  })
}

describe('DropdownMenu', () => {
  it('renders a menu button that is collapsed by default', () => {
    const wrapper = mountMenu()
    const trigger = wrapper.get('button[aria-haspopup="menu"]')

    expect(trigger.attributes('aria-expanded')).toBe('false')
    expect(trigger.attributes('aria-label')).toBe('Abrir acciones')
    expect(wrapper.find('[role="menu"]').exists()).toBe(false)

    wrapper.unmount()
  })

  it('opens the menu on click and focuses the first item', async () => {
    const wrapper = mountMenu()

    await wrapper.get('button[aria-haspopup="menu"]').trigger('click')

    const menu = wrapper.get('[role="menu"]')
    expect(menu.attributes('aria-label')).toBe('Acciones')
    expect(wrapper.get('button[aria-haspopup="menu"]').attributes('aria-expanded')).toBe('true')
    expect(document.activeElement?.textContent).toContain('Primero')

    wrapper.unmount()
  })

  it('closes the menu when an item is clicked', async () => {
    const wrapper = mountMenu()

    await wrapper.get('button[aria-haspopup="menu"]').trigger('click')
    const items = wrapper.findAll('[role="menuitem"]')
    await items[0]?.trigger('click')

    expect(wrapper.find('[role="menu"]').exists()).toBe(false)

    wrapper.unmount()
  })

  it('closes on Escape and restores focus to the trigger', async () => {
    const wrapper = mountMenu()
    const trigger = wrapper.get('button[aria-haspopup="menu"]')

    await trigger.trigger('click')
    await wrapper.get('[role="menu"]').trigger('keydown', { key: 'Escape' })
    // El foco vuelve al disparador tras retirar el menú del DOM.
    await nextTick()

    expect(wrapper.find('[role="menu"]').exists()).toBe(false)
    expect(document.activeElement).toBe(trigger.element)

    wrapper.unmount()
  })

  it('moves focus between items with the arrow keys', async () => {
    const wrapper = mountMenu()

    await wrapper.get('button[aria-haspopup="menu"]').trigger('click')
    const menu = wrapper.get('[role="menu"]')

    await menu.trigger('keydown', { key: 'ArrowDown' })
    expect(document.activeElement?.textContent).toContain('Segundo')

    await menu.trigger('keydown', { key: 'ArrowUp' })
    expect(document.activeElement?.textContent).toContain('Primero')

    wrapper.unmount()
  })

  it('keeps the last item focused when moving down past the end', async () => {
    const wrapper = mountMenu()

    await wrapper.get('button[aria-haspopup="menu"]').trigger('click')
    const menu = wrapper.get('[role="menu"]')

    await menu.trigger('keydown', { key: 'End' })
    await menu.trigger('keydown', { key: 'ArrowDown' })
    expect(document.activeElement?.textContent).toContain('Segundo')

    wrapper.unmount()
  })
})
