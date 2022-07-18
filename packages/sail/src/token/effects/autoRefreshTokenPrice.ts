import { createAtomEffect } from '@edsolater/xstore'
import { refreshTokenPrice } from '../utils/refreshTokenPrice'
import { inClient } from '../../functions/env'

export const autoRefreshTokenPrice = createAtomEffect(() => {
  const timeIntervalId = setInterval(() => {
    if (inClient && globalThis.document.visibilityState === 'hidden') return
    refreshTokenPrice()
  }, 1000 * 60 * 2)
  return () => clearInterval(timeIntervalId) // TODO: not imply clean function yet
}, [])
