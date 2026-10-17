import { RouterLinkStub, mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import RideCard from '../RideCard.vue'
import Badge from '@/components/ui/Badge.vue'
import { mockRides } from '@/features/rides/data/mockRides'

const ride = mockRides[0]

if (!ride) {
  throw new Error('No ride fixtures available')
}

function mountRideCard() {
  return mount(RideCard, {
    props: { ride: ride! },
    global: { stubs: { RouterLink: RouterLinkStub } },
  })
}

describe('RideCard', () => {
  it('renders the ride title', () => {
    const wrapper = mountRideCard()

    expect(wrapper.get('h2').text()).toBe(ride.title)
  })

  it('renders the distance and elevation figures', () => {
    const wrapper = mountRideCard()
    const text = wrapper.text()

    expect(text).toContain(String(ride.distanceKm))
    expect(text).toContain(String(ride.elevationM))
    expect(text).toContain('km')
    expect(text).toContain('m')
  })

  it('labels the ride level with its mapped badge color', () => {
    const wrapper = mountRideCard()
    const badge = wrapper.findComponent(Badge)

    expect(badge.text()).toBe(ride.level)
    expect(badge.classes()).toContain('bg-ink/55')
  })

  it('links to the ride detail route', () => {
    const wrapper = mountRideCard()
    const link = wrapper.findComponent(RouterLinkStub)

    expect(link.props('to')).toEqual({ name: 'ride-detail', params: { id: ride.id } })
    expect(link.text()).toContain('Ver detalles')
  })

  it('renders as an accessible article', () => {
    const wrapper = mountRideCard()

    expect(wrapper.find('article').exists()).toBe(true)
  })
})
