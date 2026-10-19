import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import BrandLogo from '../BrandLogo.vue'

describe('BrandLogo', () => {
  it('renders the full mark by default, hidden from assistive technology', () => {
    const wrapper = mount(BrandLogo)

    const svg = wrapper.get('svg')

    expect(svg.classes()).toContain('h-7')
    expect(svg.classes()).toContain('w-11')
    expect(svg.attributes('aria-hidden')).toBe('true')
    expect(svg.attributes('focusable')).toBe('false')
  })

  it('paints the brand dot on the full mark', () => {
    const wrapper = mount(BrandLogo)

    expect(wrapper.html()).toContain('var(--color-trail)')
  })

  it('renders the simple bike mark with its own proportions', () => {
    const wrapper = mount(BrandLogo, { props: { variant: 'simple' } })

    const svg = wrapper.get('svg')

    expect(svg.classes()).toContain('h-9')
    expect(svg.classes()).toContain('w-12')
    expect(svg.attributes('aria-hidden')).toBe('true')
    expect(wrapper.html()).not.toContain('var(--color-trail)')
  })
})
