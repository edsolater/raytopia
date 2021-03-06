import { Numberish } from '@edsolater/fnkit'
import { BigNumberish, TEN } from '@raydium-io/raydium-sdk'
import BN from 'bn.js'
import { DexNumberish } from '../types/constants'
import { toFraction } from './toFraction'

/**
 * only int part will become BN
 */
export function toBN(n: undefined): undefined
export function toBN(n: DexNumberish, decimal?: BigNumberish): BN
export function toBN(n: DexNumberish | undefined, decimal: BigNumberish = 0): BN | undefined {
  if (!n) return undefined
  if (n instanceof BN) return n
  return new BN(
    toFraction(n)
      .mul(TEN.pow(new BN(String(decimal))))
      .toFixed(0)
  )
}
