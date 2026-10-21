import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { GeocodingResult } from '../../services/geocodingService'
import MeetingPointPicker from '../MeetingPointPicker.vue'

const mocks = vi.hoisted(() => ({
  searchPlaces: vi.fn<(query: string, signal?: AbortSignal) => Promise<GeocodingResult[]>>(),
}))

vi.mock('@/features/rides/services/geocodingService', () => ({
  searchPlaces: mocks.searchPlaces,
}))

const place: GeocodingResult = {
  id: '123',
  label: 'Monistrol de Montserrat, Barcelona',
  latitude: 41.7633,
  longitude: 1.8428,
}

function mountPicker(initialValue?: string) {
  return mount(MeetingPointPicker, {
    props: initialValue === undefined ? {} : { initialValue },
  })
}

describe('MeetingPointPicker', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the field, the help text and the search button', () => {
    const wrapper = mountPicker()

    expect(wrapper.get('label[for="meeting-point-search"]').text()).toBe('Punto de encuentro')
    expect(wrapper.get('#meeting-point-help').text()).toContain('Busca un lugar')
    expect(wrapper.get('button').text()).toBe('Buscar')
  })

  it('keeps the search disabled until the query has three characters', async () => {
    const wrapper = mountPicker()

    expect(wrapper.get('button').attributes('disabled')).toBeDefined()

    await wrapper.get('input').setValue('ab')
    expect(wrapper.get('button').attributes('disabled')).toBeDefined()

    await wrapper.get('input').setValue('abc')
    expect(wrapper.get('button').attributes('disabled')).toBeUndefined()
  })

  it('searches on demand and lists the returned places', async () => {
    mocks.searchPlaces.mockResolvedValue([place])

    const wrapper = mountPicker()
    await wrapper.get('input').setValue('Monistrol')
    await wrapper.get('button').trigger('click')
    await flushPromises()

    const results = wrapper.get('ul[aria-label="Resultados de lugares"]')
    expect(results.text()).toContain(place.label)
  })

  it('emits the selected place and shows its coordinates', async () => {
    mocks.searchPlaces.mockResolvedValue([place])

    const wrapper = mountPicker()
    await wrapper.get('input').setValue('Monistrol')
    await wrapper.get('button').trigger('click')
    await flushPromises()

    await wrapper.get('ul button').trigger('click')

    // Escribir la búsqueda limpia la selección previa (null) y elegir un
    // resultado vuelve a avisar al formulario con el lugar.
    expect(wrapper.emitted('select')).toEqual([[null], [place]])
    expect(wrapper.get('[role="status"]').text()).toContain('Lugar seleccionado')
    expect(wrapper.get('[role="status"]').text()).toContain('41.76330, 1.84280')
  })

  it('shows the error reported by the search', async () => {
    mocks.searchPlaces.mockResolvedValue([])

    const wrapper = mountPicker()
    await wrapper.get('input').setValue('Inexistente')
    await wrapper.get('button').trigger('click')
    await flushPromises()

    expect(wrapper.get('[role="alert"]').text()).toBe('No se han encontrado lugares.')
  })

  it('clears the selection and warns the form when the query is edited by hand', async () => {
    mocks.searchPlaces.mockResolvedValue([place])

    const wrapper = mountPicker()
    await wrapper.get('input').setValue('Monistrol')
    await wrapper.get('button').trigger('click')
    await flushPromises()
    await wrapper.get('ul button').trigger('click')

    await wrapper.get('input').setValue('Barcelona')

    expect(wrapper.emitted('select')).toEqual([[null], [place], [null]])
    expect(wrapper.find('[role="status"]').exists()).toBe(false)
  })

  it('does not clear the selection when the query matches the selected label', async () => {
    mocks.searchPlaces.mockResolvedValue([place])

    const wrapper = mountPicker()
    await wrapper.get('input').setValue('Monistrol')
    await wrapper.get('button').trigger('click')
    await flushPromises()
    await wrapper.get('ul button').trigger('click')

    await wrapper.get('input').setValue(place.label)

    // El watcher ignora el cambio producido por la propia selección.
    expect(wrapper.emitted('select')).toEqual([[null], [place]])
    expect(wrapper.find('[role="status"]').exists()).toBe(true)
  })
})
