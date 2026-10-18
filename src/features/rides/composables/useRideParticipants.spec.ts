import { flushPromises } from '@vue/test-utils'
import { ref } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { RideParticipant } from '../types'
import { useRideParticipants } from './useRideParticipants'

const mocks = vi.hoisted(() => ({
  getRideParticipants: vi.fn<(rideId: string, organizerId: string) => Promise<RideParticipant[]>>(),
  joinRide: vi.fn<(rideId: string) => Promise<void>>(),
  leaveRide: vi.fn<(rideId: string) => Promise<void>>(),
}))

vi.mock('../services/rideService', () => ({
  getRideParticipants: mocks.getRideParticipants,
  joinRide: mocks.joinRide,
  leaveRide: mocks.leaveRide,
}))

const participants: RideParticipant[] = [
  { id: 'user-1', displayName: 'Cristiana', avatarUrl: null, isOrganizer: true },
  { id: 'user-2', displayName: 'Marc', avatarUrl: 'a.png', isOrganizer: false },
]

function setup(options: {
  rideId?: string | null
  organizerId?: string | null
  isAuthenticated?: boolean
} = {}) {
  const rideId = ref<string | null>('rideId' in options ? options.rideId ?? null : 'ride-1')
  const organizerId = ref<string | null>(
    'organizerId' in options ? options.organizerId ?? null : 'organizer-1',
  )
  const isAuthenticated = ref(options.isAuthenticated ?? true)

  return {
    rideId,
    organizerId,
    isAuthenticated,
    ...useRideParticipants(rideId, organizerId, isAuthenticated),
  }
}

describe('useRideParticipants', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('loads the participants once the ride and the session are known', async () => {
    mocks.getRideParticipants.mockResolvedValue(participants)

    const { participants: loaded, isLoading } = setup()
    await flushPromises()

    expect(mocks.getRideParticipants).toHaveBeenCalledWith('ride-1', 'organizer-1')
    expect(loaded.value).toEqual(participants)
    expect(isLoading.value).toBe(false)
  })

  it('stays empty without an authenticated user and skips the request', async () => {
    const { participants: loaded, isLoading } = setup({ isAuthenticated: false })
    await flushPromises()

    expect(mocks.getRideParticipants).not.toHaveBeenCalled()
    expect(loaded.value).toEqual([])
    expect(isLoading.value).toBe(false)
  })

  it('skips the request when the ride or the organizer is missing', async () => {
    const { participants: loaded } = setup({ rideId: null })
    await flushPromises()

    expect(mocks.getRideParticipants).not.toHaveBeenCalled()
    expect(loaded.value).toEqual([])
  })

  it('reloads when the authentication state changes', async () => {
    mocks.getRideParticipants.mockResolvedValue(participants)

    const controls = setup({ isAuthenticated: false })
    await flushPromises()

    controls.isAuthenticated.value = true
    await flushPromises()

    expect(mocks.getRideParticipants).toHaveBeenCalledWith('ride-1', 'organizer-1')
    expect(controls.participants.value).toEqual(participants)
  })

  it('explains a failed load with the service message', async () => {
    mocks.getRideParticipants.mockRejectedValue(
      new Error('No se pudieron cargar los participantes: offline'),
    )

    const { errorMessage, isLoading } = setup()
    await flushPromises()

    expect(errorMessage.value).toBe('No se pudieron cargar los participantes: offline')
    expect(isLoading.value).toBe(false)
  })

  it('falls back to a generic message for unknown load failures', async () => {
    mocks.getRideParticipants.mockRejectedValue('boom')

    const { errorMessage } = setup()
    await flushPromises()

    expect(errorMessage.value).toBe('No se pudieron cargar los participantes.')
  })

  describe('join', () => {
    it('joins the ride and refreshes the participant list', async () => {
      mocks.joinRide.mockResolvedValue(undefined)
      mocks.getRideParticipants.mockResolvedValue(participants)

      const { join, isSubmitting, errorMessage } = setup()
      await flushPromises()

      await join()

      expect(mocks.joinRide).toHaveBeenCalledWith('ride-1')
      expect(mocks.getRideParticipants).toHaveBeenCalledTimes(2)
      expect(isSubmitting.value).toBe(false)
      expect(errorMessage.value).toBeNull()
    })

    it('reports a failed inscription with the service message', async () => {
      mocks.joinRide.mockRejectedValue(new Error('No se pudo completar la inscripción: full'))
      mocks.getRideParticipants.mockResolvedValue(participants)

      const { join, errorMessage, isSubmitting } = setup()
      await flushPromises()

      await join()

      expect(errorMessage.value).toBe('No se pudo completar la inscripción: full')
      expect(isSubmitting.value).toBe(false)
    })

    it('falls back to a generic message for unknown join failures', async () => {
      mocks.joinRide.mockRejectedValue(42)
      mocks.getRideParticipants.mockResolvedValue([])

      const { join, errorMessage } = setup()
      await flushPromises()

      await join()

      expect(errorMessage.value).toBe('No se pudo completar la inscripción.')
    })

    it('does nothing while anonymous, without an id or while submitting', async () => {
      mocks.joinRide.mockResolvedValue(undefined)
      mocks.getRideParticipants.mockResolvedValue([])

      const anonymous = setup({ isAuthenticated: false })
      await flushPromises()
      await anonymous.join()
      expect(mocks.joinRide).not.toHaveBeenCalled()

      const withoutId = setup({ rideId: null })
      await flushPromises()
      await withoutId.join()
      expect(mocks.joinRide).not.toHaveBeenCalled()

      const busy = setup()
      await flushPromises()
      busy.isSubmitting.value = true
      await busy.join()
      expect(mocks.joinRide).not.toHaveBeenCalled()
    })
  })

  describe('leave', () => {
    it('leaves the ride and refreshes the participant list', async () => {
      mocks.leaveRide.mockResolvedValue(undefined)
      mocks.getRideParticipants.mockResolvedValue(participants)

      const { leave, isSubmitting } = setup()
      await flushPromises()

      await leave()

      expect(mocks.leaveRide).toHaveBeenCalledWith('ride-1')
      expect(mocks.getRideParticipants).toHaveBeenCalledTimes(2)
      expect(isSubmitting.value).toBe(false)
    })

    it('reports a failed cancellation with the service message', async () => {
      mocks.leaveRide.mockRejectedValue(
        new Error('No se pudo cancelar la inscripción: not found'),
      )
      mocks.getRideParticipants.mockResolvedValue(participants)

      const { leave, errorMessage, isSubmitting } = setup()
      await flushPromises()

      await leave()

      expect(errorMessage.value).toBe('No se pudo cancelar la inscripción: not found')
      expect(isSubmitting.value).toBe(false)
    })

    it('falls back to a generic message for unknown leave failures', async () => {
      mocks.leaveRide.mockRejectedValue('boom')
      mocks.getRideParticipants.mockResolvedValue([])

      const { leave, errorMessage } = setup()
      await flushPromises()

      await leave()

      expect(errorMessage.value).toBe('No se pudo cancelar la inscripción.')
    })

    it('does nothing while anonymous or without an id', async () => {
      mocks.leaveRide.mockResolvedValue(undefined)
      mocks.getRideParticipants.mockResolvedValue([])

      const anonymous = setup({ isAuthenticated: false })
      await flushPromises()
      await anonymous.leave()
      expect(mocks.leaveRide).not.toHaveBeenCalled()

      const withoutId = setup({ rideId: null })
      await flushPromises()
      await withoutId.leave()
      expect(mocks.leaveRide).not.toHaveBeenCalled()
    })
  })
})
