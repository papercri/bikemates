import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import EmptyState from '../EmptyState.vue'

function mountEmptyState(props?: Record<string, unknown>, slot?: string) {
  return mount(EmptyState, {
    props: { description: 'No hay nada por aquí.', ...props },
    slots: slot === undefined ? {} : { default: slot },
  })
}

describe('EmptyState', () => {
  it('renders the description without a heading when no title is given', () => {
    const wrapper = mountEmptyState()

    expect(wrapper.find('h1').exists()).toBe(false)
    expect(wrapper.find('h2').exists()).toBe(false)
    expect(wrapper.text()).toContain('No hay nada por aquí.')
  })

  it('renders the title as an h2 by default', () => {
    const wrapper = mountEmptyState({ title: 'Sin resultados' })

    expect(wrapper.get('h2').text()).toBe('Sin resultados')
  })

  it('honours the titleAs level', () => {
    const asH1 = mountEmptyState({ title: 'Ruta no encontrada', titleAs: 'h1' })
    const asH3 = mountEmptyState({ title: 'Nada', titleAs: 'h3' })

    expect(asH1.get('h1').text()).toBe('Ruta no encontrada')
    expect(asH3.get('h3').text()).toBe('Nada')
  })

  it('renders the action slot only when it has content', () => {
    const withoutSlot = mountEmptyState({ title: 'Vacío' })
    const withSlot = mountEmptyState({ title: 'Vacío' }, '<button>Explorar rutas</button>')

    expect(withoutSlot.find('button').exists()).toBe(false)
    expect(withSlot.get('button').text()).toBe('Explorar rutas')
  })
})
