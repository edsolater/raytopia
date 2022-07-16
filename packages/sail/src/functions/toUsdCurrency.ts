import { Numberish, mul } from '@edsolater/fnkit'
import { CurrencyAmount } from '@raydium-io/raydium-sdk'
import { toBN } from './toBN'

import { usdCurrency } from './toTokenPrice'

export function toUsdCurrency(amount: Numberish) {
  const amountBigNumber = toBN(mul(amount, 10 ** usdCurrency.decimals))
  return new CurrencyAmount(usdCurrency, amountBigNumber)
}
