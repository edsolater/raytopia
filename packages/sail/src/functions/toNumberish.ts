import { Numberish } from '@edsolater/fnkit'
import { DexNumberish } from '../types/constants'
import { toFraction } from './toFraction'

export function toNumberish(n: DexNumberish): Numberish {
  return toFraction(n)
}
