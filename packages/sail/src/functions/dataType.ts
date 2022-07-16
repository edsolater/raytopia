import { Token, TokenAmount } from '@raydium-io/raydium-sdk'
import { PublicKey } from '@solana/web3.js'

export function isToken(val: any): val is Token {
  return val instanceof Token
}

export function isTokenAmount(val: any): val is TokenAmount {
  return val instanceof TokenAmount
}

export function isPubKey(val: unknown): val is PublicKey {
  return val instanceof PublicKey
}

export function isValidePublicKey(val: string | undefined): val is string
export function isValidePublicKey(val: PublicKey | undefined): val is PublicKey
export function isValidePublicKey(val: string | PublicKey | undefined): val is string {
  if (!val) return false
  if (val instanceof PublicKey) return true
  try {
    new PublicKey(val)
  } catch (err) {
    return false
  }
  return true
}
