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

  it('reserves the bottom margin by default', () => {
    const wrapper = mount(FormLabel, { props: { id: 'email' } })

    expect(wrapper.get('label').classes()).toContain('mb-2')
  })

  it('drops the margin when it is disabled', () => {
    const wrapper = mount(FormLabel, { props: { id: 'email', margin: false } })

    expect(wrapper.get('label').classes()).not.toContain('mb-2')
  })
})
