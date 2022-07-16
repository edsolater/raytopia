import { connectionAtom } from '../atom'

export const getChainDate = () => new Date(Date.now() + (connectionAtom.values.chainTimeOffset ?? 0))
