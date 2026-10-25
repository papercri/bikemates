/** Marcadores de formato que se insertan como texto plano, nunca como HTML. */
export const BOLD_MARKER = '**'
export const ITALIC_MARKER = '*'
export const LIST_PREFIX = '- '
export const LINK_URL_PLACEHOLDER = 'https://'

/** Resultado de una edición: texto nuevo y selección a restaurar tras aplicarla. */
export interface TextEdit {
  value: string
  selectionStart: number
  selectionEnd: number
}

/**
 * Envuelve la selección con un marcador por delante y por detrás. Sin selección
 * deja el cursor entre los dos marcadores para seguir escribiendo.
 */
export function wrapInline(value: string, start: number, end: number, marker: string): TextEdit {
  const selected = value.slice(start, end)
  const inserted = `${marker}${selected}${marker}`
  const next = value.slice(0, start) + inserted + value.slice(end)

  if (selected === '') {
    const cursor = start + marker.length
    return { value: next, selectionStart: cursor, selectionEnd: cursor }
  }

  return { value: next, selectionStart: start, selectionEnd: start + inserted.length }
}

/** Añade un prefijo al comienzo de cada línea tocada por la selección. */
export function prefixLines(value: string, start: number, end: number, prefix: string): TextEdit {
  const selected = value.slice(start, end)

  if (selected === '') {
    const next = value.slice(0, start) + prefix + value.slice(end)
    const cursor = start + prefix.length
    return { value: next, selectionStart: cursor, selectionEnd: cursor }
  }

  const prefixed = selected
    .split('\n')
    .map((line) => (line.trim() === '' ? line : prefix + line))
    .join('\n')
  const next = value.slice(0, start) + prefixed + value.slice(end)

  return { value: next, selectionStart: start, selectionEnd: start + prefixed.length }
}

/** URL completa seleccionable como destino de enlace (sin espacios). */
const URL_SELECTION = /^https?:\/\/\S+$/

/**
 * Convierte la selección en un enlace marcado. Si la selección ya es la URL se
 * usa como destino y no queda nada que completar: `[https://…](https://…)`.
 * En el resto de casos se deja seleccionada la URL de relleno para sustituirla:
 * `[texto](https://)`.
 */
export function wrapLink(value: string, start: number, end: number): TextEdit {
  const selected = value.slice(start, end)
  const trimmed = selected.trim()

  if (URL_SELECTION.test(trimmed)) {
    const linked = `[${trimmed}](${trimmed})`
    const next = value.slice(0, start) + linked + value.slice(end)
    const caret = start + linked.length
    return { value: next, selectionStart: caret, selectionEnd: caret }
  }

  const inserted = `[${selected}](${LINK_URL_PLACEHOLDER})`
  const next = value.slice(0, start) + inserted + value.slice(end)

  const urlStart = start + selected.length + 3
  return {
    value: next,
    selectionStart: urlStart,
    selectionEnd: urlStart + LINK_URL_PLACEHOLDER.length,
  }
}
