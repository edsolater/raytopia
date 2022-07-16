import { createAtomEffect, createSubscribePath } from '@edsolater/xstore'
import { cloneFn } from '../../temp/createNewFn'
import { tokenAtom } from '../atom'
import { getPureToken, getToken } from '../utils/getToken'

export const refreshTokenGetterMethods = createAtomEffect(() => {
  tokenAtom.set({
    getToken: cloneFn(getToken),
    getPureToken: cloneFn(getPureToken)
  })
}, [createSubscribePath(() => tokenAtom, ['tokens', 'pureTokens', 'userAddedTokens'])])
