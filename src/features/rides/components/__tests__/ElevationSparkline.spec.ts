import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ElevationSparkline from '../ElevationSparkline.vue'

describe('ElevationSparkline', () => {
  it('is hidden from assistive technology', () => {
    const wrapper = mount(ElevationSparkline, {
      props: { distanceKm: 35, elevationM: 650 },
    })

    const svg = wrapper.get('svg')

    expect(svg.attributes('aria-hidden')).toBe('true')
    expect(svg.attributes('focusable')).toBe('false')
  })

  it('uses the card viewBox by default', () => {
    const wrapper = mount(ElevationSparkline, {
      props: { distanceKm: 35, elevationM: 650 },
    })

    expect(wrapper.get('svg').attributes('viewBox')).toBe('0 0 240 48')
  })

  it('uses a taller viewBox for the banner variant', () => {
    const wrapper = mount(ElevationSparkline, {
      props: { distanceKm: 85, elevationM: 1800, variant: 'banner' },
    })

    expect(wrapper.get('svg').attributes('viewBox')).toBe('0 0 240 96')
  })

  it('draws a polyline spanning the full width', () => {
    const wrapper = mount(ElevationSparkline, {
      props: { distanceKm: 35, elevationM: 650 },
    })

    const points = wrapper.get('polyline').attributes('points') ?? ''
    const coordinates = points.split(' ')

    expect(coordinates).toHaveLength(29)
    expect(coordinates[0]?.startsWith('0.0,')).toBe(true)
    expect(coordinates[coordinates.length - 1]?.startsWith('240.0,')).toBe(true)
    expect(wrapper.get('polyline').attributes('fill')).toBe('none')
  })

  it('uses a denser polyline for the banner variant', () => {
    const wrapper = mount(ElevationSparkline, {
      props: { distanceKm: 85, elevationM: 1800, variant: 'banner' },
    })

    const points = wrapper.get('polyline').attributes('points') ?? ''

    expect(points.split(' ')).toHaveLength(57)
  })

  it('closes the gradient area path along the baseline', () => {
    const wrapper = mount(ElevationSparkline, {
      props: { distanceKm: 35, elevationM: 650 },
    })

    const area = wrapper.get('path').attributes('d') ?? ''

    expect(area.startsWith('M0,48')).toBe(true)
    expect(area.endsWith('L240,48 Z')).toBe(true)
    expect(wrapper.get('path').attributes('fill')).toMatch(/^url\(#elev-fill-/)
  })

  it('produces a stable shape for the same input', () => {
    const props = { distanceKm: 35, elevationM: 650 }
    const first = mount(ElevationSparkline, { props })
    const second = mount(ElevationSparkline, { props })

    expect(first.get('polyline').attributes('points')).toBe(
      second.get('polyline').attributes('points'),
    )
  })
})
