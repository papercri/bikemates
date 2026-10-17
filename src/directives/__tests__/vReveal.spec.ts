import { mount } from '@vue/test-utils'
import { defineComponent, h, withDirectives } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { vReveal, type RevealBinding } from '../vReveal'

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
    const instances = FakeIntersectionObserver.instances
    const instance = instances[instances.length - 1]
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

type RevealValue = RevealBinding | number | undefined

function mountReveal(value?: RevealValue) {
  return mount(
    defineComponent({
      props: {
        value: { type: null, default: undefined },
      },
      setup(props) {
        return () => withDirectives(h('div', 'Contenido'), [[vReveal, props.value as RevealValue]])
      },
    }),
    { props: { value } },
  )
}

describe('vReveal', () => {
  beforeEach(() => {
    FakeIntersectionObserver.instances = []
    vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    Reflect.deleteProperty(window, 'matchMedia')
  })

  it('añade la clase reveal y se revela al entrar en pantalla', () => {
    const wrapper = mountReveal()

    expect(wrapper.classes()).toContain('reveal')
    expect(wrapper.classes()).not.toContain('is-revealed')
    expect(FakeIntersectionObserver.last.observed).toHaveLength(1)

    FakeIntersectionObserver.last.intersect(true)

    expect(wrapper.classes()).toContain('is-revealed')
    expect(FakeIntersectionObserver.last.disconnected).toBe(true)
  })

  it('no se revela si el elemento no llega a entrar en pantalla', () => {
    const wrapper = mountReveal()

    FakeIntersectionObserver.last.intersect(false)

    expect(wrapper.classes()).not.toContain('is-revealed')
  })

  it('aplica el retardo de stagger pasado como número', () => {
    const wrapper = mountReveal(160)

    expect(wrapper.attributes('style')).toContain('transition-delay: 160ms')
  })

  it('aplica el retardo y la variante desde el objeto de binding', () => {
    const wrapper = mountReveal({ delay: 80, variant: 'photo' })

    expect(wrapper.classes()).toContain('reveal-photo')
    expect(wrapper.attributes('style')).toContain('transition-delay: 80ms')
  })

  it('usa la variante por defecto cuando el objeto no la especifica', () => {
    const wrapper = mountReveal({ delay: 40 })

    expect(wrapper.classes()).toContain('reveal')
    expect(wrapper.classes()).not.toContain('reveal-photo')
  })

  it('se muestra de inmediato cuando hay movimiento reducido', () => {
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: (query: string) => ({ matches: query.includes('reduce') }),
    })

    const wrapper = mountReveal()

    expect(wrapper.classes()).toContain('is-revealed')
    expect(FakeIntersectionObserver.instances).toHaveLength(0)
  })

  it('se muestra de inmediato cuando no hay IntersectionObserver', () => {
    vi.stubGlobal('IntersectionObserver', undefined)

    const wrapper = mountReveal()

    expect(wrapper.classes()).toContain('is-revealed')
  })

  it('desconecta el observer al desmontar', () => {
    const wrapper = mountReveal()

    wrapper.unmount()

    expect(FakeIntersectionObserver.last.disconnected).toBe(true)
  })
})
