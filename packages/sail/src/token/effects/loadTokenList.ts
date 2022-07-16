import { asyncMapAllSettled, listToMap, map, replaceItem } from '@edsolater/fnkit'
import { jFetch } from '@edsolater/jfetch'
import { createAtomEffect } from '@edsolater/xstore'
import { Token, WSOL, PublicKeyish } from '@raydium-io/raydium-sdk'
import toPubString from '../../functions/toMintString'
import { replaceValue } from '../../temp/replaceItem'
import { HexAddress, SrcAddress } from '../../types/constants'
import {
  useToken,
  RAYDIUM_MAINNET_TOKEN_LIST_NAME,
  SOLANA_TOKEN_LIST_NAME,
  RAYDIUM_DEV_TOKEN_LIST_NAME,
  tokenAtom
} from '../atom'
import {
  TokenJson,
  TokenListFetchConfigItem,
  RaydiumTokenListJsonInfo,
  RaydiumDevTokenListJsonInfo,
  SplToken
} from '../type'
import { QuantumSOL, QuantumSOLVersionSOL, QuantumSOLVersionWSOL, SOLUrlMint, WSOLMint } from '../utils/quantumSOL'
import {
  isRaydiumMainnetTokenListName,
  isRaydiumDevTokenListName,
  rawTokenListConfigs
} from '../utils/rawTokenLists.config'
import { SOLMint } from '../utils/wellknownToken.config'

export const loadTokenList = createAtomEffect(() => {
  loadTokens()
}, [])

function deleteFetchedNativeSOLToken(tokenJsons: TokenJson[]) {
  return tokenJsons.filter((tj) => tj.mint !== toPubString(SOLMint))
}

// function uniqueItems<T>(items: T[], mapper?: (old: S)=>):T

async function fetchTokenLists(rawListConfigs: TokenListFetchConfigItem[]): Promise<{
  devMints: string[]
  unOfficialMints: string[]
  officialMints: string[]
  tokens: TokenJson[]
  blacklist: string[]
}> {
  const devMints: string[] = []
  const unOfficialMints: string[] = []
  const officialMints: string[] = []
  const blacklist: string[] = []
  const tokens: TokenJson[] = []
  await asyncMapAllSettled(rawListConfigs, async (raw) => {
    const response = await jFetch<RaydiumTokenListJsonInfo | RaydiumDevTokenListJsonInfo>(raw.url)
    if (isRaydiumMainnetTokenListName(response)) {
      unOfficialMints.push(...response.unOfficial.map(({ mint }) => mint))
      officialMints.push(...deleteFetchedNativeSOLToken(response.official).map(({ mint }) => mint))
      tokens.push(...deleteFetchedNativeSOLToken(response.official), ...response.unOfficial)
      blacklist.push(...response.blacklist)
    }
    if (isRaydiumDevTokenListName(response)) {
      devMints.push(...response.tokens.map(({ mint }) => mint))
      tokens.push(...response.tokens)
    }
  })

  return { devMints, unOfficialMints, officialMints, tokens, blacklist }
}

async function fetchTokenIconInfoList() {
  return jFetch<Record<HexAddress, SrcAddress>>('/custom-token-icon-list.json')
}

export function createSplToken(
  info: Partial<TokenJson> & { mint: HexAddress; decimals: number },
  customTokenIcons?: Record<string, SrcAddress>
): SplToken {
  const { mint, symbol, name = symbol, decimals, ...rest } = info
  // TODO: recordPubString(token.mint)
  const splToken = Object.assign(new Token(mint, decimals, symbol, name), { icon: '', extensions: {}, id: mint }, rest)
  if (customTokenIcons?.[mint]) {
    splToken.icon = customTokenIcons[mint] ?? ''
  }
  return splToken
}
export function toSplTokenInfo(splToken: SplToken): TokenJson {
  return {
    symbol: splToken.symbol ?? '',
    name: splToken.name ?? '',
    mint: toPubString(splToken.mint),
    decimals: splToken.decimals,
    extensions: splToken.extensions,
    icon: splToken.icon
  }
}

