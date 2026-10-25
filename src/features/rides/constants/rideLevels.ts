import type { BadgeColor } from '@/design-system'
import type { RideLevel } from '../types'

/**
 * Los valores guardados en la base de datos se mantienen por compatibilidad con
 * las salidas existentes; lo visible en la interfaz son las etiquetas.
 */
export const RIDE_LEVELS: readonly RideLevel[] = ['Iniciación', 'Intermedio', 'Avanzado']

export const RIDE_LEVEL_LABELS: Record<RideLevel, string> = {
  Iniciación: 'Fácil',
  Intermedio: 'Moderado',
  Avanzado: 'Difícil',
}

export const RIDE_LEVEL_BADGE_COLORS: Record<RideLevel, BadgeColor> = {
  Iniciación: 'green',
  Intermedio: 'orange',
  Avanzado: 'red',
}
