import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import FormError from '../FormError.vue'

describe('FormError', () => {
  it('forwards the id used by aria-describedby on the control', () => {
    const wrapper = mount(FormError, {
      props: { id: 'email-error' },
      slots: { default: 'Introduce un correo electrónico válido.' },
    })

    expect(wrapper.get('p').attributes('id')).toBe('email-error')
    expect(wrapper.text()).toBe('Introduce un correo electrónico válido.')
  })

  it('omits the id attribute when it is not provided', () => {
    const wrapper = mount(FormError, {
      slots: { default: 'Algo ha fallado.' },
    })

    expect(wrapper.get('p').attributes('id')).toBeUndefined()
  })

  it('marks the message with the error colour recipe', () => {
    const wrapper = mount(FormError, {
      slots: { default: 'Error' },
    })

    expect(wrapper.get('p').classes()).toContain('text-red-700')
  })
})
