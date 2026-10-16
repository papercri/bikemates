import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Typography from '../Typography.vue'

describe('Typography', () => {
  it('renders a paragraph by default', () => {
    const wrapper = mount(Typography, { slots: { default: 'Texto de ejemplo' } })

    expect(wrapper.element.tagName).toBe('P')
    expect(wrapper.text()).toBe('Texto de ejemplo')
  })

  it('renders the requested element', () => {
    const wrapper = mount(Typography, {
      props: { as: 'h2', variant: 'heading-sm' },
      slots: { default: 'Título' },
    })

    expect(wrapper.element.tagName).toBe('H2')
  })

  it('applies the variant classes', () => {
    const wrapper = mount(Typography, {
      props: { variant: 'heading-xl' },
      slots: { default: 'Título' },
    })

    expect(wrapper.classes()).toContain('text-3xl')
    expect(wrapper.classes()).toContain('font-bold')
  })

  it('applies the tone classes', () => {
    const wrapper = mount(Typography, {
      props: { tone: 'muted' },
      slots: { default: 'Secundario' },
    })

    expect(wrapper.classes()).toContain('text-graphite')
  })

  it('combines variant and tone', () => {
    const wrapper = mount(Typography, {
      props: { variant: 'numeric-md', tone: 'accent' },
      slots: { default: '650' },
    })

    expect(wrapper.classes()).toContain('font-display')
    expect(wrapper.classes()).toContain('tabular-nums')
    expect(wrapper.classes()).toContain('text-trail-ink')
  })

  it('renders a neutral body text without extra classes by default', () => {
    const wrapper = mount(Typography, { slots: { default: 'Cuerpo' } })

    expect(wrapper.classes()).toEqual([])
  })
})
