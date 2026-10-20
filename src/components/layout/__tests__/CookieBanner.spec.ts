import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import CookieBanner from '../CookieBanner.vue'

const STORAGE_KEY = 'bm-cookie-consent'

function mountBanner() {
  const wrapper = mount(CookieBanner)

  return wrapper
}

describe('CookieBanner', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('shows the dialog with its explanation on the first visit', async () => {
    const wrapper = mountBanner()
    await wrapper.vm.$nextTick()

    const dialog = wrapper.get('[role="dialog"]')

    expect(dialog.attributes('aria-label')).toBe('Aviso de cookies')
    expect(dialog.text()).toContain('Esta web utiliza cookies.')
    expect(wrapper.get('button').text()).toBe('Entendido')
  })

  it('hides the dialog and remembers the acceptance', async () => {
    const wrapper = mountBanner()
    await wrapper.vm.$nextTick()

    await wrapper.get('button').trigger('click')

    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)
    expect(localStorage.getItem(STORAGE_KEY)).toBe('accepted')
  })

  it('stays hidden on later visits once the preference is stored', async () => {
    localStorage.setItem(STORAGE_KEY, 'accepted')

    const wrapper = mountBanner()
    await wrapper.vm.$nextTick()

    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)
  })

  it('remounts hidden after the acceptance persisted in a previous session', async () => {
    const first = mountBanner()
    await first.vm.$nextTick()
    await first.get('button').trigger('click')
    first.unmount()

    const second = mountBanner()
    await second.vm.$nextTick()

    expect(second.find('[role="dialog"]').exists()).toBe(false)
  })
})
