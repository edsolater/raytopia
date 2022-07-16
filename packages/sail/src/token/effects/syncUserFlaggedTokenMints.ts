import { createAtomEffect, createSubscribePath } from '@edsolater/xstore'
import { getLocalItem, setLocalItem } from '../../temp/jStorage'
import { tokenAtom } from '../atom'

// whenever app start , get userFlaggedTokenMints from localStorage
const initlyLoadUserFlaggedTokenMints = createAtomEffect(() => {
  const recordedUserFlaggedTokenMints = getLocalItem<string[]>('USER_FLAGGED_TOKEN_MINTS')
  if (!recordedUserFlaggedTokenMints?.length) return
  tokenAtom.set({ userFlaggedTokenMints: new Set(recordedUserFlaggedTokenMints) })
}, [])

// whenever userFlaggedTokenMints changed, save it to localStorage
const recordUserFlaggedTokenMints = createAtomEffect(() => {
  setLocalItem('USER_FLAGGED_TOKEN_MINTS', Array.from(tokenAtom.values.userFlaggedTokenMints))
}, [createSubscribePath(() => tokenAtom, 'userFlaggedTokenMints')])

export const syncUserFlaggedTokenMints = [initlyLoadUserFlaggedTokenMints, recordUserFlaggedTokenMints]
