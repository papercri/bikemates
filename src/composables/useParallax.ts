import { onBeforeUnmount, onMounted, type Ref } from 'vue'

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

interface UseParallaxOptions {
  /** Intensidad del desplazamiento relativo al scroll (0.3 = movimiento lento). */
  speed?: number
  /** Desplazamiento máximo en píxeles aplicado como `--parallax-y`. */
  maxOffset?: number
}

/**
 * Parallax de desplazamiento vertical estilo Cowboy: la capa se desplaza más
 * lento que el scroll escribiendo `--parallax-y` (solo `transform`, sin layout).
 * Deja de calcular fuera de pantalla y se desactiva con movimiento reducido.
 */
export function useParallax(target: Ref<HTMLElement | null>, options: UseParallaxOptions = {}) {
  const speed = options.speed ?? 0.35
  const maxOffset = options.maxOffset ?? 48

  let observer: IntersectionObserver | null = null
  let frame = 0
  let isVisible = false

  function measure(): void {
    frame = 0
    const element = target.value
    if (!element || !isVisible) return

    const rect = element.getBoundingClientRect()
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight
    const distance = (viewportHeight + rect.height) / 2
    if (distance === 0) return

    // -1 cuando el elemento está por encima del centro del viewport, 1 por debajo.
    const centerOffset = (rect.top + rect.height / 2 - viewportHeight / 2) / distance
    const clamped = Math.min(1, Math.max(-1, centerOffset))
    const offset = clamped * speed * maxOffset

    element.style.setProperty('--parallax-y', `${offset.toFixed(2)}px`)
  }

  function requestMeasure(): void {
    if (frame !== 0) return
    frame = window.requestAnimationFrame(measure)
  }

  function handleScroll(): void {
    requestMeasure()
  }

  function stopTracking(): void {
    isVisible = false
    window.removeEventListener('scroll', handleScroll)
    window.removeEventListener('resize', handleScroll)
  }

  onMounted(() => {
    const element = target.value
    const prefersReducedMotion =
      typeof window.matchMedia === 'function' && window.matchMedia(REDUCED_MOTION_QUERY).matches

    if (!element || prefersReducedMotion || typeof IntersectionObserver === 'undefined') return

    observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (!entry) return

        isVisible = entry.isIntersecting
        if (isVisible) {
          window.addEventListener('scroll', handleScroll, { passive: true })
          window.addEventListener('resize', handleScroll, { passive: true })
          requestMeasure()
          return
        }

        stopTracking()
      },
      // Margen amplio para seguir midiendo un poco antes de salir del todo.
      { rootMargin: '20% 0px 20% 0px' },
    )

    observer.observe(element)
  })

  onBeforeUnmount(() => {
    observer?.disconnect()
    observer = null
    stopTracking()

    if (frame !== 0) {
      window.cancelAnimationFrame(frame)
      frame = 0
    }

    target.value?.style.removeProperty('--parallax-y')
  })
}
