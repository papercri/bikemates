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

  it('renders the boxed error variant as a highlighted panel', () => {
    const wrapper = mount(Alert, {
      props: { boxed: true },
      slots: { default: 'Selecciona un punto de encuentro válido.' },
    })

    expect(wrapper.attributes('role')).toBe('alert')
    expect(wrapper.classes()).toContain('rounded-xl')
    expect(wrapper.classes()).toContain('bg-red-50')
    expect(wrapper.classes()).toContain('text-red-700')
    expect(wrapper.classes()).not.toContain('text-red-600')
  })
})
