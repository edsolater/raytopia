import { listToMap, shakeNil } from '@edsolater/fnkit'
import { createAtomEffect, createSubscribePath } from '@edsolater/xstore'
import { Token } from '@raydium-io/raydium-sdk'
import { toPubString } from '../../functions/toPubString'
import { getLiquidityJsonInfoList } from '../../liquidity/utils/getLiquidityJsonInfoList'
import { cloneFn } from '../../temp/createNewFn'
import { tokenAtom } from '../atom'
import { LpToken } from '../type'
import { getLpToken, getToken } from '../utils/getToken'

export const loadLpTokens = createAtomEffect(async () => {
  const ammJsonInfos = await getLiquidityJsonInfoList()

  if (!ammJsonInfos) return
  const lpTokens = listToMap(
    shakeNil(
      ammJsonInfos.map((ammJsonInfo) => {
        const baseToken = getToken(ammJsonInfo.baseMint)
        const quoteToken = getToken(ammJsonInfo.quoteMint)
        if (!baseToken || !quoteToken) return // NOTE :  no unknown base/quote lpToken
        const lpToken = Object.assign(
          new Token(
            ammJsonInfo.lpMint,
            baseToken.decimals,
            `${baseToken.symbol}-${quoteToken.symbol}`,
            `${baseToken.symbol}-${quoteToken.symbol} LP`
          ),
          {
            isLp: true,
            base: baseToken,
            quote: quoteToken,
            icon: '',
            extensions: {}
          }
        ) as LpToken
        return lpToken
      })
    ),
    (t) => toPubString(t.mint)
  )
  tokenAtom.set({ lpTokens, getLpToken: cloneFn(getLpToken) })
}, [createSubscribePath(() => tokenAtom, 'tokens') /* TODO should also subscribe from ammJsonInfos */])
