import { createAtomEffect, createSubscribePath } from '@edsolater/xstore'
import { connectionAtom } from '../../connection'
import { getPureToken, tokenAtom } from '../../token'
import { walletAtom } from '../atom'
import { parseBalanceFromTokenAccount } from '../utils/parseBalanceFromTokenAccount'


/** it is base on tokenAccounts, so when tokenAccounts refresh, balance will auto refresh */
export const initWalletBalance = createAtomEffect(() => {
  const { allTokenAccounts, owner } = walletAtom.get()
  const { connection } = connectionAtom.get()

  if (!connection || !owner) {
    walletAtom.set({
      solBalance: undefined,
      balances: {},
      rawBalances: {},
      pureBalances: {},
      pureRawBalances: {}
    })
    return
  }

  // from tokenAccount to tokenAmount
  const { solBalance, allWsolBalance, balances, rawBalances, pureBalances, pureRawBalances } =
    parseBalanceFromTokenAccount({
      getPureToken,
      allTokenAccounts
    })

  walletAtom.set({
    solBalance,
    allWsolBalance,
    balances,
    rawBalances,
    pureBalances,
    pureRawBalances
  })
}, [
  createSubscribePath(() => walletAtom, ['allTokenAccounts', 'owner']),
  createSubscribePath(() => tokenAtom, ['pureTokens']),
  createSubscribePath(() => connectionAtom, ['connection'])
])
