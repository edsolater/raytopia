import { assert, unifyByKey } from '@edsolater/fnkit'
import { Connection } from '@solana/web3.js'
import { setLocalItem, setSessionItem } from '../../temp/jStorage'
import { connectionAtom } from '../atom'
import { SESSION_STORAGE_USER_SELECTED_RPC } from '../effects/initializeDefaultConnection'
import { Endpoint, UserCustomizedEndpoint } from '../type'
import { extractConnectionName } from './extractConnectionName'

export const LOCALSTORAGE_KEY_USER_RPC = 'user_rpc'

/**
 * use this function to switch to another RPC. accept _official RPC_ or _customized RPC_
 */
export async function swithRPC(customizedEndPoint: Endpoint) {
  try {
    if (!customizedEndPoint.url.replace(/.*:\/\//, '')) return
    // set loading
    connectionAtom.set({ isLoading: true, loadingCustomizedEndPoint: customizedEndPoint })

    const response = await fetch(customizedEndPoint.url, {
      headers: {
        'content-type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'getEpochInfo' })
    })
    assert(response.ok)
    const newConnection = new Connection(customizedEndPoint.url, 'confirmed')
    connectionAtom.set({
      connection: newConnection,
      currentEndPoint: customizedEndPoint,
      switchConnectionFailed: false
    })

    const { currentEndPoint } = connectionAtom.values

    if (currentEndPoint === customizedEndPoint) {
      const rpcName = customizedEndPoint.name ?? extractConnectionName(customizedEndPoint.url)
      const newEndPoint = { ...customizedEndPoint, name: rpcName }
      // cancel loading status
      connectionAtom.set({ isLoading: false, switchConnectionFailed: false })

      // TODO useNotification should upgrade to loggerAtom
      // const { logSuccess } = useNotification.getState()
      // logSuccess('RPC Switch Success ', `new rpc: ${newEndPoint.name}`)

      // record selection to senssionStorage
      setSessionItem(SESSION_STORAGE_USER_SELECTED_RPC, newEndPoint)

      const isUserAdded = connectionAtom.values.availableEndPoints?.map((i) => i.url).includes(newEndPoint.url)

      if (isUserAdded) {
        // record userAdded to localStorage
        setLocalItem(LOCALSTORAGE_KEY_USER_RPC, (v) =>
          unifyByKey([{ ...newEndPoint, isUserCustomized: true } as UserCustomizedEndpoint, ...(v ?? [])], (i) => i.url)
        )
      }

      connectionAtom.set((s) => {
        const unified = unifyByKey(
          [...(s.availableEndPoints ?? []), { ...newEndPoint, isUserCustomized: true } as UserCustomizedEndpoint],
          (i) => i.url
        )
        return {
          currentEndPoint: newEndPoint,
          availableEndPoints: unified
        }
      })

      return true
    }
    return undefined
  } catch {
    const { currentEndPoint } = connectionAtom.values
    // cancel loading status
    connectionAtom.set({ isLoading: false, loadingCustomizedEndPoint: undefined, switchConnectionFailed: true })
    // TODO useNotification should upgrade to loggerAtom
    // const { logError } = useNotification.getState()
    // logError('RPC Switch Failed')
    return false
  }
}
export async function deleteRpc(endPointUrl: string) {
  setLocalItem(LOCALSTORAGE_KEY_USER_RPC, (v: UserCustomizedEndpoint[] | undefined) =>
    (v ?? []).filter((i) => i.url !== endPointUrl)
  )
  connectionAtom.set({
    availableEndPoints: (connectionAtom.values.availableEndPoints ?? []).filter((i) => i.url !== endPointUrl)
  })
  return true
}
