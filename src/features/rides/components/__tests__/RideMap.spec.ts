import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import L from 'leaflet'
import RideMap from '../RideMap.vue'

vi.mock('leaflet', () => {
  const setView = vi.fn(() => mapInstance)
  const remove = vi.fn()
  const addTo = vi.fn(() => markerInstance)
  const bindPopup = vi.fn(() => markerInstance)
  const setLatLng = vi.fn()
  const setPopupContent = vi.fn()

  const mapInstance = { setView, remove }
  const markerInstance = { addTo, bindPopup, setLatLng, setPopupContent }

  return {
    default: {
      map: vi.fn(() => mapInstance),
      tileLayer: vi.fn(() => ({ addTo: vi.fn() })),
      marker: vi.fn(() => markerInstance),
      divIcon: vi.fn(() => ({})),
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
