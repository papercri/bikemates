/**
 * Receta compartida de los controles de formulario (Input, Textarea, FormSelect).
 * Un único string de utilidades Tailwind mantiene borde, radio, foco, caret y
 * estados inválidos/deshabilitados idénticos en todo el sistema.
 */
export const FIELD_CLASSES =
  'w-full rounded-field border border-line-input bg-white text-base text-ink caret-ink outline-none transition-colors placeholder:text-graphite hover:border-graphite focus:border-signal-blue focus:ring-2 focus:ring-signal-blue/25 aria-invalid:border-red-600 aria-invalid:focus:ring-red-200/50 disabled:cursor-not-allowed disabled:bg-surface disabled:opacity-70'

/**
 * Chrome de campo sin borde, redondeado ni anillo de foco: para contenedores que
 * gestionan su propio borde y su estado focus-within (p. ej. un editor con toolbar).
 */
export const FIELD_BARE_CLASSES =
  'w-full bg-white text-base text-ink caret-ink outline-none placeholder:text-graphite disabled:cursor-not-allowed disabled:bg-surface disabled:opacity-70'
