import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import IconEye from '../IconEye.vue'

describe('IconEye', () => {
  it('renders the open eye while the field is hidden', () => {
    const wrapper = mount(IconEye)

    expect(wrapper.get('circle').attributes('r')).toBe('3')
    expect(wrapper.get('svg').attributes('aria-hidden')).toBe('true')
  })

  it('renders the crossed eye while the field is visible', () => {
    const wrapper = mount(IconEye, { props: { hidden: false } })

    expect(wrapper.find('circle').exists()).toBe(false)
    expect(wrapper.findAll('path')[0]?.attributes('d')).toBe('M3 3l18 18')
  })
})
