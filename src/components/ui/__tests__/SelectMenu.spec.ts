import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { faUsers } from '@fortawesome/free-solid-svg-icons'
import SelectMenu from '../SelectMenu.vue'
import type { SelectMenuOption } from '../SelectMenu.vue'

const options: readonly SelectMenuOption<string>[] = [
  { value: 'all', label: 'Todos los públicos' },
  { value: 'women', label: 'Mujeres' },
  { value: 'lgbt', label: 'LGBT' },
]

function mountSelect(props?: Record<string, unknown>) {
  return mount(SelectMenu, {
    props: {
      label: 'Público',
      icon: faUsers,
      options,
      modelValue: 'all',
      ...props,
    },
  })
}

describe('SelectMenu', () => {
  it('exposes the field and its value in the accessible name of the trigger', () => {
    const wrapper = mountSelect()

    const trigger = wrapper.get('button[aria-haspopup="menu"]')
    expect(trigger.attributes('aria-label')).toBe('Público: Todos los públicos')
    expect(trigger.text()).toContain('Todos los públicos')
    expect(trigger.text()).not.toContain('Público')
  })

  it('avoids repeating the field name when the value is the placeholder label', () => {
    const wrapper = mountSelect({
      label: 'Ordenar por',
      modelValue: 'all',
      options: [{ value: 'all', label: 'Ordenar por' }],
    })

    expect(wrapper.get('button[aria-haspopup="menu"]').attributes('aria-label')).toBe('Ordenar por')
  })

  it('emits the chosen value and closes the menu', async () => {
    const wrapper = mountSelect()

    await wrapper.get('button[aria-haspopup="menu"]').trigger('click')

    const items = wrapper.findAll('[role="menuitemradio"]')
    expect(items).toHaveLength(3)
    expect(items[0]!.attributes('aria-checked')).toBe('true')

    await items[2]!.trigger('click')

    expect(wrapper.emitted('update:modelValue')).toEqual([['lgbt']])
    expect(wrapper.find('[role="menu"]').exists()).toBe(false)
  })
})
