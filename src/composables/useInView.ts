import { onBeforeUnmount, onMounted, ref, type Ref } from 'vue'

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

interface UseInViewOptions {
  threshold?: number
  rootMargin?: string
}

/**
 * Marca `isInView` cuando el elemento objetivo entra en pantalla.
 * Si el navegador no soporta IntersectionObserver o la persona ha pedido
 * movimiento reducido, se muestra el contenido de inmediato.
 */
export function useInView(target: Ref<HTMLElement | null>, options: UseInViewOptions = {}) {
  const isInView = ref(false)
  let observer: IntersectionObserver | null = null

  onMounted(() => {
    const element = target.value
    const prefersReducedMotion =
      typeof window.matchMedia === 'function' && window.matchMedia(REDUCED_MOTION_QUERY).matches

    if (!element || prefersReducedMotion || typeof IntersectionObserver === 'undefined') {
      isInView.value = true
      return
    }

    observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return
        isInView.value = true
        observer?.disconnect()
      },
      {
        threshold: options.threshold ?? 0.2,
        rootMargin: options.rootMargin ?? '0px 0px -8% 0px',
      },
    )

    observer.observe(element)
  })

  onBeforeUnmount(() => {
    observer?.disconnect()
  })

  return { isInView }
}
