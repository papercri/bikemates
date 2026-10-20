import { describe, expect, it } from 'vitest'
import { isSafeUrl, parseInline, parseMarkdown } from './markdown'

describe('isSafeUrl', () => {
  it('accepts http, https, mailto and site-relative links', () => {
    expect(isSafeUrl('https://wikiloc.com/ruta')).toBe(true)
    expect(isSafeUrl('http://example.com')).toBe(true)
    expect(isSafeUrl('mailto:ana@ejemplo.com')).toBe(true)
    expect(isSafeUrl('/rides/123')).toBe(true)
    expect(isSafeUrl('#seccion')).toBe(true)
  })

  it('rejects dangerous schemes', () => {
    expect(isSafeUrl('javascript:alert(1)')).toBe(false)
    expect(isSafeUrl('data:text/html,<script>')).toBe(false)
    expect(isSafeUrl('vbscript:msgbox')).toBe(false)
  })
})

describe('parseInline', () => {
  it('returns a single text node without markers', () => {
    expect(parseInline('Recorrido sencillo')).toEqual([
      { type: 'text', value: 'Recorrido sencillo' },
    ])
  })

  it('parses bold and italic', () => {
    expect(parseInline('muy **duro** y algo *ligero*')).toEqual([
      { type: 'text', value: 'muy ' },
      { type: 'strong', content: [{ type: 'text', value: 'duro' }] },
      { type: 'text', value: ' y algo ' },
      { type: 'em', content: [{ type: 'text', value: 'ligero' }] },
    ])
  })

  it('parses a safe link', () => {
    expect(parseInline('[traza](https://wikiloc.com/ruta)')).toEqual([
      {
        type: 'link',
        href: 'https://wikiloc.com/ruta',
        content: [{ type: 'text', value: 'traza' }],
      },
    ])
  })

  it('keeps unsafe link targets as literal text', () => {
    expect(parseInline('[click](javascript:alert(1))')).toEqual([
      { type: 'text', value: '[click](javascript:alert(1))' },
    ])
  })

  it('leaves unmatched markers untouched', () => {
    expect(parseInline('un **cierre que falta')).toEqual([
      { type: 'text', value: 'un **cierre que falta' },
    ])
  })
})

describe('parseMarkdown', () => {
  it('splits lines into paragraphs and preserves their order', () => {
    expect(parseMarkdown('primera línea\nsegunda línea')).toEqual([
      { type: 'p', content: [{ type: 'text', value: 'primera línea' }] },
      { type: 'p', content: [{ type: 'text', value: 'segunda línea' }] },
    ])
  })

  it('groups consecutive list items into one list', () => {
    const blocks = parseMarkdown('- casco\n- cámara\n\nparada final')

    expect(blocks[0]).toMatchObject({
      type: 'ul',
      items: [
        { content: [{ type: 'text', value: 'casco' }] },
        { content: [{ type: 'text', value: 'cámara' }] },
      ],
    })
    expect(blocks[1]).toMatchObject({ type: 'p' })
  })

  it('ignores blank lines without emitting empty paragraphs', () => {
    expect(parseMarkdown('hola\n\n\nmundo')).toHaveLength(2)
  })

  it('renders inline formatting inside list items', () => {
    const blocks = parseMarkdown('- **casco** siempre')

    expect(blocks[0]).toEqual({
      type: 'ul',
      items: [{ type: 'li', content: [{ type: 'strong', content: [{ type: 'text', value: 'casco' }] }, { type: 'text', value: ' siempre' }] }],
    })
  })
})
