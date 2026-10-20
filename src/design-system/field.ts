/**
 * Estados compartidos de todos los campos de formulario (fondo, texto, caret,
 * inválido y deshabilitado). El filete y el foco se añaden aparte porque varían.
 */
const FIELD_CORE =
  'bg-white text-base text-ink caret-ink outline-none transition-colors placeholder:text-graphite aria-invalid:border-red-600 disabled:cursor-not-allowed disabled:bg-surface disabled:opacity-70'

/**
 * Receta compartida de los controles de formulario (Input, Textarea, FormSelect).
 * Un único string de utilidades Tailwind mantiene borde, radio, foco, caret y
 * estados inválidos/deshabilitados idénticos en todo el sistema.
 */
export const FIELD_CLASSES = `w-full rounded-field border border-line-input hover:border-graphite focus:border-signal-blue focus:ring-2 focus:ring-signal-blue/25 aria-invalid:focus:ring-red-200/50 ${FIELD_CORE}`

/**
 * Filete muy claro agrupado con los desplegables del listado. Sin anillo ni
 * cambio de filete al recibir el foco: el diseño pide que el campo no resalte.
 */
export const FIELD_SUBTLE_CLASSES = `w-full rounded-field border border-line hover:border-line-strong hover:bg-snow ${FIELD_CORE}`

/**
 * Chrome de campo sin borde, redondeado ni anillo de foco: para contenedores que
 * gestionan su propio borde y su estado focus-within (p. ej. un editor con toolbar).
 */
export const FIELD_BARE_CLASSES =
  'w-full bg-white text-base text-ink caret-ink outline-none placeholder:text-graphite disabled:cursor-not-allowed disabled:bg-surface disabled:opacity-70'
