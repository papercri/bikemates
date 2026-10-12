import { mount } from '@vue/test-utils'
import { expect, it } from 'vitest'
import AppFooter from '../AppFooter.vue'

it('renders the dynamic copyright year and the privacy link', () => {
  const wrapper = mount(AppFooter, {
    global: {
      stubs: {
        RouterLink: {
          template: '<a><slot /></a>',
        },
      },
    },
  })

  const year = String(new Date().getFullYear())

  expect(wrapper.text()).toContain(`© ${year} BikeMates · Comparte rutas. Comparte kilómetros.`)
  expect(wrapper.text()).toContain('Política de privacidad')
})
