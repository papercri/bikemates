import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Textarea from '../Textarea.vue'

describe('Textarea', () => {
  it('renders a labelled-by-id native textarea', () => {
    const wrapper = mount(Textarea, {
      props: {
        id: 'description',
        name: 'description',
        modelValue: 'Recorrido por pista forestal.',
      },
    })

    const textarea = wrapper.get('textarea')

    expect(textarea.attributes('id')).toBe('description')
    expect(textarea.attributes('name')).toBe('description')
    expect(textarea.element.value).toBe('Recorrido por pista forestal.')
  })

  it('emits the typed value', async () => {
    const wrapper = mount(Textarea, { props: { id: 'description', modelValue: '' } })

    await wrapper.get('textarea').setValue('Nueva descripción')

    expect(wrapper.emitted('update:modelValue')).toEqual([['Nueva descripción']])
  })

  it('forwards length constraints and validation attributes', () => {
    const wrapper = mount(Textarea, {
      props: {
        id: 'description',
        modelValue: '',
        rows: 4,
        minlength: 10,
        maxlength: 3000,
        required: true,
        ariaInvalid: true,
        ariaDescribedby: 'description-help',
        placeholder: 'Describe el recorrido…',
      },
    })

    const textarea = wrapper.get('textarea')

    expect(textarea.attributes('rows')).toBe('4')
    expect(textarea.attributes('minlength')).toBe('10')
    expect(textarea.attributes('maxlength')).toBe('3000')
    expect(textarea.attributes('required')).toBeDefined()
    expect(textarea.attributes('aria-invalid')).toBe('true')
    expect(textarea.attributes('aria-describedby')).toBe('description-help')
    expect(textarea.attributes('placeholder')).toBe('Describe el recorrido…')
  })

  it('shares the design-system field styles with Input', async () => {
    const { default: Input } = await import('../Input.vue')

    const textarea = mount(Textarea, { props: { id: 'a', modelValue: '' } })
    const input = mount(Input, { props: { id: 'a', modelValue: '' } })

    expect(textarea.classes()).toEqual(input.classes())
  })
})
