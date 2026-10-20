/**
 * Une clases condicionales sin depender de utilidades externas.
 * Los consumidores añaden sus clases con `class` (Vue las fusiona en el root).
 */
export type ClassValue = string | false | null | undefined

/**
 * Pesos de fuente de Tailwind. En la hoja CSS estos se emiten en un orden
 * que no depende del orden de las clases del atributo, así que cuando conviven
 * dos pesos solo sobrevive el que aparezca más abajo en la hoja. Para que un
 * peso explícito del consumidor gane siempre sobre el de una variante
 * (por ejemplo `font-bold` sobre el `font-medium` de un heading), se descartan
 * los pesos anteriores y se conserva el último.
 */
const FONT_WEIGHT_CLASSES = new Set([
  'font-thin',
  'font-extralight',
  'font-light',
  'font-normal',
  'font-medium',
  'font-semibold',
  'font-bold',
  'font-extrabold',
  'font-black',
])

export function cn(...classes: ClassValue[]): string {
  const tokens = classes
    .filter(Boolean)
    .join(' ')
    .split(/\s+/)
    .filter(Boolean)

  const result: string[] = []
  let weightKept = false

  for (const token of tokens.reverse()) {
    if (FONT_WEIGHT_CLASSES.has(token)) {
      if (weightKept) continue
      weightKept = true
    }

    result.unshift(token)
  }

  return result.join(' ')
}
