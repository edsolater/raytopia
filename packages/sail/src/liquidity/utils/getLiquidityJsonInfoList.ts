import { jFetch } from '@edsolater/jfetch'
import { LiquidityRawAPIJsonFile } from '../type'

/**
 * have cache
 */
export async function getLiquidityJsonInfoList() {
  const response =  await jFetch<LiquidityRawAPIJsonFile>('https://api.raydium.io/v2/sdk/liquidity/mainnet.json', {
    cacheMaxAcceptDuraction: 1 * 60 * 1000 // cache one minute
  })
  const liquidityInfoList = [...(response?.official ?? []), ...(response?.unOfficial ?? [])]
  return liquidityInfoList
}
