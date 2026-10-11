import { mount } from '@vue/test-utils'
import { expect, it } from 'vitest'
import App from '../App.vue'

it('renders the application shell', () => {
  const wrapper = mount(App, {
    global: {
      stubs: {
        RouterView: {
          template: '<div data-testid="router-view"></div>',
        },
      },
    },
  })

  expect(wrapper.find('[data-testid="router-view"]').exists()).toBe(true)
})
