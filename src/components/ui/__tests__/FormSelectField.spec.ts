import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import FormSelectField from '../FormSelectField.vue'

const options = [
  { value: 'Todos' as const, label: 'Todos' },
  { value: 'Iniciación' as const, label: 'Iniciación' },
]

function mountField() {
  return mount(FormSelectField, {
    props: {
      id: 'level-filter',
      label: 'Nivel',
      options,
      modelValue: 'Todos',
    },
  })
}

describe('FormSelectField', () => {
  it('associates the visible label with the select', () => {
    const wrapper = mountField()

    const label = wrapper.get('label')

    expect(label.text()).toBe('Nivel')
    expect(label.attributes('for')).toBe('level-filter')
    expect(wrapper.get('select').attributes('id')).toBe('level-filter')
  })

  it('keeps the label only for assistive technology when label-hidden is set', () => {
    const wrapper = mount(FormSelectField, {
      props: {
        id: 'level-filter',
        label: 'Nivel',
        labelHidden: true,
        options,
        modelValue: 'Todos',
      },
    })

    const label = wrapper.get('label')

    expect(label.classes()).toContain('sr-only')
    expect(label.text()).toBe('Nivel')
    expect(label.attributes('for')).toBe('level-filter')
  })

  it('renders every option', () => {
    const wrapper = mountField()
    const values = wrapper.findAll('option').map((option) => option.attributes('value'))

    expect(values).toEqual(['Todos', 'Iniciación'])
  })

  it('emits the selected value', async () => {
    const wrapper = mountField()

    await wrapper.get('select').setValue('Iniciación')

    expect(wrapper.emitted('update:modelValue')).toEqual([['Iniciación']])
  })
})
