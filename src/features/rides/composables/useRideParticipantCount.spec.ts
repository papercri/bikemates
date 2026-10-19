import { flushPromises } from '@vue/test-utils'
import { ref } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useRideParticipantCount } from './useRideParticipantCount'

const mocks = vi.hoisted(() => ({
  getRideParticipantCount: vi.fn<(rideId: string) => Promise<number>>(),
}))

vi.mock('../services/rideService', () => ({
  getRideParticipantCount: mocks.getRideParticipantCount,
}))

describe('useRideParticipantCount', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('loads the count as soon as it is created', async () => {
    mocks.getRideParticipantCount.mockResolvedValue(4)

    const { participantCount, isLoadingCount, countError } = useRideParticipantCount('ride-1')

    expect(isLoadingCount.value).toBe(true)
    await flushPromises()

    expect(mocks.getRideParticipantCount).toHaveBeenCalledWith('ride-1')
    expect(participantCount.value).toBe(4)
    expect(isLoadingCount.value).toBe(false)
    expect(countError.value).toBeNull()
  })

  it('reports an invalid identifier without calling the service', async () => {
    const { participantCount, countError } = useRideParticipantCount(null)
    await flushPromises()

    expect(mocks.getRideParticipantCount).not.toHaveBeenCalled()
    expect(participantCount.value).toBeNull()
    expect(countError.value).toBe('El identificador de la ruta no es válido.')
  })

  it('explains a failed load with the service message', async () => {
    mocks.getRideParticipantCount.mockRejectedValue(
      new Error('No se pudo cargar el número de participantes: offline'),
    )

    const { countError, isLoadingCount } = useRideParticipantCount('ride-1')
    await flushPromises()

    expect(countError.value).toBe('No se pudo cargar el número de participantes: offline')
    expect(isLoadingCount.value).toBe(false)
  })

  it('falls back to a generic message for unknown failures', async () => {
    mocks.getRideParticipantCount.mockRejectedValue(undefined)

    const { countError } = useRideParticipantCount('ride-1')
    await flushPromises()

    expect(countError.value).toBe('No se pudo cargar el número de participantes.')
  })

  it('reloads the count whenever the ride identifier changes', async () => {
    const rideId = ref<string | null>('ride-1')
    mocks.getRideParticipantCount.mockResolvedValueOnce(2).mockResolvedValueOnce(7)

    const { participantCount } = useRideParticipantCount(rideId)
    await flushPromises()

    rideId.value = 'ride-2'
    await flushPromises()

    expect(mocks.getRideParticipantCount).toHaveBeenLastCalledWith('ride-2')
    expect(participantCount.value).toBe(7)
  })
})
