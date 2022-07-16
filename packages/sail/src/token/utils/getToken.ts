import { PublicKeyish } from '@raydium-io/raydium-sdk'
import toPubString from '../../functions/toMintString'
import { tokenAtom } from '../atom'
import { LpToken, SplToken } from '../type'
import { QuantumSOLVersionSOL, QuantumSOLVersionWSOL, SOLUrlMint, WSOLMint } from './quantumSOL'

export function getToken(mint: PublicKeyish | undefined, options?: { exact?: boolean }): SplToken | undefined {
  const { tokens, lpTokens, userAddedTokens } = tokenAtom.get()
  if (toPubString(mint) === SOLUrlMint) {
    return QuantumSOLVersionSOL
  }
  if (toPubString(mint) === toPubString(WSOLMint) && options?.exact) {
    return QuantumSOLVersionWSOL
  }
  return tokens[toPubString(mint)] ?? lpTokens[toPubString(mint)] ?? userAddedTokens.get(toPubString(mint))
}

export function getPureToken(mint: PublicKeyish | undefined): SplToken | undefined {
  const { pureTokens, lpTokens, userAddedTokens } = tokenAtom.get()
  return pureTokens[toPubString(mint)] ?? lpTokens[toPubString(mint)] ?? userAddedTokens.get(toPubString(mint))
}

export function getLpToken(mint: PublicKeyish | undefined): LpToken | undefined {
  const { lpTokens } = tokenAtom.get()
  return lpTokens[toPubString(mint)]
}
