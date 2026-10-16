import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import RideFilters from '../RideFilters.vue'

function mountFilters(props?: Record<string, unknown>) {
  return mount(RideFilters, {
    props: {
      query: '',
      level: 'Todos',
      audience: 'Todos',
      sort: 'date',
      ...props,
    },
  })
}

describe('RideFilters', () => {
  it('renders the search field and the three dropdowns with screen-reader-only labels', () => {
    const wrapper = mountFilters()

    expect(wrapper.get('input[type="search"]').attributes('id')).toBe('ride-title-search')
    expect(wrapper.get('input[type="search"]').attributes('placeholder')).toBe('Buscar por título')

    const selectIds = wrapper.findAll('select').map((select) => select.attributes('id'))
    expect(selectIds).toEqual(['ride-level-filter', 'ride-audience-filter', 'ride-sort-filter'])

    const labels = wrapper.findAll('label')
    expect(labels.map((label) => label.text())).toEqual([
      'Buscar por título',
      'Nivel',
      'Público',
      'Ordenar',
    ])
    for (const label of labels) {
      expect(label.classes()).toContain('sr-only')
    }
  })

  it('emits the query while the user types', async () => {
    const wrapper = mountFilters()

    await wrapper.get('input[type="search"]').setValue('collserola')

    expect(wrapper.emitted('update:query')).toEqual([['collserola']])
  })

  it('emits the level, audience and sort selections', async () => {
    const wrapper = mountFilters()
    const selects = wrapper.findAll('select')

    await selects[0]?.setValue('Intermedio')
    await selects[1]?.setValue('lgbt')
    await selects[2]?.setValue('distance')

    expect(wrapper.emitted('update:level')).toEqual([['Intermedio']])
    expect(wrapper.emitted('update:audience')).toEqual([['lgbt']])
    expect(wrapper.emitted('update:sort')).toEqual([['distance']])
  })

  it('preselects the values received through the models', () => {
    const wrapper = mountFilters({
      query: 'collserola',
      level: 'Intermedio',
      audience: 'women',
      sort: 'elevation',
    })

    expect(wrapper.get('input').element.value).toBe('collserola')

    const selectedLabels = wrapper.findAll('option:checked').map((option) => option.text())
    expect(selectedLabels).toEqual(['Intermedio', 'Mujeres', 'Por desnivel'])
  })
})
