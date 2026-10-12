import type { BadgeColor } from '@/design-system'
import type { RideLevel } from '../types'

export const RIDE_LEVELS: readonly RideLevel[] = ['Iniciación', 'Intermedio', 'Avanzado']

export const RIDE_LEVEL_BADGE_COLORS: Record<RideLevel, BadgeColor> = {
  Iniciación: 'trail',
  Intermedio: 'route',
  Avanzado: 'ink',
}

export const RIDE_LEVEL_DOT_CLASSES: Record<RideLevel, string> = {
  Iniciación: 'bg-trail',
  Intermedio: 'bg-route',
  Avanzado: 'bg-ink',
}
