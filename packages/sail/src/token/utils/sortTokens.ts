import { SplToken } from '../type'
import { isQuantumSOL, isQuantumSOLVersionSOL, QuantumSOLVersionSOL } from './quantumSOL'
import { RAYMint } from './wellknownToken.config'
import { tokenAtom } from '../atom'
import { shakeNil } from '@edsolater/fnkit'

export function sortTokens(tokens: SplToken[]): SplToken[] {
  const { getToken } = tokenAtom.get()
  const RAY = getToken(RAYMint)

  const whiteList = shakeNil([RAY, QuantumSOLVersionSOL])

  // noQuantumSOL
  const whiteListMints = whiteList.filter((token) => !isQuantumSOL(token)).map((token) => String(token.mint))

  const { pureBalances } = /* TODO: useWallet.getState() */ { pureBalances: {} }

  const notInWhiteListToken = Object.values(tokens).filter(
    (token) => !isQuantumSOLVersionSOL(token) && !whiteListMints.includes(String(token.mint))
  )

  const result = [
    ...whiteList,
    ...notInWhiteListToken
      .filter((token) => pureBalances[String(token.mint)])
      .sort((tokenA, tokenB) => {
        const balanceA = pureBalances[String(tokenA.mint)].raw
        const balanceB = pureBalances[String(tokenB.mint)].raw
        return balanceA.lte(balanceB) ? 1 : -1
      }),
    ...notInWhiteListToken.filter((token) => !pureBalances[String(token.mint)])
  ]
  return result
}
