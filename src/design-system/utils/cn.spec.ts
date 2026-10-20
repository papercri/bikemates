import { describe, expect, it } from 'vitest'
import { cn } from './cn'

describe('cn', () => {
  it('joins truthy class values with a single space', () => {
    expect(cn('flex', 'items-center')).toBe('flex items-center')
  })

  it('returns an empty string when there are no classes', () => {
    expect(cn()).toBe('')
  })

  it('drops false, null and undefined values', () => {
    expect(cn('block', false, null, undefined, 'hidden')).toBe('block hidden')
  })

  it('drops empty strings without leaving extra spaces', () => {
    expect(cn('a', '', 'b')).toBe('a b')
  })

  it('keeps a single falsy-only result empty', () => {
    expect(cn(false, null, undefined)).toBe('')
  })

  it('lets an explicit font weight override the one coming first', () => {
    expect(cn('text-lg font-medium', 'mb-2 font-bold')).toBe('text-lg mb-2 font-bold')
  })

  it('keeps only the last occurrence of the same font weight', () => {
    expect(cn('font-bold tracking-tight', 'font-bold')).toBe('tracking-tight font-bold')
  })
})
