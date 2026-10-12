import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Alert from '../Alert.vue'

describe('Alert', () => {
  it('announces errors assertively with the error tone', () => {
    const wrapper = mount(Alert, { slots: { default: 'No se ha podido enviar el formulario.' } })

    expect(wrapper.attributes('role')).toBe('alert')
    expect(wrapper.classes()).toContain('text-red-600')
    expect(wrapper.text()).toBe('No se ha podido enviar el formulario.')
  })

  it('announces success messages politely with the success tone', () => {
    const wrapper = mount(Alert, {
      props: { variant: 'success' },
      slots: { default: 'Registro completado.' },
    })

    expect(wrapper.attributes('role')).toBe('status')
    expect(wrapper.classes()).toContain('text-trail-ink')
    expect(wrapper.text()).toBe('Registro completado.')
  })
})
