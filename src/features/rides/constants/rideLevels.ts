import type { BadgeColor } from '@/design-system'
import type { RideLevel } from '../types'

export const RIDE_LEVELS: readonly RideLevel[] = ['Iniciación', 'Intermedio', 'Avanzado']

export const RIDE_LEVEL_BADGE_COLORS: Record<RideLevel, BadgeColor> = {
  Iniciación: 'trail',
  Intermedio: 'route',
  Avanzado: 'ink',
}
