import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useParallax } from './useParallax'

type FakeEntry = Partial<IntersectionObserverEntry>

class FakeIntersectionObserver {
  static instances: FakeIntersectionObserver[] = []

  readonly root = null
  readonly rootMargin = ''
  readonly thresholds: number[] = []
  readonly observed: Element[] = []
  disconnected = false

  private readonly callback: (entries: FakeEntry[]) => void

  constructor(callback: (entries: FakeEntry[]) => void) {
    this.callback = callback
    FakeIntersectionObserver.instances.push(this)
  }

  static get last(): FakeIntersectionObserver {
    const instance = FakeIntersectionObserver.instances.at(-1)
    if (!instance) throw new Error('No se ha creado ningún observer')
    return instance
  }

  observe(element: Element): void {
    this.observed.push(element)
  }

  unobserve(): void {}

  disconnect(): void {
    this.disconnected = true
  }

  takeRecords(): IntersectionObserverEntry[] {
    return []
  }

  intersect(isIntersecting: boolean): void {
    this.callback([{ isIntersecting }])
  }
}

function mountParallax() {
  return mount(
    defineComponent({
      setup() {
        const target = ref<HTMLElement | null>(null)
        useParallax(target, { speed: 0.5, maxOffset: 40 })

        return () => h('div', { ref: target })
      },
    }),
  )
}

describe('useParallax', () => {
  let rafCallbacks: FrameRequestCallback[] = []

  beforeEach(() => {
    FakeIntersectionObserver.instances = []
    rafCallbacks = []
    vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver)
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      rafCallbacks.push(callback)
      return rafCallbacks.length
    })
    vi.stubGlobal('cancelAnimationFrame', () => {
      rafCallbacks = []
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
    Reflect.deleteProperty(window, 'matchMedia')
  })

  function flushRaf(element: HTMLElement, rect: Partial<DOMRect>) {
    vi.spyOn(element, 'getBoundingClientRect').mockReturnValue({
      top: 0,
      height: 100,
      bottom: 100,
      left: 0,
      right: 0,
      width: 100,
      x: 0,
      y: 0,
      toJSON: () => ({}),
      ...rect,
    })
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 800 })

    const callbacks = [...rafCallbacks]
    rafCallbacks = []
    for (const callback of callbacks) callback(0)
  }

  it('escribe --parallax-y cuando el elemento es visible', async () => {
    const wrapper = mountParallax()
    const element = wrapper.element as HTMLElement

    FakeIntersectionObserver.last.intersect(true)
    await nextTick()

    // Elemento totalmente por debajo del centro del viewport: offset al máximo.
    flushRaf(element, { top: 800, height: 100 })

    expect(element.style.getPropertyValue('--parallax-y')).toBe('20.00px')
  })

  it('sitúa la capa en el centro cuando el elemento está centrado', async () => {
    const wrapper = mountParallax()
    const element = wrapper.element as HTMLElement

    FakeIntersectionObserver.last.intersect(true)
    await nextTick()

    // Centro del elemento (350+50) coincide con el centro del viewport (400).
    flushRaf(element, { top: 350, height: 100 })

    expect(element.style.getPropertyValue('--parallax-y')).toBe('0.00px')
  })

  it('deja de escuchar el scroll al salir de pantalla', async () => {
    const wrapper = mountParallax()
    const element = wrapper.element as HTMLElement
    const removeSpy = vi.spyOn(window, 'removeEventListener')

    FakeIntersectionObserver.last.intersect(true)
    await nextTick()
    FakeIntersectionObserver.last.intersect(false)

    expect(removeSpy).toHaveBeenCalledWith('scroll', expect.any(Function))
    expect(removeSpy).toHaveBeenCalledWith('resize', expect.any(Function))
    expect(element.style.getPropertyValue('--parallax-y')).toBe('')
  })

  it('no activa el parallax con movimiento reducido', async () => {
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: (query: string) => ({ matches: query.includes('reduce') }),
    })

    mountParallax()
    await nextTick()

    expect(FakeIntersectionObserver.instances).toHaveLength(0)
  })

  it('no activa el parallax sin IntersectionObserver', async () => {
    vi.stubGlobal('IntersectionObserver', undefined)

    mountParallax()
    await nextTick()

    expect(rafCallbacks).toHaveLength(0)
  })

  it('desconecta el observer y limpia la variable al desmontar', async () => {
    const wrapper = mountParallax()
    const element = wrapper.element as HTMLElement

    FakeIntersectionObserver.last.intersect(true)
    await nextTick()
    flushRaf(element, { top: 800, height: 100 })
    expect(element.style.getPropertyValue('--parallax-y')).not.toBe('')

    wrapper.unmount()

    expect(FakeIntersectionObserver.last.disconnected).toBe(true)
    expect(element.style.getPropertyValue('--parallax-y')).toBe('')
  })
})
