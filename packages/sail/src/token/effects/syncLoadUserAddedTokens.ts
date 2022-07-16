import { createAtomEffect, createSubscribePath } from '@edsolater/xstore'
import { SplTokenJsonInfo } from '@raydium-io/raydium-sdk'
import toPubString from '../../functions/toMintString'
import { getLocalItem, setLocalItem } from '../../temp/jStorage'
import { tokenAtom } from '../atom'
import { createSplToken } from './loadTokenList'

const initlyLoadUserAddedTokens = createAtomEffect(() => {
  const userAddedTokens = getLocalItem<SplTokenJsonInfo[]>('TOKEN_LIST_USER_ADDED_TOKENS') ?? []
  tokenAtom.set({
    userAddedTokens: new Map(userAddedTokens.map((t) => [toPubString(t.mint), createSplToken({ ...t })]))
  })
}, [])

const recordUserAddedTokens = createAtomEffect(() => {
  const { userAddedTokens } = tokenAtom.get()
  setLocalItem('TOKEN_LIST_USER_ADDED_TOKENS', Array.from(userAddedTokens.values())) // add token / remove token
}, [createSubscribePath(() => tokenAtom, 'userAddedTokens')])

export const syncLoadUserAddedTokens = [initlyLoadUserAddedTokens, recordUserAddedTokens]