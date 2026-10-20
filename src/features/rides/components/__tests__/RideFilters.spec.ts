import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import RideFilters from '../RideFilters.vue'

function mountFilters(props?: Record<string, unknown>) {
  return mount(RideFilters, {
    props: {
      query: '',
      level: 'Todos',
      bike: 'Todos',
      audience: 'Todos',
      sort: 'date',
      ...props,
    },
  })
}

describe('RideFilters', () => {
  it('renders the search field and the dropdowns with screen-reader-only labels', () => {
    const wrapper = mountFilters()

    // El buscador no muestra texto: solo la lupa y la etiqueta oculta.
    expect(wrapper.get('input[type="search"]').attributes('id')).toBe('ride-title-search')
    expect(wrapper.get('input[type="search"]').attributes('placeholder')).toBeUndefined()

    const selectIds = wrapper.findAll('select').map((select) => select.attributes('id'))
    expect(selectIds).toEqual([
      'ride-level-filter',
      'ride-bike-filter',
      'ride-audience-filter',
      'ride-sort-filter',
    ])

    const labels = wrapper.findAll('label')
    expect(labels.map((label) => label.text())).toEqual([
      'Buscar por título',
      'Nivel',
      'Tipo de bici',
      'Público',
      'Ordenar por',
    ])

    // Todas las etiquetas, incluida la de orden, viven dentro de su control (sr-only).
    for (const label of labels) {
      expect(label.classes()).toContain('sr-only')
    }
  })

  it('offers the participation filter only when the visitor has a session', async () => {
    const anonymous = mountFilters()
    expect(anonymous.text()).not.toContain('Participaré')

    const signedIn = mountFilters({ showParticipation: true, participating: false })
    expect(signedIn.text()).toContain('Participaré')

    await signedIn.get('input[type="checkbox"]').setValue(true)
    expect(signedIn.emitted('update:participating')?.[0]).toEqual([true])
  })

  it('emits the query while the user types', async () => {
    const wrapper = mountFilters()

    await wrapper.get('input[type="search"]').setValue('collserola')

    expect(wrapper.emitted('update:query')).toEqual([['collserola']])
  })

  it('emits the level, bike, audience and sort selections', async () => {
    const wrapper = mountFilters()
    const selects = wrapper.findAll('select')

    await selects[0]?.setValue('Intermedio')
    await selects[1]?.setValue('mtb')
    await selects[2]?.setValue('lgbt')
    await selects[3]?.setValue('distance')

    expect(wrapper.emitted('update:level')).toEqual([['Intermedio']])
    expect(wrapper.emitted('update:bike')).toEqual([['mtb']])
    expect(wrapper.emitted('update:audience')).toEqual([['lgbt']])
    expect(wrapper.emitted('update:sort')).toEqual([['distance']])
  })

  it('preselects the values received through the models', () => {
    const wrapper = mountFilters({
      query: 'collserola',
      level: 'Intermedio',
      bike: 'gravel',
      audience: 'women',
      sort: 'elevation',
    })

    expect(wrapper.get('input').element.value).toBe('collserola')

    const selectedLabels = wrapper.findAll('option:checked').map((option) => option.text())
    expect(selectedLabels).toEqual(['Intermedio', 'Gravel', 'Mujeres', 'Desnivel'])
  })

  it('folds the controls behind the mobile toggle and expands them on demand', async () => {
    const wrapper = mountFilters()

    const toggle = wrapper.get('button[aria-controls="ride-filters-panel"]')
    const panel = wrapper.get('#ride-filters-panel')

    expect(toggle.attributes('aria-expanded')).toBe('false')
    expect(panel.classes()).toContain('hidden')
    expect(toggle.text()).toContain('Filtros')

    await toggle.trigger('click')

    expect(toggle.attributes('aria-expanded')).toBe('true')
    expect(panel.classes()).toContain('grid')
    expect(panel.classes()).not.toContain('hidden')

    await toggle.trigger('click')

    expect(toggle.attributes('aria-expanded')).toBe('false')
    expect(panel.classes()).toContain('hidden')
  })

  it('counts the active filters on the mobile toggle', async () => {
    const wrapper = mountFilters({
      query: 'collserola',
      level: 'Intermedio',
    })

    const toggle = wrapper.get('button[aria-controls="ride-filters-panel"]')
    expect(toggle.text()).toContain('2 activos')

    await wrapper.get('input[type="search"]').setValue('')

    expect(toggle.text()).toContain('1 activo')
    expect(toggle.text()).not.toContain('2 activos')
  })
})
