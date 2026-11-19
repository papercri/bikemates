import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import FormLabel from '../FormLabel.vue'

describe('FormLabel', () => {
  it('associates the label with its control through the for attribute', () => {
    const wrapper = mount(FormLabel, {
      props: { id: 'email' },
      slots: { default: 'Correo electrónico' },
    })

    const label = wrapper.get('label')

    expect(label.attributes('for')).toBe('email')
    expect(label.text()).toBe('Correo electrónico')
  })

  it('renders compact uppercase-free text without bottom margin', () => {
    const wrapper = mount(FormLabel, { props: { id: 'email' } })

    expect(wrapper.get('label').classes()).toContain('block')
    expect(wrapper.get('label').classes()).toContain('text-xs')
    expect(wrapper.get('label').classes()).toContain('font-semibold')
    expect(wrapper.get('label').classes()).not.toContain('mb-2')
  })

  it('shows the required marker and sr-only hint when required', () => {
    const wrapper = mount(FormLabel, {
      props: { id: 'email', required: true },
      slots: { default: 'Correo electrónico' },
    })

    expect(wrapper.get('label').text()).toContain('*')
    expect(wrapper.get('label').text()).toContain('(obligatorio)')
  })
})
