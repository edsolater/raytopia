import { gte } from '@edsolater/fnkit'
import { createXStore, createZustandStoreHook, XStoreAtom } from '@edsolater/xstore'
import { Token, PublicKeyish, WSOL,TokenAmount  } from '@raydium-io/raydium-sdk'
import { Adapter, WalletName } from '@solana/wallet-adapter-base'
import { Wallet } from '@solana/wallet-adapter-react'
import { PublicKey, Keypair, Transaction, } from '@solana/web3.js'
import { QuantumSOLAmount, isQuantumSOL, WSOLMint } from '../token'
import { HexAddress } from '../types/constants'
import { ITokenAccount, TokenAccountRawInfo } from './type'
import BN from 'bn.js'
import { isToken } from '../functions/dataType'

export type WalletStore = {
  // owner
  owner: PublicKey | undefined
  /** old version of currentWallet */
  adapter?: Adapter

  // a experimental feature (owner isn't in shadowOwners)
  /** each Keypair object hold both publicKey and secret key */
  shadowKeypairs?: Keypair[]
  availableWallets: Wallet[]
  currentWallet?: Wallet | null
  connected: boolean
  disconnecting: boolean
  connecting: boolean
  select(walletName: WalletName): void
  signAllTransactions: (transactions: Transaction[]) => Promise<Transaction[]> // if not connected, return empty array
  disconnect(): Promise<unknown>
  /** only for Dev */
  inSimulateMode: boolean

  solBalance?: BN | undefined

  /** this is a some of wsol's tokenAccounts's amount (sol / wsol is special) */
  allWsolBalance?: BN | undefined

  /** only include ATA (for this app only accept ATA account, no old tokenAccount ) */
  tokenAccounts: ITokenAccount[]

  /** pass to SDK */
  tokenAccountRawInfos: TokenAccountRawInfo[]

  /** SOL  */
  nativeTokenAccount: ITokenAccount | undefined

  /** raw: include no ATA (only use it in migrate detect) */
  allTokenAccounts: ITokenAccount[]

  // it can consider QuantumSOL
  // QuantumSOL(default) / QuantumSOL(VersionSOL) will get undefined tokenAccount
  // QuantumSOL(VersionWSOL) will get WSOL tokenAccount
  getTokenAccount(target: Token | PublicKeyish | undefined): ITokenAccount | undefined

  /**
   * has QuantumSOL,
   * for balance without QuantumSOL, use `pureBalances`
   */
  balances: Record<HexAddress, TokenAmount>

  /**
   * only if shadowWallet is on
   * @todo not imply yet!
   */
  shadowBalances?: Record<HexAddress, TokenAmount>

  /**
   * rawbalance is BN , has QuantumSOL,
   * for balance without QuantumSOL, use `pureRawBalances`
   */
  rawBalances: Record<HexAddress, BN>

  /**
   * no QuantumSOL,
   * for balance with QuantumSOL, use `balance`
   */
  pureBalances: Record<HexAddress, TokenAmount>

  /**
   * rawbalance is BN , no QuantumSOL,
   * for balance with QuantumSOL, use `pureBalances`
   */
  pureRawBalances: Record<HexAddress, BN>

  // it can consider QuantumSOL
  getBalance(target: Token | PublicKeyish | undefined): TokenAmount | QuantumSOLAmount | undefined
  // it can consider QuantumSOL
  getRawBalance(target: Token | PublicKeyish | undefined): BN | undefined

  checkWalletHasEnoughBalance(minBalance: TokenAmount | undefined): boolean

  whetherTokenAccountIsExist(mint: PublicKeyish): boolean
  findTokenAccount(mint: PublicKeyish): ITokenAccount | undefined

  // just for trigger refresh
  refreshCount: number
  refreshWallet(): void
}

export type WalletAtom = XStoreAtom<WalletStore>
export const walletAtom = createXStore<WalletStore>({
  name:'wallet Atom',
  default: {
    // owner
    owner: undefined,
    availableWallets: [],
    connected: false,
    disconnecting: false,
    connecting: false,
    select: () => {},
    signAllTransactions: () => Promise.resolve([]),
    disconnect: () => Promise.resolve(),
    /** only for Dev */
    inSimulateMode: false,

    tokenAccounts: [],
    tokenAccountRawInfos: [],
    nativeTokenAccount: undefined,
    allTokenAccounts: [],
    getTokenAccount(target) {
      if (!target) return undefined
      if (isQuantumSOL(target) && target.collapseTo !== 'wsol') {
        return undefined
      } else {
        const mint = isToken(target) ? String(target.mint) : String(target)
        const tokenAccounts = walletAtom.get().tokenAccounts
        return tokenAccounts.find((ta) => String(ta.mint) === mint)
      }
    },

    balances: {},
    rawBalances: {},
    pureBalances: {},
    pureRawBalances: {},
    getBalance(target) {
      if (!target) return undefined
      if (isQuantumSOL(target) && target.collapseTo === 'wsol') {
        return walletAtom.get().pureBalances[String(WSOLMint)]
      } else {
        const mint = isToken(target) ? String(target.mint) : String(target)
        return walletAtom.get().balances[mint]
      }
    },
    getRawBalance(target) {
      if (!target) return undefined
      if (isQuantumSOL(target)) {
        return target.collapseTo === 'wsol' ? walletAtom.get().pureRawBalances[WSOL.mint] : walletAtom.get().solBalance
      } else {
        const mint = isToken(target) ? String(target.mint) : String(target)
        return walletAtom.get().rawBalances[mint]
      }
    },

    checkWalletHasEnoughBalance(minBalance) {
      if (!minBalance) return false
      const userBalance = walletAtom.get().getBalance(minBalance.token)
      if (!userBalance) return false
      return gte(userBalance.toExact(), minBalance.toExact())
    },

    whetherTokenAccountIsExist(mint: PublicKeyish) {
      return walletAtom.get().tokenAccounts.some(({ mint: existMint }) => String(existMint) === String(mint))
    },
    findTokenAccount(mint: PublicKeyish) {
      return walletAtom.get().tokenAccounts.find(({ mint: existMint }) => String(existMint) === String(mint))
    },
    refreshCount: 0,
    async refreshWallet() {
      // will refresh: tokenAccounts, balances, etc.
      // set((s) => ({
      //   refreshCount: s.refreshCount + 1
      // }))
    }
  }
}) as WalletAtom


const useWallet = createZustandStoreHook(walletAtom)
export default useWallet
