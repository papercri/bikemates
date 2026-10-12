import type { ClassValue } from './cn'

type VariantMap = Record<string, Record<string, ClassValue>>

type SelectionFor<Map extends VariantMap> = Partial<Record<keyof Map & string, string>>

interface ConfigFor<Map extends VariantMap> {
  base?: ClassValue
  variants: Map
  defaultVariants?: SelectionFor<Map>
  compoundVariants?: ReadonlyArray<{ class: ClassValue } & SelectionFor<Map>>
}

/**
 * Equivalente mínimo de `class-variance-authority` (sin dependencias).
 * Devuelve una función que, dada una selección de variantes, genera la lista
 * de clases CSS resultante de forma tipada y predecible.
 */
export function createVariant<Map extends VariantMap>(
  config: ConfigFor<Map>,
): (selection?: SelectionFor<Map>) => string {
  const { base, variants, defaultVariants = {}, compoundVariants = [] } = config

  return function resolveVariant(selection) {
    const resolved: Record<string, string | undefined> = { ...defaultVariants, ...selection }
    const classes: ClassValue[] = [base]

    for (const [variantName, options] of Object.entries(variants)) {
      const value = resolved[variantName]
      if (value === undefined) continue
      classes.push(options[value])
    }

    for (const compound of compoundVariants) {
      const matches = Object.entries(compound).every(([key, value]) =>
        key === 'class' ? true : resolved[key] === value,
      )
      if (matches) classes.push(compound.class)
    }

    return classes.filter(Boolean).join(' ')
  }
}
