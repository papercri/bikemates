import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import AppPage from '../AppPage.vue'

function mountPage(props?: Record<string, unknown>, slot?: string) {
  return mount(AppPage, {
    props,
    slots: slot === undefined ? {} : { default: slot },
    global: {
      stubs: {
        AppHeader: { template: '<header data-stub="header" />' },
        AppFooter: { template: '<footer data-stub="footer" />' },
      },
    },
  })
}

describe('AppPage', () => {
  it('composes the page shell with header, main landmark and footer', () => {
    const wrapper = mountPage(undefined, '<p>Contenido</p>')

    expect(wrapper.find('[data-stub="header"]').exists()).toBe(true)
    expect(wrapper.find('[data-stub="footer"]').exists()).toBe(true)

    const main = wrapper.get('main')
    expect(main.attributes('id')).toBe('main-content')
    expect(main.text()).toContain('Contenido')
  })

  it('offers a skip link that targets the main landmark', () => {
    const wrapper = mountPage()

    const skipLink = wrapper.get('a[href="#main-content"]')

    expect(skipLink.text()).toBe('Saltar al contenido')
    expect(skipLink.classes()).toContain('sr-only')
  })

  it('centres the content in the shared container by default', () => {
    const wrapper = mountPage()

    const classes = wrapper.get('main').classes()

    expect(classes).toContain('mx-auto')
    expect(classes).toContain('max-w-7xl')
    expect(classes).toContain('py-12')
  })

  it('switches the horizontal padding and width when it bleeds', () => {
    const wrapper = mountPage({ bleed: true })

    const classes = wrapper.get('main').classes()

    expect(classes).not.toContain('mx-auto')
    expect(classes).not.toContain('max-w-7xl')
    expect(classes).toContain('w-full')
  })

  it('applies the requested vertical rhythm', () => {
    expect(mountPage({ spacing: 'none' }).get('main').classes()).not.toContain('py-12')
    expect(mountPage({ spacing: 'compact' }).get('main').classes()).toContain('py-8')
    expect(mountPage({ spacing: 'default' }).get('main').classes()).toContain('py-12')
  })

  it('keeps the flex-1 growth rule in every configuration', () => {
    expect(mountPage({ bleed: true, spacing: 'compact' }).get('main').classes()).toContain('flex-1')
  })
})
