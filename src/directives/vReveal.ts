import type { Directive, DirectiveBinding } from 'vue'

export interface RevealBinding {
  /** Retraso en ms antes de animar (stagger entre elementos hermanos). */
  delay?: number
  /** Variante de animación: recorte de foto o desplazamiento suave. */
  variant?: 'default' | 'photo'
}

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'
const REVEAL_THRESHOLD = 0.15
const REVEAL_ROOT_MARGIN = '0px 0px -8% 0px'

const observers = new WeakMap<Element, IntersectionObserver>()

type RevealValue = RevealBinding | number | undefined

function prefersReducedMotion(): boolean {
  return typeof window.matchMedia === 'function' && window.matchMedia(REDUCED_MOTION_QUERY).matches
}

function readBinding(binding: DirectiveBinding<RevealValue>): Required<RevealBinding> {
  if (typeof binding.value === 'number') {
    return { delay: binding.value, variant: 'default' }
  }

  return {
    delay: binding.value?.delay ?? 0,
    variant: binding.value?.variant ?? 'default',
  }
}

function applyStateClasses(el: Element, variant: RevealBinding['variant']): void {
  el.classList.add(variant === 'photo' ? 'reveal-photo' : 'reveal')
}

function revealNow(el: Element): void {
  el.classList.add('is-revealed')
}

/**
 * Revela el elemento cuando entra en pantalla ( IntersectionObserver, una vez).
 * Con `prefers-reduced-motion` o sin soporte se muestra al instante: el
 * contenido nunca depende de la animación para ser accesible.
 */
export const vReveal: Directive<HTMLElement, RevealValue> = {
  mounted(el, binding) {
    const { delay, variant } = readBinding(binding)

    applyStateClasses(el, variant)
    if (delay > 0) {
      el.style.transitionDelay = `${delay}ms`
    }

    if (prefersReducedMotion() || typeof IntersectionObserver === 'undefined') {
      revealNow(el)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return
        revealNow(el)
        observer.disconnect()
        observers.delete(el)
      },
      {
        threshold: REVEAL_THRESHOLD,
        rootMargin: REVEAL_ROOT_MARGIN,
      },
    )

    observer.observe(el)
    observers.set(el, observer)
  },

  unmounted(el) {
    observers.get(el)?.disconnect()
    observers.delete(el)
    el.style.removeProperty('transition-delay')
  },
}
