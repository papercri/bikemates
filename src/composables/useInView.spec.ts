import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useInView } from './useInView'

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

function mountHook(withTarget = true) {
  return mount(
    defineComponent({
      setup() {
        const target = ref<HTMLElement | null>(null)
        const { isInView } = useInView(target)

        return () => h('div', withTarget ? { ref: target } : {}, String(isInView.value))
      },
    }),
  )
}

describe('useInView', () => {
  beforeEach(() => {
    FakeIntersectionObserver.instances = []
    vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    Reflect.deleteProperty(window, 'matchMedia')
  })

  it('observea el elemento y espera a que entre en pantalla', async () => {
    const wrapper = mountHook()

    expect(wrapper.text()).toBe('false')
    expect(FakeIntersectionObserver.last.observed).toHaveLength(1)

    FakeIntersectionObserver.last.intersect(false)
    await nextTick()

    expect(wrapper.text()).toBe('false')

    FakeIntersectionObserver.last.intersect(true)
    await nextTick()

    expect(wrapper.text()).toBe('true')
    expect(FakeIntersectionObserver.last.disconnected).toBe(true)
  })

  it('se muestra de inmediato cuando no hay IntersectionObserver', async () => {
    vi.stubGlobal('IntersectionObserver', undefined)

    const wrapper = mountHook()
    await nextTick()

    expect(wrapper.text()).toBe('true')
  })

  it('se muestra de inmediato cuando hay movimiento reducido', async () => {
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: (query: string) => ({ matches: query.includes('reduce') }),
    })

    const wrapper = mountHook()
    await nextTick()

    expect(wrapper.text()).toBe('true')
    expect(FakeIntersectionObserver.instances).toHaveLength(0)
  })

  it('se muestra de inmediato si no hay elemento que observar', async () => {
    const wrapper = mountHook(false)
    await nextTick()

    expect(wrapper.text()).toBe('true')
  })

  it('desconecta el observer al desmontar', () => {
    const wrapper = mountHook()

    wrapper.unmount()

    expect(FakeIntersectionObserver.last.disconnected).toBe(true)
  })
})
