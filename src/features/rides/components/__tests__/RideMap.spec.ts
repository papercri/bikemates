import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import L from 'leaflet'
import RideMap from '../RideMap.vue'

vi.mock('leaflet', () => {
  type MarkerInstance = {
    addTo: () => MarkerInstance
    bindPopup: () => MarkerInstance
    setLatLng: () => void
    setPopupContent: () => void
  }

  type MapInstance = { setView: () => MapInstance; remove: () => void }

  const setView = vi.fn<MapInstance['setView']>()
  const remove = vi.fn<MapInstance['remove']>()
  const addTo = vi.fn<MarkerInstance['addTo']>()
  const bindPopup = vi.fn<MarkerInstance['bindPopup']>()
  const setLatLng = vi.fn<MarkerInstance['setLatLng']>()
  const setPopupContent = vi.fn<MarkerInstance['setPopupContent']>()

  const mapInstance: MapInstance = { setView, remove }
  const markerInstance: MarkerInstance = { addTo, bindPopup, setLatLng, setPopupContent }

  // Leaflet encadena `L.map(el).setView(...)` y devuelve el propio mapa; el
  // doble debe preservar ese contrato porque la vista guarda el resultado.
  addTo.mockImplementation(() => markerInstance)
  bindPopup.mockImplementation(() => markerInstance)
  setView.mockImplementation(() => mapInstance)

  return {
    default: {
      map: vi.fn<() => MapInstance>(() => mapInstance),
      tileLayer: vi.fn<() => { addTo: () => void }>(() => ({ addTo: vi.fn<() => void>() })),
      marker: vi.fn<() => MarkerInstance>(() => markerInstance),
      divIcon: vi.fn<() => Record<string, never>>(() => ({})),
      __mocks: { mapInstance, markerInstance },
    },
  }
})

type LeafletMocks = {
  map: ReturnType<typeof vi.fn>
  marker: ReturnType<typeof vi.fn>
  tileLayer: ReturnType<typeof vi.fn>
  divIcon: ReturnType<typeof vi.fn>
  __mocks: {
    mapInstance: { setView: ReturnType<typeof vi.fn>; remove: ReturnType<typeof vi.fn> }
    markerInstance: {
      addTo: ReturnType<typeof vi.fn>
      bindPopup: ReturnType<typeof vi.fn>
      setLatLng: ReturnType<typeof vi.fn>
      setPopupContent: ReturnType<typeof vi.fn>
    }
  }
}

const leaflet = L as unknown as LeafletMocks

function mountMap(props?: Record<string, unknown>) {
  return mount(RideMap, {
    props: {
      latitude: 41.7633,
      longitude: 1.8428,
      meetingPoint: 'Monistrol de Montserrat',
      ...props,
    },
  })
}

describe('RideMap', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('creates the map centred on the meeting point with the scroll wheel zoom off', () => {
    mountMap()

    expect(leaflet.map).toHaveBeenCalledWith(expect.any(HTMLDivElement), {
      scrollWheelZoom: false,
    })
    expect(leaflet.__mocks.mapInstance.setView).toHaveBeenCalledWith([41.7633, 1.8428], 13)
  })

  it('adds the tile layer and a marker with the meeting point as popup', () => {
    mountMap()

    expect(leaflet.tileLayer).toHaveBeenCalled()
    expect(leaflet.marker).toHaveBeenCalledWith([41.7633, 1.8428], { icon: expect.anything() })
    expect(leaflet.__mocks.markerInstance.bindPopup).toHaveBeenCalledWith('Monistrol de Montserrat')
  })

  it('exposes an accessible application role named after the meeting point', () => {
    const wrapper = mountMap()

    const container = wrapper.get('[role="application"]')
    expect(container.attributes('aria-label')).toBe(
      'Mapa del punto de encuentro: Monistrol de Montserrat',
    )
  })

  it('moves the marker and the map when the meeting point changes', async () => {
    const wrapper = mountMap()

    await wrapper.setProps({ latitude: 40.4, longitude: -3.7, meetingPoint: 'Madrid' })

    expect(leaflet.__mocks.markerInstance.setLatLng).toHaveBeenCalledWith([40.4, -3.7])
    expect(leaflet.__mocks.markerInstance.setPopupContent).toHaveBeenCalledWith('Madrid')
    expect(leaflet.__mocks.mapInstance.setView).toHaveBeenLastCalledWith([40.4, -3.7], 13)
  })

  it('removes the map instance on unmount', () => {
    const wrapper = mountMap()

    wrapper.unmount()

    expect(leaflet.__mocks.mapInstance.remove).toHaveBeenCalledTimes(1)
  })
})
