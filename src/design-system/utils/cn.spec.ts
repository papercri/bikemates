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
})
