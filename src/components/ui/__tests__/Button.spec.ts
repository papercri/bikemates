import { RouterLinkStub, mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Button from '../Button.vue'

describe('Button', () => {
  it('renders a native button with the default type', () => {
    const wrapper = mount(Button, { slots: { default: 'Enviar' } })

    expect(wrapper.find('button').exists()).toBe(true)
    expect(wrapper.attributes('type')).toBe('button')
    expect(wrapper.text()).toBe('Enviar')
  })

  it('respects the type prop', () => {
    const wrapper = mount(Button, {
      props: { type: 'submit' },
      slots: { default: 'Enviar' },
    })

    expect(wrapper.attributes('type')).toBe('submit')
  })

  it('is disabled and marked busy while loading', () => {
    const wrapper = mount(Button, {
      props: { loading: true },
      slots: { default: 'Enviando…' },
    })

    expect(wrapper.attributes('disabled')).toBeDefined()
    expect(wrapper.attributes('aria-busy')).toBe('true')
  })

  it('is disabled when the disabled prop is set', () => {
    const wrapper = mount(Button, { props: { disabled: true } })

    expect(wrapper.attributes('disabled')).toBeDefined()
    expect(wrapper.attributes('aria-busy')).toBeUndefined()
  })

  it('stretches to full width when block is set', () => {
    const wrapper = mount(Button, { props: { block: true } })

    expect(wrapper.classes()).toContain('w-full')
  })

  it('does not stretch by default', () => {
    const wrapper = mount(Button)

    expect(wrapper.classes()).not.toContain('w-full')
  })

  it('omits size padding for the link variant', () => {
    const wrapper = mount(Button, { props: { variant: 'link' } })

    expect(wrapper.classes()).toContain('text-trail-ink')
    expect(wrapper.classes()).not.toContain('px-5')
  })

  it('renders the primary variant with readable brand colors', () => {
    const wrapper = mount(Button, { props: { variant: 'primary' } })

    expect(wrapper.classes()).toContain('bg-trail')
    expect(wrapper.classes()).toContain('text-white')
    expect(wrapper.classes()).not.toContain('text-ink')
  })

  it('renders the sun variants for dark surfaces', () => {
    const sun = mount(Button, { props: { variant: 'sun' } })

    expect(sun.classes()).toContain('bg-canvas')
    expect(sun.classes()).toContain('text-ink')

    const sunOutline = mount(Button, { props: { variant: 'sun-outline' } })

    expect(sunOutline.classes()).toContain('text-canvas')
    expect(sunOutline.classes()).toContain('border-canvas/70')
    expect(sunOutline.classes()).not.toContain('bg-canvas')
  })

  it('renders a router link when to is provided', () => {
    const to = { name: 'rides' }
    const wrapper = mount(Button, {
      props: { to },
      slots: { default: 'Explorar rutas' },
      global: { stubs: { RouterLink: RouterLinkStub } },
    })

    const link = wrapper.findComponent(RouterLinkStub)

    expect(link.exists()).toBe(true)
    expect(link.props('to')).toEqual(to)
    expect(wrapper.find('button').exists()).toBe(false)
  })

  it('renders an anchor when href is provided', () => {
    const wrapper = mount(Button, {
      props: { href: 'https://example.com' },
      slots: { default: 'Documentación' },
    })

    const anchor = wrapper.find('a')

    expect(anchor.exists()).toBe(true)
    expect(anchor.attributes('href')).toBe('https://example.com')
  })
})
