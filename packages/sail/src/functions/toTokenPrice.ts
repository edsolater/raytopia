import { mul, Numberish, parseNumberInfo } from '@edsolater/fnkit'
import { Currency, CurrencyAmount, Price, TEN, Token } from '@raydium-io/raydium-sdk'
import BN from 'bn.js'
import { TokenJson } from '../token'
import { toString } from './toString'
import { toUsdCurrency } from './toUsdCurrency'

export const usdCurrency = new Currency(6, 'usd', 'usd')

/**
 * Eth price: 4600
 * ➡
 * Eth price: Price {4600 usd/eth}
 *
 * @param numberPrice can have decimal
 * @returns
 */
export function toTokenPrice(
  token: TokenJson | Token,
  numberPrice: Numberish,
  options?: { alreadyDecimaled?: boolean }
): Price {
  const { numerator, denominator } = parseNumberInfo(numberPrice)
  const parsedNumerator = options?.alreadyDecimaled ? new BN(numerator).mul(TEN.pow(new BN(token.decimals))) : numerator
  const parsedDenominator = new BN(denominator).mul(TEN.pow(new BN(usdCurrency.decimals)))
  return new Price(
    usdCurrency,
    parsedDenominator.toString(),
    new Currency(token.decimals, token.symbol, token.name),
    parsedNumerator.toString()
  )
}

/**
 * tokenPrice * amount = totalPrice
 *
 * amount should be decimaled (e.g. 20.323 RAY)
 * @example
 * Eth price: Price {4600 usd/eth}
 * amount: BN {10} (or you can imput Fraction {10})
 * totalPrice: CurrencyAmount { 46000 usd }
 */
 export function toTotalPrice(amount: Numberish | undefined, price: Price | undefined): CurrencyAmount {
  if (!price || !amount) return toUsdCurrency(0)
  return toUsdCurrency(mul(amount, toString(price)))
}
