import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { RouterLinkStub } from '@vue/test-utils'
import type { Ride } from '../../types'
import RideCard from '../RideCard.vue'

function rideOf(overrides: Partial<Ride> = {}): Ride {
  const departure = new Date(2026, 5, 10, 9, 30)

  return {
    id: 'ride-1',
    organizerId: 'user-1',
    title: 'Vuelta por Collserola',
    description: 'Recorrido sencillo por pista forestal.',
    startsAt: departure.toISOString(),
    meetingPoint: 'Plaça de l’Església, Barcelona',
    latitude: 41.4,
    longitude: 2.17,
    bikeType: 'gravel',
    level: 'Intermedio',
    distanceKm: 30,
    elevationM: 300,
    durationMinutes: 120,
    imagePath: null,
    wikilocUrl: null,
    audience: 'everyone',
    maxParticipants: null,
    status: 'published',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    imageUrl: null,
    ...overrides,
  }
}

function mountCard(ride: Ride, past = false) {
  return mount(RideCard, {
    props: { ride, past },
    global: { stubs: { RouterLink: RouterLinkStub } },
  })
}

describe('RideCard', () => {
  it('links to the ride detail page', () => {
    const wrapper = mountCard(rideOf({ id: 'ride-42' }))

    const link = wrapper.getComponent(RouterLinkStub)
    expect(link.props('to')).toEqual({ name: 'ride-detail', params: { id: 'ride-42' } })
  })

  it('shows the title and the machine-readable short date', () => {
    const wrapper = mountCard(rideOf())

    expect(wrapper.get('h2').text()).toBe('Vuelta por Collserola')
    expect(wrapper.get('time').attributes('datetime')).toBe(rideOf().startsAt)
    expect(wrapper.get('time').text()).toContain('10/06')
  })

  it('leaves the key figures out of the card', () => {
    const wrapper = mountCard(rideOf())

    expect(wrapper.text()).not.toContain('+300')
    expect(wrapper.text()).not.toContain('300 m')
  })

  it('renders the compact calendar pill with the short date', () => {
    const wrapper = mountCard(rideOf())

    expect(wrapper.get('time').text()).toContain('10/06')
    expect(wrapper.text()).not.toContain('jun')
  })

  it('shows the level, bike type and audience badges', () => {
    const wrapper = mountCard(rideOf({ level: 'Avanzado', bikeType: 'mtb', audience: 'women' }))

    expect(wrapper.text()).toContain('Avanzado')
    expect(wrapper.text()).toContain('MTB')
    expect(wrapper.text()).toContain('Mujeres')
  })

  it('dims the card when the ride already happened', () => {
    const upcoming = mountCard(rideOf())
    const past = mountCard(rideOf(), true)

    expect(upcoming.get('article').classes()).not.toContain('opacity-75')
    expect(past.get('article').classes()).toContain('opacity-75')
  })

  it('prefers the ride image over the fallback cover', () => {
    const wrapper = mountCard(rideOf({ imageUrl: 'https://cdn.example/portada.jpg' }))

    expect(wrapper.get('img').attributes('src')).toBe('https://cdn.example/portada.jpg')
  })

  it('picks a stable fallback cover per ride id', () => {
    const first = mountCard(rideOf({ id: 'ride-abc' }))
    const second = mountCard(rideOf({ id: 'ride-abc' }))

    const cover = first.get('img').attributes('src')
    expect(cover).toMatch(/^\/photos\//)
    expect(second.get('img').attributes('src')).toBe(cover)
  })

  it('marks the cover as decorative and the link with a screen-reader label', () => {
    const wrapper = mountCard(rideOf())

    expect(wrapper.get('img').attributes('alt')).toBe('')
    expect(wrapper.get('img').attributes('aria-hidden')).toBe('true')
    expect(wrapper.text()).toContain('Ver detalles')
  })

  it('shows the "Participaré" badge only for rides the user joined', () => {
    const joined = mount(RideCard, {
      props: { ride: rideOf(), participating: true },
      global: { stubs: { RouterLink: RouterLinkStub } },
    })
    const notJoined = mountCard(rideOf())

    expect(joined.text()).toContain('Participaré')
    expect(notJoined.text()).not.toContain('Participaré')
  })
})
