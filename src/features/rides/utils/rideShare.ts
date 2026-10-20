/** Destinos de compartir soportados; el orden define el orden del menú. */
export type RideShareTarget = 'whatsapp' | 'telegram' | 'x' | 'facebook' | 'gmail' | 'email'

export interface RideShareInput {
  /** Título de la salida, usado como mensaje o asunto del enlace. */
  title: string
  /** URL absoluta de la página de detalle de la salida. */
  url: string
}

export interface RideShareLink {
  target: RideShareTarget
  label: string
  href: string
}

/** Enlace directo de WhatsApp con el texto ya codificado. */
function buildWhatsappUrl({ title, url }: RideShareInput): string {
  const message = `${title} ${url}`
  return `https://wa.me/?text=${encodeURIComponent(message)}`
}

/** Compartir en Telegram; la app rellena el texto con `text`. */
function buildTelegramUrl({ title, url }: RideShareInput): string {
  return `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`
}

/** Publicar en X/Twitter. */
function buildXUrl({ title, url }: RideShareInput): string {
  return `https://x.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`
}

/** Compartir en Facebook (solo acepta la URL). */
function buildFacebookUrl({ url }: RideShareInput): string {
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
}

/** Enlace mailto con asunto y cuerpo precargados. */
function buildEmailUrl({ title, url }: RideShareInput): string {
  const subject = title
  const body = `${title}\n${url}`
  return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

/** Composición de Gmail con asunto y cuerpo precargados. */
function buildGmailUrl({ title, url }: RideShareInput): string {
  const params = new URLSearchParams({
    view: 'cm',
    fs: '1',
    to: '',
    su: title,
    body: `${title}\n${url}`,
  })
  return `https://mail.google.com/mail/?${params.toString()}`
}

/**
 * Construye los enlaces de compartir en el orden del menú:
 * WhatsApp, Telegram, X, Facebook, Gmail y correo electrónico del sistema.
 */
export function buildRideShareLinks(input: RideShareInput): RideShareLink[] {
  return [
    {
      target: 'whatsapp',
      label: 'WhatsApp',
      href: buildWhatsappUrl(input),
    },
    {
      target: 'telegram',
      label: 'Telegram',
      href: buildTelegramUrl(input),
    },
    {
      target: 'x',
      label: 'X',
      href: buildXUrl(input),
    },
    {
      target: 'facebook',
      label: 'Facebook',
      href: buildFacebookUrl(input),
    },
    {
      target: 'gmail',
      label: 'Gmail',
      href: buildGmailUrl(input),
    },
    {
      target: 'email',
      label: 'Correo electrónico',
      href: buildEmailUrl(input),
    },
  ]
}
