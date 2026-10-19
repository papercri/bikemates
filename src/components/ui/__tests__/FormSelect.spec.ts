import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { FIELD_CLASSES } from '@/design-system'
import Input from '../Input.vue'
import FormSelect from '../FormSelect.vue'

function mountSelect(props?: Record<string, unknown>) {
  return mount(FormSelect, {
    props: {
      id: 'level',
      modelValue: 'Intermedio',
      ...props,
    },
    slots: {
      default: `
        <option value="Iniciación">Iniciación</option>
        <option value="Intermedio">Intermedio</option>
        <option value="Avanzado">Avanzado</option>
      `,
    },
  })
}

describe('FormSelect', () => {
  it('renders a labelled-by-id native select with the slot options', () => {
    const wrapper = mountSelect({ name: 'level', required: true })

    const select = wrapper.get('select')

    expect(select.attributes('id')).toBe('level')
    expect(select.attributes('name')).toBe('level')
    expect(select.attributes('required')).toBeDefined()
    expect(wrapper.findAll('option').map((option) => option.text())).toEqual([
      'Iniciación',
      'Intermedio',
      'Avanzado',
    ])
    expect(select.element.value).toBe('Intermedio')
  })

  it('emits the typed value and reflects the model back', async () => {
    const wrapper = mountSelect()

    await wrapper.get('select').setValue('Avanzado')

    expect(wrapper.emitted('update:modelValue')).toEqual([['Avanzado']])

    await wrapper.setProps({ modelValue: 'Iniciación' })

    expect(wrapper.get('select').element.value).toBe('Iniciación')
  })

  it('forwards the validation attributes, including the valid default', () => {
    const wrapper = mountSelect({
      disabled: true,
      ariaInvalid: false,
      ariaDescribedby: 'level-help',
    })

    const select = wrapper.get('select')

    expect(select.attributes('disabled')).toBeDefined()
    expect(select.attributes('aria-invalid')).toBe('false')
    expect(select.attributes('aria-describedby')).toBe('level-help')

    const invalid = mountSelect({ ariaInvalid: true })

    expect(invalid.get('select').attributes('aria-invalid')).toBe('true')
  })

  it('shares the design-system field styles with Input', () => {
    const select = mountSelect().get('select')
    const input = mount(Input, { props: { id: 'title', modelValue: '' } }).get('input')

    for (const token of FIELD_CLASSES.split(' ')) {
      expect(select.classes()).toContain(token)
      expect(input.classes()).toContain(token)
    }
  })

  it('hides the decorative chevron from assistive technology', () => {
    const wrapper = mountSelect()

    const chevron = wrapper.get('svg')

    expect(chevron.attributes('aria-hidden')).toBe('true')
    expect(chevron.classes()).toContain('pointer-events-none')
  })
})
