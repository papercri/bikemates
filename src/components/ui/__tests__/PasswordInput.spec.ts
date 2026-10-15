import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import PasswordInput from '../PasswordInput.vue'

function mountPasswordInput(modelValue = 'secreta123') {
  return mount(PasswordInput, {
    props: { id: 'password', modelValue },
  })
}

describe('PasswordInput', () => {
  it('hides the password by default', () => {
    const wrapper = mountPasswordInput()

    expect(wrapper.get('input').attributes('type')).toBe('password')
  })

  it('exposes a toggle with an accessible name', () => {
    const wrapper = mountPasswordInput()

    const toggle = wrapper.get('button')

    expect(toggle.attributes('type')).toBe('button')
    expect(toggle.attributes('aria-label')).toBe('Mostrar contraseña')
    expect(toggle.attributes('aria-pressed')).toBe('false')
  })

  it('shows the password while the toggle is active', async () => {
    const wrapper = mountPasswordInput()

    await wrapper.get('button').trigger('click')

    expect(wrapper.get('input').attributes('type')).toBe('text')
    expect(wrapper.get('button').attributes('aria-label')).toBe('Ocultar contraseña')
    expect(wrapper.get('button').attributes('aria-pressed')).toBe('true')
  })

  it('hides the password again on the second click', async () => {
    const wrapper = mountPasswordInput()
    const toggle = wrapper.get('button')

    await toggle.trigger('click')
    await toggle.trigger('click')

    expect(wrapper.get('input').attributes('type')).toBe('password')
    expect(toggle.attributes('aria-label')).toBe('Mostrar contraseña')
  })

  it('keeps the entered value in sync with the model', async () => {
    const wrapper = mountPasswordInput('')

    await wrapper.get('input').setValue('nuevaClave1')

    expect(wrapper.emitted('update:modelValue')).toEqual([['nuevaClave1']])
  })

  it('forwards the id to the underlying input', () => {
    const wrapper = mount(PasswordInput, { props: { id: 'registro-password', modelValue: '' } })

    expect(wrapper.get('input').attributes('id')).toBe('registro-password')
  })
})
