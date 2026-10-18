import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import FormError from '../FormError.vue'
import FormHelp from '../FormHelp.vue'

describe('FormHelp', () => {
  it('forwards the id used by aria-describedby on the control', () => {
    const wrapper = mount(FormHelp, {
      props: { id: 'password-help' },
      slots: { default: 'Utiliza al menos 8 caracteres.' },
    })

    expect(wrapper.get('p').attributes('id')).toBe('password-help')
    expect(wrapper.text()).toBe('Utiliza al menos 8 caracteres.')
  })

  it('omits the id attribute when it is not provided', () => {
    const wrapper = mount(FormHelp, {
      slots: { default: 'Texto de ayuda.' },
    })

    expect(wrapper.get('p').attributes('id')).toBeUndefined()
  })

  it('shares the base layout with FormError but keeps the muted tone', () => {
    const help = mount(FormHelp, { slots: { default: 'Ayuda' } }).get('p')
    const error = mount(FormError, { slots: { default: 'Error' } }).get('p')

    expect(help.classes()).toContain('mt-2')
    expect(help.classes()).toContain('text-sm')
    expect(help.classes()).toContain('text-graphite')
    expect(error.classes()).toContain('text-red-700')
  })
})
