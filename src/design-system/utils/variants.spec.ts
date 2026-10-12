import { describe, expect, it } from 'vitest'
import { createVariant } from './variants'

const buttonVariant = createVariant({
  base: 'rounded-btn transition-colors',
  variants: {
    variant: {
      primary: 'bg-trail text-ink',
      outline: 'border border-line bg-canvas',
    },
    size: {
      sm: 'px-4 py-2',
      lg: 'px-6 py-3',
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'sm',
  },
  compoundVariants: [
    { variant: 'outline', size: 'lg', class: 'border-2' },
    { variant: 'primary', size: 'lg', class: 'font-semibold' },
  ],
})

describe('createVariant', () => {
  it('combines base classes with the default variants', () => {
    expect(buttonVariant()).toBe('rounded-btn transition-colors bg-trail text-ink px-4 py-2')
  })

  it('overrides defaults with the provided selection', () => {
    expect(buttonVariant({ variant: 'outline', size: 'lg' })).toBe(
      'rounded-btn transition-colors border border-line bg-canvas px-6 py-3 border-2',
    )
  })

  it('only replaces the selected variant key', () => {
    expect(buttonVariant({ size: 'lg' })).toBe(
      'rounded-btn transition-colors bg-trail text-ink px-6 py-3 font-semibold',
    )
  })

  it('applies matching compound variants', () => {
    expect(buttonVariant({ variant: 'outline', size: 'lg' })).toContain('border-2')
    expect(buttonVariant({ variant: 'primary', size: 'lg' })).toContain('font-semibold')
  })

  it('ignores compound variants that do not match', () => {
    expect(buttonVariant({ variant: 'primary', size: 'sm' })).not.toContain('border-2')
  })

  it('skips variant entries resolved as undefined', () => {
    const variant = createVariant({
      base: 'base',
      variants: { tone: { muted: 'text-graphite' } },
      defaultVariants: { tone: 'muted' },
    })

    expect(variant({ tone: undefined })).toBe('base')
  })

  it('supports falsy class values in base and compound entries', () => {
    const variant = createVariant({
      base: false,
      variants: { tone: { muted: '' } },
      defaultVariants: { tone: 'muted' },
      compoundVariants: [{ tone: 'muted', class: null }],
    })

    expect(variant()).toBe('')
  })
})
