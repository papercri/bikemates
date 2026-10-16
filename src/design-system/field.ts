/**
 * Receta compartida de los controles de formulario (Input, Textarea, FormSelect).
 * Un único string de utilidades Tailwind mantiene borde, radio, foco, caret y
 * estados inválidos/deshabilitados idénticos en todo el sistema.
 */
export const FIELD_CLASSES =
  'w-full rounded-btn border border-line bg-canvas text-base text-ink caret-trail-deep outline-none transition-colors placeholder:text-graphite hover:border-line-strong focus:border-trail focus:ring-2 focus:ring-trail/25 aria-invalid:border-red-300 aria-invalid:focus:ring-red-200/50 disabled:cursor-not-allowed disabled:bg-surface disabled:opacity-70'
