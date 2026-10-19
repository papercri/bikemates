import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import RideAudienceBadge from '../RideAudienceBadge.vue'

describe('RideAudienceBadge', () => {
  it('renders the mapped label with an icon', () => {
    const wrapper = mount(RideAudienceBadge, { props: { audience: 'women' } })

    expect(wrapper.text()).toContain('Mujeres')
    expect(wrapper.find('svg').exists()).toBe(true)
  })

  it('renders the generic audience label', () => {
    const wrapper = mount(RideAudienceBadge, { props: { audience: 'everyone' } })

    expect(wrapper.text()).toContain('Todos')
    expect(wrapper.find('svg').exists()).toBe(true)
  })

  it('shows the pride flag for the lgbt audience', () => {
    const wrapper = mount(RideAudienceBadge, { props: { audience: 'lgbt' } })

    expect(wrapper.text()).toContain('Comunidad LGBT+')
    expect(wrapper.text()).toContain('🏳️‍🌈')
    expect(wrapper.find('svg').exists()).toBe(false)
  })
})
