import { createAtomEffect, createSubscribePath } from '@edsolater/xstore'
import { toPubString } from '../../functions/toPubString'
import { tokenAtom, USER_ADDED_TOKEN_LIST_NAME } from '../atom'
import { sortTokens } from '../utils/sortTokens'

/**
 * a feature hook
 * base on user's token list settings, load corresponding tokens
 */
export const autoUpdateSelectableTokens = createAtomEffect(() => {
  const { tokenListSettings, verboseTokens, userAddedTokens, userFlaggedTokenMints } = tokenAtom.values
  const activeTokenListNames = Object.entries(tokenListSettings)
    .filter(([, setting]) => setting.isOn)
    .map(([name]) => name)

  const havUserAddedTokens = activeTokenListNames.some((tokenListName) => tokenListName === USER_ADDED_TOKEN_LIST_NAME)

  const verboseTokensMints = verboseTokens.map((t) => toPubString(t.mint))
  const filteredUserAddedTokens = (havUserAddedTokens ? [...userAddedTokens.values()] : []).filter(
    (i) => !verboseTokensMints.includes(toPubString(i.mint))
  )
  const settingsFiltedTokens = [...verboseTokens, ...filteredUserAddedTokens].filter((token) => {
    const isUserFlagged = tokenListSettings[USER_ADDED_TOKEN_LIST_NAME] && userFlaggedTokenMints.has(String(token.mint))
    const isOnByTokenList = activeTokenListNames.some((tokenListName) =>
      tokenListSettings[tokenListName]?.mints?.has(String(token.mint))
    )
    return isUserFlagged || isOnByTokenList
  })

  tokenAtom.set({
    allSelectableTokens: sortTokens(settingsFiltedTokens)
  })
}, [
  createSubscribePath(
    () => tokenAtom,
    ['verboseTokens', 'userAddedTokens', 'tokenListSettings', 'userFlaggedTokenMints', 'sortTokens']
  )
  // TODO FIXME: should also change when wallet owner change
])
