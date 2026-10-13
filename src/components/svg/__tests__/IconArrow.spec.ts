import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import IconArrow from '../IconArrow.vue'

describe('IconArrow', () => {
  it('renders a right arrow by default', () => {
    const wrapper = mount(IconArrow)

    expect(wrapper.get('svg').attributes('viewBox')).toBe('0 0 16 16')
    expect(wrapper.get('path').attributes('d')).toBe('M3 8 H12 M8.5 3.5 L13 8 L8.5 12.5')
    expect(wrapper.get('svg').attributes('aria-hidden')).toBe('true')
  })

  it('mirrors the arrow when the direction is left', () => {
    const wrapper = mount(IconArrow, { props: { direction: 'left' } })

    expect(wrapper.get('path').attributes('d')).toBe('M13 8 H4 M7.5 3.5 L3 8 L7.5 12.5')
  })
})
