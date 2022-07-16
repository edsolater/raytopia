/*****************
 * * ATOM EFFECT *
 *****************/

import { minus, mul } from '@edsolater/fnkit'
import { createAtomEffect, createSubscribePath } from '@edsolater/xstore'
import { Connection } from '@solana/web3.js'
import { connectionAtom, ConnectionAtom } from '../atom'

/** Atom effect */
export const autoUpdateBlockchainTime = createAtomEffect(() => {
  const { connection } = connectionAtom.values
  updateChinTimeOffset(connection, connectionAtom)
  const timeId = setInterval(() => {
    updateChinTimeOffset(connection, connectionAtom)
  }, 1000 * 60 * 5)
  return () => clearInterval(timeId) // TODO: haven't imply clean fn yet
}, [createSubscribePath(() => connectionAtom, 'connection')])

async function updateChinTimeOffset(connection: Connection | undefined, connectionAtom: ConnectionAtom) {
  if (!connection) return
  const chainTime = await connection.getBlockTime(await connection.getSlot())
  if (!chainTime) return
  const offset = Number(minus(mul(chainTime, 1000), Date.now()))
  connectionAtom.set({
    chainTimeOffset: offset
  })
}
