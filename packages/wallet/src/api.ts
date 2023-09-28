/**
 * This file contains an interface for working with a wallet, which has a Browser and NodeJS implementation in the appropiate modules.
 * @packageDocumentation
 */
import {
  AddressBech32,
  AddressesAndCollaterals,
  HexTransactionWitnessSet,
  MarloweTxCBORHex,
  Token,
  TxOutRef,
} from "@marlowe.io/runtime-core";

export type WalletDI = { wallet: WalletAPI };
/**
 * The WalletAPI is an interface for interacting with a Cardano wallet.
 */
export interface WalletAPI {
  // DISCUSSION: Should this function receive a timeout and checkinterval?
  // DISCUSSION: Should this be a part of the base API or an extended functionality on top of
  //              `getUTxOs` similar to `getAddressesAndCollaterals`
  /**
   * Waits for a transaction to be confirmed.
   * @experimental
   * @param txHash the transaction hash
   * @returns true if the transaction is confirmed, false otherwise
   */
  waitConfirmation(txHash: string): Promise<boolean>;
  // DISCUSSION: should we create different Nominal types for different CBOR representations and mix and match accordingly?
  //             maybe the WalletAPI should be generic on the CBOR representation, and it is necesary to make sure that the
  //             generation and consumption of those CBOR are compatible.
  // TODO: See if we can we improve the Error? CIP30 talks about DataSignError and TxSignError
  //  https://github.com/cardano-foundation/CIPs/tree/master/CIP-0030#datasignerror
  //  https://github.com/cardano-foundation/CIPs/tree/master/CIP-0030#txsignerror
  /**
   * Ask the wallet to sign a transaction
   * @param tx A CBOR encoded transaction
   * @returns The signed transaction or throws
   * @throws `Error` if there was a problem signing the transaction
   *
   * @experimental
   *
   * @remarks
   * CIP30 expects a CBOR Transaction, which consists of <txBody + witness>. The
   * Marlowe runtime default flow returns just the txBody, to get what CIP30 expects
   * you need to pass an Accept header when creating a contract or applying inputs.
   * The header is `Accept "application/vendor.iog.marlowe-runtime.contract-tx-json"`
   * and it is automatically included in the @marlowe.io/runtime-* packages.
   */
  signTx(tx: MarloweTxCBORHex): Promise<HexTransactionWitnessSet>;
  /**
   * Returns an address to be used as Change Address when balancing transactions.
   */
  getChangeAddress(): Promise<AddressBech32>;
  /**
   * Some wallets have a single address and some wallets derive multiple addresses from a single root private key.
   * This method helps to keep track of the used derived addresses.
   */
  getUsedAddresses(): Promise<AddressBech32[]>;
  /**
   * A list of UTXO to use as collaterals
   * @see {@link https://docs.cardano.org/plutus/collateral-mechanism/}
   */
  getCollaterals(): Promise<TxOutRef[]>;
  /**
   * @returns The list of UTXOs available to the wallet.
   */
  getUTxOs(): Promise<TxOutRef[]>;
  /**
   * Returns a flag that indicates wether the wallet is connected to the Mainnet or a Testnet.
   *
   * @remarks
   * The Network Id returned by CIP30 Interface doesn't provide information on which Testnet Network
   *       the extension in configured.
   * {@link https://github.com/cardano-foundation/CIPs/pull/323 | See github issue}
   *
   */
  isMainnet(): Promise<boolean>;
  // DISCUSSION: should we rename this function to getAssets?
  // DISCUSSION: Being this a Marlowe Wallet API, should we return a Marlowe Asset (Marlowe Token + Quantity) instead of
  //             CIP30 Token?
  /**
   * Get the tokens available to the wallet.
   * @experimental
   *
   * @remarks
   * The {@link @marlowe.io/runtime-core!asset.Token} type here refers to the `runtime-core` type and not the `language-core-v1` {@link @marlowe.io/language-core-v1!semantics/contract/common/token.Token}.
   */
  getTokens(): Promise<Token[]>;
  // DISCUSSION: Should we make this a separate function similar to `getAddressesAndCollaterals`?
  /**
   * A helper around `getTokens` that returns only the lovelace ammount.
   * @experimental
   */
  getLovelaces(): Promise<bigint>;
}

/**
 * Utility function to access common features required to balance a transaction
 * @param walletAPI An WalletAPI instance
 * @returns Address and collateral information
 */
export async function getAddressesAndCollaterals(
  walletAPI: WalletAPI
): Promise<AddressesAndCollaterals> {
  const changeAddress = await walletAPI.getChangeAddress();
  const usedAddresses = await walletAPI.getUsedAddresses();
  const collateralUTxOs = await walletAPI.getCollaterals();
  return {
    changeAddress,
    usedAddresses,
    collateralUTxOs,
  };
}
