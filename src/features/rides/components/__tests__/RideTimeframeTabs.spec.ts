import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import RideTimeframeTabs from '../RideTimeframeTabs.vue'

function mountTabs(timeframe: 'upcoming' | 'past' = 'upcoming') {
  return mount(RideTimeframeTabs, {
    props: { upcomingCount: 4, pastCount: 2, modelValue: timeframe },
  })
}

describe('RideTimeframeTabs', () => {
  it('renders both pages with their ride counts', () => {
    const wrapper = mountTabs()

    expect(wrapper.text()).toContain('Próximas')
    expect(wrapper.text()).toContain('(4)')
    expect(wrapper.text()).toContain('Pasadas')
    expect(wrapper.text()).toContain('(2)')
  })

  it('marks the active page through aria-pressed', () => {
    const wrapper = mountTabs('past')

    const buttons = wrapper.findAll('button')
    expect(buttons[0]?.attributes('aria-pressed')).toBe('false')
    expect(buttons[1]?.attributes('aria-pressed')).toBe('true')
  })

  it('emits the selected page when a button is clicked', async () => {
    const wrapper = mountTabs()

    await wrapper.findAll('button')[1]?.trigger('click')

    expect(wrapper.emitted('update:modelValue')).toEqual([['past']])
  })
})
