import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import AuthCard from '../AuthCard.vue'

function mountCard(slot?: string) {
  return mount(AuthCard, {
    props: {
      title: 'Inicia sesión',
      description: 'Accede a tu cuenta de BikeMates.',
    },
    slots: slot === undefined ? {} : { default: slot },
  })
}

describe('AuthCard', () => {
  it('renders the title as the page heading', () => {
    const wrapper = mountCard()

    expect(wrapper.get('h1').text()).toBe('Inicia sesión')
  })

  it('renders the muted description under the title', () => {
    const wrapper = mountCard()

    expect(wrapper.text()).toContain('Accede a tu cuenta de BikeMates.')
  })

  it('renders the form content inside the card', () => {
    const wrapper = mountCard('<form data-stub="auth-form" />')

    expect(wrapper.find('[data-stub="auth-form"]').exists()).toBe(true)
    expect(wrapper.get('h1').text()).toBe('Inicia sesión')
  })

  it('keeps the card constrained to the shared auth width', () => {
    const wrapper = mountCard()

    expect(wrapper.get('.max-w-lg').classes()).toContain('mx-auto')
  })
})
