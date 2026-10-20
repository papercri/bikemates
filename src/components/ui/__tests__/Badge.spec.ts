import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Badge from '../Badge.vue'

describe('Badge', () => {
  it('renders the slot content', () => {
    const wrapper = mount(Badge, { slots: { default: 'Intermedio' } })

    expect(wrapper.text()).toBe('Intermedio')
  })

  it('uses the soft trail combination by default', () => {
    const wrapper = mount(Badge, { slots: { default: 'Intermedio' } })

    expect(wrapper.classes()).toContain('bg-trail/15')
    expect(wrapper.classes()).toContain('text-trail-ink')
  })

  it('applies the compound classes for the selected color', () => {
    const wrapper = mount(Badge, {
      props: { variant: 'soft', color: 'route' },
      slots: { default: 'Intermedio' },
    })

    expect(wrapper.classes()).toContain('bg-route/15')
    expect(wrapper.classes()).toContain('text-ink')
  })

  it('applies muted surface classes for the muted variant', () => {
    const wrapper = mount(Badge, {
      props: { variant: 'muted', color: 'ink' },
      slots: { default: 'Avanzado' },
    })

    expect(wrapper.classes()).toContain('bg-surface')
    expect(wrapper.classes()).toContain('text-graphite')
  })

  it('renders a decorative dot with the level color', () => {
    const wrapper = mount(Badge, {
      props: { color: 'route', dot: true },
      slots: { default: 'Intermedio' },
    })

    const dot = wrapper.find('[aria-hidden="true"]')

    expect(dot.exists()).toBe(true)
    expect(dot.classes()).toContain('bg-route')
  })

  it('keeps the level hue for the dot on the inverse variant', () => {
    const wrapper = mount(Badge, {
      props: { variant: 'inverse', color: 'green', dot: true },
      slots: { default: 'Iniciación' },
    })

    const dot = wrapper.find('[aria-hidden="true"]')

    expect(dot.exists()).toBe(true)
    expect(dot.classes()).toContain('bg-level-easy')
  })

  it('falls back to a light dot for monochrome colors on the inverse variant', () => {
    const wrapper = mount(Badge, {
      props: { variant: 'inverse', color: 'trail', dot: true },
      slots: { default: 'Iniciación' },
    })

    const dot = wrapper.find('[aria-hidden="true"]')

    expect(dot.classes()).toContain('bg-canvas')
    expect(dot.classes()).not.toContain('bg-trail')
  })

  it('omits the dot by default', () => {
    const wrapper = mount(Badge, { slots: { default: 'Intermedio' } })

    expect(wrapper.find('[aria-hidden="true"]').exists()).toBe(false)
  })
})
