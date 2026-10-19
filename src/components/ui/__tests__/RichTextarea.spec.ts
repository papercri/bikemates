import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import RichTextarea from '../RichTextarea.vue'

function mountEditor(modelValue = '') {
  return mount(RichTextarea, {
    props: { id: 'description', name: 'description', modelValue },
  })
}

describe('RichTextarea', () => {
  it('renders a toolbar of labelled format buttons above the textarea', () => {
    const wrapper = mountEditor()

    const toolbar = wrapper.get('[role="toolbar"]')
    expect(toolbar.attributes('aria-label')).toBe('Formato del texto')

    const labels = toolbar.findAll('button').map((button) => button.attributes('aria-label'))
    expect(labels).toEqual(['Negrita', 'Cursiva', 'Lista', 'Enlace'])

    // Los botones no deben enviar el formulario.
    for (const button of toolbar.findAll('button')) {
      expect(button.attributes('type')).toBe('button')
    }
  })

  it('forwards the field props to the inner textarea', () => {
    const wrapper = mount(RichTextarea, {
      props: {
        id: 'description',
        modelValue: '',
        rows: 6,
        minlength: 10,
        maxlength: 3000,
        required: true,
        placeholder: 'Describe el recorrido…',
      },
    })

    const textarea = wrapper.get('textarea')
    expect(textarea.attributes('rows')).toBe('6')
    expect(textarea.attributes('minlength')).toBe('10')
    expect(textarea.attributes('maxlength')).toBe('3000')
    expect(textarea.attributes('required')).toBeDefined()
    expect(textarea.attributes('placeholder')).toBe('Describe el recorrido…')
  })

  it('emits the value with the selection wrapped in bold markers', async () => {
    const wrapper = mountEditor('hola mundo')
    const textarea = wrapper.get('textarea')
    textarea.element.selectionStart = 0
    textarea.element.selectionEnd = 4

    await wrapper.get('button[aria-label="Negrita"]').trigger('click')

    expect(wrapper.emitted('update:modelValue')).toEqual([['**hola** mundo']])
  })

  it('prefixes every selected line when the list action is used', async () => {
    const wrapper = mountEditor('uno\ndos')
    const textarea = wrapper.get('textarea')
    textarea.element.selectionStart = 0
    textarea.element.selectionEnd = 7

    await wrapper.get('button[aria-label="Lista"]').trigger('click')

    expect(wrapper.emitted('update:modelValue')).toEqual([['- uno\n- dos']])
  })

  it('keeps the description as plain text, never as HTML', async () => {
    const wrapper = mountEditor('Ruta por pista')
    const textarea = wrapper.get('textarea')
    textarea.element.selectionStart = 0
    textarea.element.selectionEnd = 4

    await wrapper.get('button[aria-label="Cursiva"]').trigger('click')

    // El formato se aplica con marcadores de texto, no con etiquetas <strong>/<em>.
    const [emitted] = wrapper.emitted('update:modelValue') ?? []
    expect(emitted?.[0]).toBe('*Ruta* por pista')
  })
})
