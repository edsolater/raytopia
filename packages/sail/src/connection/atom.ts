/************
 * * * ATOM *
 ************/

import { createXStore, createZustandStoreHook, XStoreAtom } from '@edsolater/xstore'
import { Connection } from '@solana/web3.js'
import { initializeDefaultConnection } from './effects/initializeDefaultConnection'
import { Endpoint } from './type'
import { autoUpdateBlockchainTime } from './effects/autoUpdateBlockchainTime'
import { loadUserRPC } from './effects/loadUserRPC'
import { extractConnectionName } from './utils/extractConnectionName'
import { getChainDate } from './utils/getChainDate'
import { deleteRpc, swithRPC } from './utils/swithRPC'

export type ConnectionStore = {
  connection?: Connection
  version?: string | number
  availableEndPoints?: Endpoint[]
  // for online chain time is later than UTC
  chainTimeOffset?: number // UTCTime + onlineChainTimeOffset = onLineTime
  /**
   * for ui
   * maybe user customized
   * when isSwitchingRpcConnection it maybe not the currentConnection
   */
  currentEndPoint?: Endpoint
  /** recommanded */
  autoChoosedEndPoint?: Endpoint
  /** for ui loading */
  isLoading: boolean
  switchConnectionFailed: boolean
  userCostomizedUrlText: string
  loadingCustomizedEndPoint?: Endpoint
  /**
   * true: success to switch
   * false: fail to switch (connect error)
   * undefined: get result but not target endpoint (maybe user have another choice)
   */
  readonly switchRpc: (endPoint: Endpoint) => Promise<boolean | undefined>
  /**
   * true: success to switch
   * false: fail to switch (connect error)
   * undefined: get result but not target endpoint (maybe user have another choice)
   */
  readonly deleteRpc: (endPointUrl: Endpoint['url']) => Promise<boolean | undefined>
  readonly extractConnectionName: (url: string) => string
  readonly getChainDate: () => Date
}

export type ConnectionAtom = XStoreAtom<ConnectionStore>

export const connectionAtom = createXStore<ConnectionStore>({
  name: 'connectionAtom',
  default: {
    availableEndPoints: [],
    isLoading: false,
    switchConnectionFailed: false,
    userCostomizedUrlText: 'https://',
    switchRpc: swithRPC,
    deleteRpc: deleteRpc,
    extractConnectionName: extractConnectionName,
    getChainDate: getChainDate
  },
  atomEffects: [initializeDefaultConnection, autoUpdateBlockchainTime, loadUserRPC]
}) as ConnectionAtom //FIXME: why not auto intelligense? type recursive?

export const useConnection = createZustandStoreHook(connectionAtom) // temp for aerosol
