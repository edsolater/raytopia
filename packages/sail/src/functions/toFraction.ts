import { Numberish, tryCatch, parseNumberInfo, toNumberishAtom } from '@edsolater/fnkit'
import { Fraction, Percent, Price, TokenAmount, ZERO } from '@raydium-io/raydium-sdk'
import { DexNumberish } from '../types/constants'

export function toFraction(value: DexNumberish): Fraction {
  //  to complete math format(may have decimal), not int
  if (value instanceof Percent) return new Fraction(value.numerator, value.denominator)

  if (value instanceof Price) return value.adjusted

  // to complete math format(may have decimal), not BN
  if (value instanceof TokenAmount)
    return tryCatch(
      () => toFraction(value.toExact()),
      () => new Fraction(ZERO)
    )

  // do not ideal with other fraction value
  if (value instanceof Fraction) return value

  // wrap to Fraction
  const n = String(value)
  const details = parseNumberInfo(n)
  return new Fraction(details.numerator, details.denominator)
}

export function toFractionWithDecimals(value: DexNumberish): { fr: Fraction; decimals?: number } {
  //  to complete math format(may have decimal), not int
  if (value instanceof Percent) return { fr: new Fraction(value.numerator, value.denominator) }

  if (value instanceof Price) return { fr: value.adjusted }

  // to complete math format(may have decimal), not BN
  if (value instanceof TokenAmount) return { fr: toFraction(value.toExact()), decimals: value.token.decimals }

  // do not ideal with other fraction value
  if (value instanceof Fraction) return { fr: value }

  // wrap to Fraction
  const n = String(value)
  const details = parseNumberInfo(n)
  return { fr: new Fraction(details.numerator, details.denominator), decimals: details.dec?.length }
}

export function toNumberish(n: DexNumberish): Numberish {
  const fraction = toFraction(n)
  return toNumberishAtom({
    denominator: BigInt(fraction.denominator.toString()),
    numerator: BigInt(fraction.numerator.toString())
  })
}
