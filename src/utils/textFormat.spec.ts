import { describe, expect, it } from 'vitest'
import { BOLD_MARKER, ITALIC_MARKER, LIST_PREFIX, prefixLines, wrapInline, wrapLink } from './textFormat'

describe('textFormat', () => {
  describe('wrapInline', () => {
    it('wraps the selection with the marker on both sides', () => {
      expect(wrapInline('hola mundo', 0, 4, BOLD_MARKER)).toEqual({
        value: '**hola** mundo',
        selectionStart: 0,
        selectionEnd: 8,
      })
    })

    it('places the cursor between the markers when nothing is selected', () => {
      expect(wrapInline('hola', 4, 4, ITALIC_MARKER)).toEqual({
        value: 'hola**',
        selectionStart: 5,
        selectionEnd: 5,
      })
    })

    it('keeps the surrounding text untouched', () => {
      expect(wrapInline('abc def ghi', 4, 7, BOLD_MARKER)).toEqual({
        value: 'abc **def** ghi',
        selectionStart: 4,
        selectionEnd: 11,
      })
    })
  })

  describe('prefixLines', () => {
    it('prefixes every line touched by the selection', () => {
      expect(prefixLines('uno\ndos', 0, 7, LIST_PREFIX)).toEqual({
        value: '- uno\n- dos',
        selectionStart: 0,
        selectionEnd: 11,
      })
    })

    it('inserts the prefix when nothing is selected', () => {
      expect(prefixLines('hola', 4, 4, LIST_PREFIX)).toEqual({
        value: 'hola- ',
        selectionStart: 6,
        selectionEnd: 6,
      })
    })

    it('leaves blank lines without a prefix', () => {
      expect(prefixLines('uno\n\ndos', 0, 8, LIST_PREFIX).value).toBe('- uno\n\n- dos')
    })
  })

  describe('wrapLink', () => {
    it('turns the selection into a link and selects the placeholder URL', () => {
      const edit = wrapLink('visita', 0, 6)

      expect(edit.value).toBe('[visita](https://)')
      expect(edit.value.slice(edit.selectionStart, edit.selectionEnd)).toBe('https://')
    })

    it('keeps the surrounding text when a link is inserted mid-sentence', () => {
      const edit = wrapLink('ver ruta', 4, 8)

      expect(edit.value).toBe('ver [ruta](https://)')
      expect(edit.value.slice(edit.selectionStart, edit.selectionEnd)).toBe('https://')
    })
  })
})
