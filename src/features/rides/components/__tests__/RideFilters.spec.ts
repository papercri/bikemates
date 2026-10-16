import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import RideFilters from '../RideFilters.vue'

function mountFilters() {
  return mount(RideFilters, {
    props: {
      query: '',
      level: 'Todos',
      audience: 'Todos',
    },
  })
}

describe('RideFilters', () => {
  it('renders a title search field and the two filter dropdowns', () => {
    const wrapper = mountFilters()

    expect(wrapper.get('input[type="search"]').attributes('id')).toBe('ride-title-search')

    const selectIds = wrapper.findAll('select').map((select) => select.attributes('id'))
    expect(selectIds).toEqual(['ride-level-filter', 'ride-audience-filter'])

    expect(wrapper.text()).toContain('Buscar')
    expect(wrapper.text()).toContain('Nivel')
    expect(wrapper.text()).toContain('Público')
  })

  it('emits the query while the user types', async () => {
    const wrapper = mountFilters()

    await wrapper.get('input[type="search"]').setValue('collserola')

    expect(wrapper.emitted('update:query')).toEqual([['collserola']])
  })

  it('emits the level and audience selections', async () => {
    const wrapper = mountFilters()
    const selects = wrapper.findAll('select')

    await selects[0]?.setValue('Intermedio')
    await selects[1]?.setValue('lgbt')

    expect(wrapper.emitted('update:level')).toEqual([['Intermedio']])
    expect(wrapper.emitted('update:audience')).toEqual([['lgbt']])
  })

  it('preselects the values received through the models', () => {
    const wrapper = mount(RideFilters, {
      props: { query: 'collserola', level: 'Intermedio', audience: 'women' },
    })

    expect(wrapper.get('input').element.value).toBe('collserola')

    const selectedLabels = wrapper.findAll('option:checked').map((option) => option.text())
    expect(selectedLabels).toEqual(['Intermedio', 'Mujeres'])
  })
})
