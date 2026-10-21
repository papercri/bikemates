export type ButtonVariant =
  | 'primary'
  | 'sun'
  | 'sun-outline'
  | 'sun-quiet'
  | 'outline'
  | 'quiet'
  | 'destructive'
  | 'quiet-destructive'
  | 'link'
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg'

/** `inverse` es la variante para texto sobre fotografía (fondo oscuro translúcido). */
export type BadgeVariant = 'soft' | 'muted' | 'inverse'
/** `green`/`orange`/`red` son la escala de nivel de salida; los demás, neutros de marca. */
export type BadgeColor = 'trail' | 'route' | 'ink' | 'green' | 'orange' | 'red'

export type AlertVariant = 'error' | 'success'

export type TypographyTone = 'default' | 'muted' | 'accent'

export type TypographyVariant =
  | 'display'
  | 'heading-xl'
  | 'heading-lg'
  | 'heading-md'
  | 'heading-sm'
  | 'heading-xs'
  | 'body'
  | 'body-sm'
  | 'caption'
  | 'eyebrow'
  | 'eyebrow-wide'
  | 'label-xs'
  | 'numeric-xl'
  | 'numeric-lg'
  | 'numeric-md'
  | 'numeric-inline'

export type TypographyElement =
  'p' | 'span' | 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'strong' | 'dt' | 'dd'

export type CardVariant = 'default' | 'danger'
