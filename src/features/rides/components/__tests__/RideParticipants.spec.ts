import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { RouterLinkStub } from '@vue/test-utils'
import { nextTick } from 'vue'
import type { RideParticipant } from '../../types'
import RideParticipants from '../RideParticipants.vue'

const participants: RideParticipant[] = [
  { id: 'user-1', displayName: 'Cristiana Sollini', avatarUrl: null, isOrganizer: true },
  {
    id: 'user-2',
    displayName: 'Marc',
    avatarUrl: 'https://cdn.example/marc.png',
    isOrganizer: false,
  },
]

function mountParticipants(props?: Record<string, unknown>, attachToBody = false) {
  return mount(RideParticipants, {
    props: {
      participants: [],
      isLoading: false,
      errorMessage: null,
      isAuthenticated: true,
      currentUserId: 'user-1',
      isSubmitting: false,
      ...props,
    },
    global: { stubs: { RouterLink: RouterLinkStub } },
    ...(attachToBody ? { attachTo: document.body } : {}),
  })
}

/** El ConfirmDialog se teletransporta a body: hay que consultarlo en el documento. */
function dialog() {
  return document.querySelector('[role="dialog"]')
}

describe('RideParticipants', () => {
  it('pluralises the participant count and announces it politely', () => {
    const single = mountParticipants({ participants: [participants[1]!] })
    const many = mountParticipants({ participants })

    expect(single.text()).toContain('1 ciclista')
    expect(many.text()).toContain('2 ciclistas')
    expect(many.get('[aria-live="polite"]').text()).toContain('2 ciclistas')
  })

  it('shows the join CTA to anonymous visitors and opens the access dialog', async () => {
    const wrapper = mountParticipants({ isAuthenticated: false }, true)

    expect(wrapper.text()).toContain('Participar en esta ruta')

    const cta = wrapper
      .findAll('button')
      .find((button) => button.text().includes('Participar en esta ruta'))
    await cta!.trigger('click')
    await nextTick()

    const modal = document.querySelector('[role="dialog"]')
    expect(modal?.textContent).toContain('Inicia sesión para participar')
    expect(modal?.querySelector('[data-dialog-login]')).not.toBeNull()
    expect(modal?.querySelector('[data-dialog-register]')).not.toBeNull()

    // El diálogo se teletransporta a body: se desmonta para no dejarlo en el documento.
    wrapper.unmount()
  })

  it('shows no join CTA to a visitor who already participates', () => {
    const wrapper = mountParticipants({ participants, currentUserId: 'user-1' })

    expect(wrapper.text()).not.toContain('Participar en esta ruta')
  })

  it('offers the join CTA to the organizer when they have not joined yet', () => {
    const wrapper = mountParticipants({ participants: [], currentUserId: 'user-1' })

    expect(wrapper.text()).toContain('Participar en esta ruta')
  })

  it('keeps the join CTA disabled until the community rules are accepted', async () => {
    const wrapper = mountParticipants({ currentUserId: 'user-3' })

    const joinButton = () =>
      wrapper
        .findAll('button')
        .find((button) => /Participar en esta ruta|Inscribiendo/.test(button.text()))

    expect(joinButton()?.attributes('disabled')).toBeDefined()

    await wrapper.get('input[type="checkbox"]').setValue(true)
    expect(joinButton()?.attributes('disabled')).toBeUndefined()

    await joinButton()!.trigger('click')
    expect(wrapper.emitted('join')).toHaveLength(1)
  })

  it('disables the join button while submitting, loading or in error', () => {
    const submitting = mountParticipants({ currentUserId: 'user-3', isSubmitting: true })
    const loading = mountParticipants({ currentUserId: 'user-3', isLoading: true })
    const failing = mountParticipants({ currentUserId: 'user-3', errorMessage: 'Error' })

    const joinButtonOf = (wrapper: ReturnType<typeof mountParticipants>) =>
      wrapper
        .findAll('button')
        .find((button) => /Participar en esta ruta|Inscribiendo/.test(button.text()))

    expect(joinButtonOf(submitting)?.attributes('disabled')).toBeDefined()
    expect(joinButtonOf(loading)?.attributes('disabled')).toBeDefined()
    expect(joinButtonOf(failing)?.attributes('disabled')).toBeDefined()
  })

  it('shows the loading, error and empty states in order', () => {
    const loading = mountParticipants({ isLoading: true })
    expect(loading.get('[role="status"]').text()).toContain('Cargando participantes…')

    const failing = mountParticipants({ errorMessage: 'No se pudieron cargar los participantes.' })
    expect(failing.get('[role="alert"]').text()).toBe('No se pudieron cargar los participantes.')

    const empty = mountParticipants()
    expect(empty.text()).toContain('Todavía no hay ciclistas inscritos en esta ruta.')
  })

  it('renders avatars or initials and the organizer badge', () => {
    const wrapper = mountParticipants({ participants, currentUserId: 'user-3' })

    const avatar = wrapper.get('img')
    expect(avatar.attributes('src')).toBe('https://cdn.example/marc.png')
    expect(avatar.attributes('alt')).toBe('Foto de Marc')

    expect(wrapper.text()).toContain('CS')
    expect(wrapper.text()).toContain('Cristiana Sollini')
    expect(wrapper.text()).toContain('Organizador')
  })

  it('opens the leave dialog from the current user row and emits leave on confirm', async () => {
    const wrapper = mountParticipants({ participants }, true)

    await wrapper.get('button[aria-label="Dejar de participar"]').trigger('click')
    await wrapper.vm.$nextTick()

    expect(dialog()?.textContent).toContain('¿Dejar de participar?')

    document.querySelector<HTMLElement>('[data-dialog-confirm]')?.click()
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('leave')).toHaveLength(1)
    expect(dialog()).toBeNull()

    wrapper.unmount()
  })

  it('closes the leave dialog without leaving on cancel', async () => {
    const wrapper = mountParticipants({ participants }, true)

    await wrapper.get('button[aria-label="Dejar de participar"]').trigger('click')
    await wrapper.vm.$nextTick()

    document.querySelector<HTMLElement>('[data-dialog-cancel]')?.click()
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('leave')).toBeUndefined()
    expect(dialog()).toBeNull()

    wrapper.unmount()
  })

  it('does not open the leave dialog while a submission is running', async () => {
    const wrapper = mountParticipants({ participants, isSubmitting: true }, true)

    const leaveButton = wrapper.get('button[aria-label="Dejar de participar"]')
    expect(leaveButton.attributes('disabled')).toBeDefined()

    await leaveButton.trigger('click')
    await wrapper.vm.$nextTick()

    expect(dialog()).toBeNull()

    wrapper.unmount()
  })

  it('does not offer leaving to users outside the participant list', () => {
    const wrapper = mountParticipants({ participants, currentUserId: 'user-3' })

    expect(wrapper.find('button[aria-label="Dejar de participar"]').exists()).toBe(false)
  })
})
