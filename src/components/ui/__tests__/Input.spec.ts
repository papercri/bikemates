import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Input from '../Input.vue'

describe('Input', () => {
  it('renders a labelled-by-id native input', () => {
    const wrapper = mount(Input, {
      props: {
        id: 'email',
        name: 'email',
        type: 'email',
        modelValue: 'ciclista@example.com',
      },
    })

    const input = wrapper.get('input')

    expect(input.attributes('id')).toBe('email')
    expect(input.attributes('name')).toBe('email')
    expect(input.attributes('type')).toBe('email')
    expect(input.element.value).toBe('ciclista@example.com')
  })

  it('emits the typed value', async () => {
    const wrapper = mount(Input, {
      props: { id: 'email', modelValue: '' },
    })

    await wrapper.get('input').setValue('hola@example.com')

    expect(wrapper.emitted('update:modelValue')).toEqual([['hola@example.com']])
  })

  it('reflects the modelValue prop on the element', async () => {
    const wrapper = mount(Input, {
      props: { id: 'email', modelValue: 'primero' },
    })

    await wrapper.setProps({ modelValue: 'segundo' })

    expect(wrapper.get('input').element.value).toBe('segundo')
  })

  it('forwards validation attributes', () => {
    const wrapper = mount(Input, {
      props: {
        id: 'password',
        modelValue: '',
        required: true,
        disabled: true,
        ariaInvalid: true,
        ariaDescribedby: 'password-hint',
        autocomplete: 'new-password',
        placeholder: 'Mínimo 8 caracteres',
      },
    })

    const input = wrapper.get('input')

    expect(input.attributes('required')).toBeDefined()
    expect(input.attributes('disabled')).toBeDefined()
    expect(input.attributes('aria-invalid')).toBe('true')
    expect(input.attributes('aria-describedby')).toBe('password-hint')
    expect(input.attributes('autocomplete')).toBe('new-password')
    expect(input.attributes('placeholder')).toBe('Mínimo 8 caracteres')
  })

  it('marks valid values with aria-invalid="false"', () => {
    const wrapper = mount(Input, { props: { id: 'email', modelValue: '', ariaInvalid: false } })

    expect(wrapper.get('input').attributes('aria-invalid')).toBe('false')
  })

  it('applies trailing padding only when trailing is set', () => {
    const withTrailing = mount(Input, { props: { id: 'a', modelValue: '', trailing: true } })
    const withoutTrailing = mount(Input, { props: { id: 'a', modelValue: '' } })

    expect(withTrailing.get('input').classes()).toContain('pr-12')
    expect(withoutTrailing.get('input').classes()).not.toContain('pr-12')
  })
})
