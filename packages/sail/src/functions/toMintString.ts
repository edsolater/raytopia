import { isArray, isObject, isString, map, tryCatch } from '@edsolater/fnkit'
import { PublicKeyish } from '@raydium-io/raydium-sdk'
import { PublicKey } from '@solana/web3.js'

const mintCache = new WeakMap<PublicKey, string>()

//TODO: no token
export default function toPubString(mint: PublicKeyish | undefined): string {
  if (!mint) return ''
  if (isString(mint)) return mint
  if (mintCache.has(mint)) {
    return mintCache.get(mint)!
  } else {
    const mintString = mint.toBase58()
    mintCache.set(mint, mintString)
    return mintString
  }
}

// TODO: use mintCache
export function toPub(mint: PublicKeyish): PublicKey
export function toPub(mint: undefined): undefined
export function toPub(mint: PublicKeyish | undefined): PublicKey | undefined
export function toPub(mint: PublicKeyish | undefined): PublicKey | undefined {
  if (!mint) return undefined
  return new PublicKey(mint)
}

export function tryToPub<T>(v: T): T | PublicKey {
  return isString(v)
    ? tryCatch(
        () => new PublicKey(v),
        () => v
      )
    : v
}

/**
 * just push the result to cache
 */
export function recordPubString(...args: Parameters<typeof toPubString>): void {
  toPubString(...args)
}

export function ToPubPropertyValue(obj: unknown) {
  if (!isObject(obj)) return tryToPub(obj)
  if (isArray(obj)) return obj.map((i) => ToPubPropertyValue(i))
  return map(obj, (v) => ToPubPropertyValue(v))
}

export function isMintEqual(p1: PublicKeyish | undefined, p2: PublicKeyish | undefined) {
  if (p1 == undefined || p2 == undefined) return false
  const publicKeyish1 = p1
  const publicKeyish2 = p2
  if (p1 instanceof PublicKey && p2 instanceof PublicKey) return p1.equals(p2)
  return toPubString(publicKeyish1) === toPubString(publicKeyish2)
}
