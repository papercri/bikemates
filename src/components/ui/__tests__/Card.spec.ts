import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Card from '../Card.vue'

describe('Card', () => {
  it('renders a div with the default surface by default', () => {
    const wrapper = mount(Card, { slots: { default: 'Contenido' } })

    expect(wrapper.element.tagName).toBe('DIV')
    expect(wrapper.classes()).toContain('border-line')
    expect(wrapper.classes()).toContain('bg-canvas')
    expect(wrapper.classes()).not.toContain('hover:bg-snow')
    expect(wrapper.classes()).not.toContain('shadow-card')
  })

  it('renders the requested element', () => {
    const wrapper = mount(Card, {
      props: { as: 'article' },
      slots: { default: 'Contenido' },
    })

    expect(wrapper.element.tagName).toBe('ARTICLE')
  })

  it('applies the danger surface for the danger variant', () => {
    const wrapper = mount(Card, {
      props: { variant: 'danger' },
      slots: { default: 'Contenido' },
    })

    expect(wrapper.classes()).toContain('border-red-200')
    expect(wrapper.classes()).toContain('bg-red-50')
    expect(wrapper.classes()).not.toContain('bg-canvas')
  })

  it('adds the surface shift only when interactive', () => {
    const wrapper = mount(Card, {
      props: { interactive: true },
      slots: { default: 'Contenido' },
    })

    expect(wrapper.classes()).toContain('hover:bg-snow')
    expect(wrapper.classes()).toContain('hover:border-line-strong')
  })

  it('renders the slot content', () => {
    const wrapper = mount(Card, { slots: { default: 'Datos de la ruta' } })

    expect(wrapper.text()).toBe('Datos de la ruta')
  })
})
