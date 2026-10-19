import { describe, expect, it } from 'vitest'
import { buildRideShareLinks } from './rideShare'

const INPUT = {
  title: 'Vuelta por Collserola',
  url: 'https://bikemates.example/rides/ride-1',
}

describe('buildRideShareLinks', () => {
  it('returns the share targets in menu order', () => {
    const links = buildRideShareLinks(INPUT)

    expect(links.map((link) => link.target)).toEqual([
      'whatsapp',
      'telegram',
      'x',
      'facebook',
      'email',
    ])
    expect(links.map((link) => link.label)).toEqual([
      'WhatsApp',
      'Telegram',
      'X',
      'Facebook',
      'Correo electrónico',
    ])
  })

  it('builds a WhatsApp deep link with title and URL in the message', () => {
    const whatsapp = buildRideShareLinks(INPUT)[0]

    expect(whatsapp?.href).toBe(
      `https://wa.me/?text=${encodeURIComponent('Vuelta por Collserola https://bikemates.example/rides/ride-1')}`,
    )
  })

  it('builds Telegram, X and Facebook URLs with encoded parameters', () => {
    const byTarget = new Map(buildRideShareLinks(INPUT).map((link) => [link.target, link.href]))
    const encodedUrl = encodeURIComponent(INPUT.url)
    const encodedTitle = encodeURIComponent(INPUT.title)

    expect(byTarget.get('telegram')).toBe(
      `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
    )
    expect(byTarget.get('x')).toBe(
      `https://x.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    )
    expect(byTarget.get('facebook')).toBe(
      `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    )
  })

  it('builds a mailto link with subject and body', () => {
    const email = buildRideShareLinks(INPUT).at(-1)

    expect(email?.href).toBe(
      `mailto:?subject=${encodeURIComponent(INPUT.title)}&body=${encodeURIComponent(
        'Vuelta por Collserola\nhttps://bikemates.example/rides/ride-1',
      )}`,
    )
  })

  it('escapes special characters in the title', () => {
    const links = buildRideShareLinks({
      title: 'Salida 100% gravel, 8:00h',
      url: INPUT.url,
    })
    const whatsapp = links[0]

    expect(whatsapp?.href).toContain(encodeURIComponent('Salida 100% gravel, 8:00h'))
  })
})
