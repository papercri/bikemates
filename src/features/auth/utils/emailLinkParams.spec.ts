import { describe, expect, it } from 'vitest'
import {
  EXPIRED_LINK_MESSAGE,
  getEmailLinkErrorMessage,
  parseEmailLinkParams,
} from './emailLinkParams'

describe('parseEmailLinkParams', () => {
  it('detects an error code in the query string', () => {
    expect(parseEmailLinkParams('?error_code=otp_expired', '')).toEqual({
      kind: 'error',
      code: 'otp_expired',
    })
  })

  it('detects an error code in the hash', () => {
    expect(parseEmailLinkParams('', '#error_code=access_denied')).toEqual({
      kind: 'error',
      code: 'access_denied',
    })
  })

  it('detects a recovery link with its token hash', () => {
    expect(parseEmailLinkParams('?type=recovery&token_hash=abc123', '')).toEqual({
      kind: 'recovery',
      tokenHash: 'abc123',
    })
  })

  it('flags a recovery link without a token as invalid', () => {
    expect(parseEmailLinkParams('?type=recovery', '')).toEqual({
      kind: 'recovery',
      tokenHash: null,
    })
  })

  it('treats any other link as a registration confirmation', () => {
    expect(parseEmailLinkParams('?code=123', '')).toEqual({ kind: 'registration' })
    expect(parseEmailLinkParams('', '')).toEqual({ kind: 'registration' })
  })
})

describe('getEmailLinkErrorMessage', () => {
  it('explains expired links differently from unknown failures', () => {
    expect(getEmailLinkErrorMessage('otp_expired')).toBe(EXPIRED_LINK_MESSAGE)
    expect(getEmailLinkErrorMessage('something_else')).toBe(
      'No se ha podido verificar el enlace. Solicita uno nuevo.',
    )
  })
})
