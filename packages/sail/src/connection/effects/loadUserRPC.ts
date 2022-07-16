import { concat, unifyByKey } from '@edsolater/fnkit'
import { createAtomEffect } from '@edsolater/xstore'
import { getLocalItem } from '../../temp/jStorage'
import { connectionAtom, ConnectionAtom } from '../atom'
import { UserCustomizedEndpoint } from '../type'
import { LOCALSTORAGE_KEY_USER_RPC } from '../utils/swithRPC'

export const loadUserRPC = createAtomEffect(() => {
  const storagedEndpoints = getLocalItem<UserCustomizedEndpoint[]>(LOCALSTORAGE_KEY_USER_RPC)
  connectionAtom.set((s) => ({
    availableEndPoints: unifyByKey(concat(s.availableEndPoints, storagedEndpoints), (i) => i.url)
  }))
}, [])
