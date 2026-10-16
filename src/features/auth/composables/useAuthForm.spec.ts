import { describe, expect, it } from 'vitest'
import { useAuthForm } from './useAuthForm'

describe('useAuthForm', () => {
  it('runs the action and clears the messages first', async () => {
    const form = useAuthForm()

    form.errorMessage.value = 'anterior'
    form.successMessage.value = 'también anterior'

    let wasSubmittingDuringAction = false

    await form.submit(() => {
      wasSubmittingDuringAction = form.isSubmitting.value
      form.successMessage.value = 'Hecho'
      return Promise.resolve()
    }, 'Error fijo')

    expect(wasSubmittingDuringAction).toBe(true)
    expect(form.isSubmitting.value).toBe(false)
    expect(form.errorMessage.value).toBe('')
    expect(form.successMessage.value).toBe('Hecho')
  })

  it('uses the fixed fallback message when the action fails', async () => {
    const form = useAuthForm()

    await form.submit(
      () => Promise.reject(new Error('Detalle interno')),
      'No se ha podido iniciar sesión.',
    )

    expect(form.errorMessage.value).toBe('No se ha podido iniciar sesión.')
    expect(form.isSubmitting.value).toBe(false)
  })

  it('supports describing the error with a function', async () => {
    const form = useAuthForm()

    await form.submit(
      () => Promise.reject(new Error('Email ya registrado.')),
      (error) => (error instanceof Error ? error.message : 'Error genérico'),
    )

    expect(form.errorMessage.value).toBe('Email ya registrado.')
  })

  it('reports generic errors when the mapper cannot describe them', async () => {
    const form = useAuthForm()

    await form.submit(
      () => Promise.reject('no es un error'),
      (error) => (error instanceof Error ? error.message : 'Error genérico'),
    )

    expect(form.errorMessage.value).toBe('Error genérico')
  })

  it('clears both messages', () => {
    const form = useAuthForm()

    form.errorMessage.value = 'error'
    form.successMessage.value = 'ok'
    form.clearMessages()

    expect(form.errorMessage.value).toBe('')
    expect(form.successMessage.value).toBe('')
  })
})