async function loadTokens() {
  const customTokenIcons = await fetchTokenIconInfoList()

  const {
    devMints,
    unOfficialMints,
    officialMints,
    tokens: allTokens,
    blacklist: _blacklist
  } = await fetchTokenLists(rawTokenListConfigs)
  const blacklist = new Set(_blacklist)
  tokenAtom.set((s) => ({
    blacklist: _blacklist,
    tokenListSettings: {
      ...s.tokenListSettings,

      [RAYDIUM_MAINNET_TOKEN_LIST_NAME]: {
        ...s.tokenListSettings[RAYDIUM_MAINNET_TOKEN_LIST_NAME],
        mints: new Set(officialMints)
      },

      [SOLANA_TOKEN_LIST_NAME]: {
        ...s.tokenListSettings[SOLANA_TOKEN_LIST_NAME],
        mints: new Set(unOfficialMints)
      },

      [RAYDIUM_DEV_TOKEN_LIST_NAME]: {
        ...s.tokenListSettings[RAYDIUM_DEV_TOKEN_LIST_NAME],
        mints: new Set(devMints)
      }
    }
  }))

  const unsortedTokenInfos = allTokens
    /* shake off tokens in raydium blacklist */
    .filter((info) => !blacklist.has(info.mint))

  const startWithSymbol = (s: string) => !/^[a-zA-Z]/.test(s)
  const splTokenJsonInfos = listToMap(
    unsortedTokenInfos.sort((a, b) => {
      const aPriorityOrder = officialMints.includes(a.mint) ? 1 : unOfficialMints.includes(a.mint) ? 2 : 3
      const bPriorityOrder = officialMints.includes(b.mint) ? 1 : unOfficialMints.includes(b.mint) ? 2 : 3
      const priorityOrderDiff = aPriorityOrder - bPriorityOrder
      if (priorityOrderDiff === 0) {
        const aStartWithSymbol = startWithSymbol(a.symbol)
        const bStartWithSymbol = startWithSymbol(b.symbol)
        if (aStartWithSymbol && !bStartWithSymbol) return 1
        if (!aStartWithSymbol && bStartWithSymbol) return -1
        return a.symbol.localeCompare(b.symbol)
      } else {
        return priorityOrderDiff
      }
    }),
    (i) => i.mint
  )

  const pureTokens = map(splTokenJsonInfos, (tokenJsonInfo) => createSplToken(tokenJsonInfo, customTokenIcons))

  const tokens = { ...pureTokens, [toPubString(QuantumSOL.mint)]: QuantumSOL }

  const verboseTokens = [
    QuantumSOLVersionSOL,
    ...Object.values(replaceValue(pureTokens, (v, k) => k === String(WSOL.mint), QuantumSOLVersionWSOL))
  ]

  tokenAtom.set((s) => ({
    canFlaggedTokenMints: new Set(
      Object.values(tokens)
        .filter((token) => !s.tokenListSettings[RAYDIUM_MAINNET_TOKEN_LIST_NAME].mints?.has(String(token.mint)))
        .map((token) => String(token.mint))
    )
  }))

  /** NOTE -  getToken place 1 */
  /** exact mode: 'so111111112' will be QSOL-WSOL 'sol' will be QSOL-SOL */
  function getToken(mint: PublicKeyish | undefined, options?: { exact?: boolean }): SplToken | undefined {
    if (String(mint) === SOLUrlMint) {
      return QuantumSOLVersionSOL
    }
    if (String(mint) === String(WSOLMint) && options?.exact) {
      return QuantumSOLVersionWSOL
    }
    return tokens[String(mint)]
  }

  function getPureToken(mint: PublicKeyish | undefined): SplToken | undefined {
    return pureTokens[String(mint)]
  }

  tokenAtom.set({
    tokenJsonInfos: listToMap(allTokens, (i) => i.mint),
    tokens,
    pureTokens,
    verboseTokens,
    getToken,
    getPureToken
  })
}
