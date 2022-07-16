import { flatMapEntries, groupBy, map, mapEntry, shakeNil } from '@edsolater/fnkit'
import { jFetch } from '@edsolater/jfetch'
import toTokenPrice from '../../functions/toTokenPrice'
import { tokenAtom } from '../atom'

export async function refreshTokenPrice() {
  const { tokenJsonInfos } = tokenAtom.get()
  if (!Object.values(tokenJsonInfos).length) return
  const coingeckoIds = Object.values(tokenJsonInfos)
    .map((t) => t?.extensions?.coingeckoId)
    .filter(Boolean)
  const coingeckoPrices = await jFetch<Record<string, { usd?: number }>>(
    `https://api.coingecko.com/api/v3/simple/price?ids=${coingeckoIds}&vs_currencies=usd`,
    { cacheMaxAcceptDuraction: 400 }
  )
  if (!coingeckoPrices) return

  const coingeckoIdMap = shakeNil(groupBy(Object.values(tokenJsonInfos), (i) => i.extensions?.coingeckoId))
  const coingeckoTokenPrices = shakeNil(
    flatMapEntries(
      coingeckoPrices,
      ([key, value]) =>
        coingeckoIdMap[key]?.map((token) => [
          token.mint,
          value.usd ? toTokenPrice(token, value.usd, { alreadyDecimaled: true }) : undefined
        ]) ?? []
    )
  )

  const raydiumPrices = await jFetch<Record<string, number>>('https://api.raydium.io/v2/main/price')
  if (!raydiumPrices) return
  const raydiumTokenPrices = map(raydiumPrices, (v, k) =>
    tokenJsonInfos[k] ? toTokenPrice(tokenJsonInfos[k], v, { alreadyDecimaled: true }) : undefined
  )
  const tokenPrices = shakeNil({ ...coingeckoTokenPrices, ...raydiumTokenPrices })

  tokenAtom.set({ tokenPrices })
}
