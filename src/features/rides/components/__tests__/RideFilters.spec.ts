import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import RideFilters from '../RideFilters.vue'

/** Abre el combo de la posición indicada y elige una de sus opciones. */
async function chooseOption(
  wrapper: ReturnType<typeof mountFilters>,
  index: number,
  optionLabel: string,
): Promise<void> {
  await wrapper.findAll('button[aria-haspopup="menu"]')[index]!.trigger('click')

  const option = wrapper
    .findAll('[role="menuitemradio"]')
    .find((item) => item.text().includes(optionLabel))

  await option!.trigger('click')
}

function mountFilters(props?: Record<string, unknown>) {
  return mount(RideFilters, {
    props: {
      query: '',
      level: 'Todos',
      bike: 'Todos',
      audience: 'Todos',
      sort: 'default',
      ...props,
    },
  })
}

describe('RideFilters', () => {
  it('renders the search field and the filter combo boxes', () => {
    const wrapper = mountFilters()

    // El buscador no muestra texto: solo la lupa y la etiqueta oculta.
    expect(wrapper.get('input[type="search"]').attributes('id')).toBe('ride-title-search')
    expect(wrapper.get('input[type="search"]').attributes('placeholder')).toBeUndefined()
    expect(wrapper.get('label').text()).toBe('Buscar por título')
    expect(wrapper.get('label').classes()).toContain('sr-only')

    // Cada combo expone su campo y su valor actual en el nombre accesible.
    const triggers = wrapper.findAll('button[aria-haspopup="menu"]')
    expect(triggers.map((trigger) => trigger.attributes('aria-label'))).toEqual([
      'Nivel: Todos los niveles',
      'Tipo de bici: Todos los tipos de bici',
      'Público: Todos los públicos',
      'Ordenar por',
    ])
    expect(wrapper.findAll('svg').length).toBeGreaterThan(0)
  })

  it('offers the participation filter only when the visitor has a session', async () => {
    const anonymous = mountFilters()
    expect(anonymous.find('button[aria-label="Voy"]').exists()).toBe(false)

    const signedIn = mountFilters({ showParticipation: true, participating: false })
    const toggle = signedIn.get('button[aria-label="Voy"]')
    expect(toggle.attributes('aria-pressed')).toBe('false')

    await toggle.trigger('click')
    expect(signedIn.emitted('update:participating')?.[0]).toEqual([true])

    await signedIn.setProps({ participating: true })
    expect(signedIn.get('button[aria-label="Voy"]').attributes('aria-pressed')).toBe('true')
  })

  it('emits the query while the user types', async () => {
    const wrapper = mountFilters()

    await wrapper.get('input[type="search"]').setValue('collserola')

    expect(wrapper.emitted('update:query')).toEqual([['collserola']])
  })

  it('emits the level, bike, audience and sort selections', async () => {
    const wrapper = mountFilters()

    await chooseOption(wrapper, 0, 'Moderado')
    await chooseOption(wrapper, 1, 'Gravel')
    await chooseOption(wrapper, 2, 'LGBT')
    await chooseOption(wrapper, 3, 'Distancia')

    expect(wrapper.emitted('update:level')).toEqual([['Intermedio']])
    expect(wrapper.emitted('update:bike')).toEqual([['gravel']])
    expect(wrapper.emitted('update:audience')).toEqual([['lgbt']])
    expect(wrapper.emitted('update:sort')).toEqual([['distance']])
  })

  it('marks the current value with aria-checked inside the menu', async () => {
    const wrapper = mountFilters({ level: 'Intermedio' })

    await wrapper.findAll('button[aria-haspopup="menu"]')[0]!.trigger('click')

    const items = wrapper.findAll('[role="menuitemradio"]')
    const checked = items.filter((item) => item.attributes('aria-checked') === 'true')

    expect(checked).toHaveLength(1)
    expect(checked[0]!.text()).toContain('Moderado')
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

    const triggers = wrapper.findAll('button[aria-haspopup="menu"]')
    expect(triggers.map((trigger) => trigger.text())).toEqual([
      'Moderado',
      'Gravel',
      'Mujeres',
      'Desnivel',
    ])
    expect(triggers[0]!.attributes('aria-label')).toBe('Nivel: Moderado')
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
