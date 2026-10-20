/**
 * Parser mínimo de markdown de texto plano para descripciones de rutas.
 *
 * Seguridad: el árbol resultante se interpreta con interpolación de Vue (siempre
 * escapada); aquí solo se decide la estructura. Las URLs de enlace se validan para
 * no introducir esquemas peligrosos (`javascript:`, `data:`…).
 */

export type InlineNode =
  | { type: 'text'; value: string }
  | { type: 'strong'; content: InlineNode[] }
  | { type: 'em'; content: InlineNode[] }
  | { type: 'link'; href: string; content: InlineNode[] }

export type BlockNode =
  | { type: 'p'; content: InlineNode[] }
  | { type: 'ul'; items: { type: 'li'; content: InlineNode[] }[] }

/** Solo se consideran seguros los enlaces http(s), internos (# o /) y mailto. */
export function isSafeUrl(href: string): boolean {
  return /^(?:https?:\/\/|mailto:|[/#])/i.test(href.trim())
}

export function parseInline(text: string): InlineNode[] {
  const nodes: InlineNode[] = []
  let plain = ''
  let i = 0

  const flush = (): void => {
    if (plain !== '') {
      nodes.push({ type: 'text', value: plain })
      plain = ''
    }
  }

  while (i < text.length) {
    // Negrita: **texto**
    if (text.startsWith('**', i)) {
      const close = text.indexOf('**', i + 2)
      if (close !== -1) {
        flush()
        nodes.push({ type: 'strong', content: parseInline(text.slice(i + 2, close)) })
        i = close + 2
        continue
      }
    }

    // Enlace: [texto](https://…)
    if (text[i] === '[') {
      const bracket = text.indexOf(']', i + 1)
      if (bracket !== -1 && text[bracket + 1] === '(') {
        const paren = text.indexOf(')', bracket + 2)
        if (paren !== -1) {
          const label = text.slice(i + 1, bracket)
          const href = text.slice(bracket + 2, paren).trim()

          if (isSafeUrl(href)) {
            flush()
            nodes.push({ type: 'link', href, content: parseInline(label) })
            i = paren + 1
            continue
          }

          // URL insegura: se muestra como texto literal, sin enlazar.
          plain += text.slice(i, paren + 1)
          i = paren + 1
          continue
        }
      }
    }

    // Cursiva: *texto*
    if (text[i] === '*') {
      const close = text.indexOf('*', i + 1)
      if (close !== -1 && close > i + 1) {
        flush()
        nodes.push({ type: 'em', content: parseInline(text.slice(i + 1, close)) })
        i = close + 1
        continue
      }
    }

    plain += text[i]
    i++
  }

  flush()
  return nodes
}

const LIST_PREFIX = /^[-*]\s+(.*)$/

export function parseMarkdown(text: string): BlockNode[] {
  const blocks: BlockNode[] = []
  let list: Extract<BlockNode, { type: 'ul' }> | null = null

  const closeList = (): void => {
    if (list !== null) {
      blocks.push(list)
      list = null
    }
  }

  for (const rawLine of text.split('\n')) {
    const line = rawLine.replace(/\r$/, '')
    const match = LIST_PREFIX.exec(line)

    if (match !== null) {
      if (list === null) list = { type: 'ul', items: [] }
      list.items.push({ type: 'li', content: parseInline(match[1] ?? '') })
      continue
    }

    closeList()

    if (line.trim() !== '') {
      blocks.push({ type: 'p', content: parseInline(line) })
    }
  }

  closeList()
  return blocks
}
