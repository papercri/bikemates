import { mount } from '@vue/test-utils'
import type { User } from '@supabase/supabase-js'
import { createPinia } from 'pinia'
import { expect, it } from 'vitest'
import { useAuthStore } from '@/features/auth/stores/authStore'
import AppFooter from '../AppFooter.vue'

const signedInUser: User = {
  id: 'user-1',
  aud: 'authenticated',
  email: 'ana@ejemplo.com',
  app_metadata: { provider: 'email' },
  user_metadata: {},
  identities: [],
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
}

function mountFooter() {
  const pinia = createPinia()

  return mount(AppFooter, {
    global: {
      plugins: [pinia],
      stubs: {
        RouterLink: {
          template: '<a><slot /></a>',
        },
      },
    },
  })
}

it('renders the dynamic copyright year and the privacy link', () => {
  const wrapper = mountFooter()

  const year = String(new Date().getFullYear())

  expect(wrapper.text()).toContain(`© ${year} BikeMates · Comparte rutas. Comparte kilómetros.`)
  expect(wrapper.text()).toContain('Política de privacidad')
})

it('offers the login link to guests', () => {
  const wrapper = mountFooter()

  const links = wrapper.findAll('a').map((link) => link.text())

  expect(links).toContain('Iniciar sesión')
})

it('hides the login link once the user has signed in', async () => {
  const wrapper = mountFooter()
  const authStore = useAuthStore()

  authStore.user = signedInUser

  await wrapper.vm.$nextTick()

  const links = wrapper.findAll('a').map((link) => link.text())

  expect(links).not.toContain('Iniciar sesión')
  expect(links).toContain('Explorar rutas')
})
