import { WalletAPI, WalletDI } from "@marlowe.io/wallet/api";
import {
  AssetId,
  ContractId,
  Metadata,
  PayoutAvailable,
  PayoutId,
  PayoutWithdrawn,
  Tags,
  TxId,
} from "@marlowe.io/runtime-core";
import { RestDI, RolesConfig } from "@marlowe.io/runtime-rest-client";
import { ISO8601 } from "@marlowe.io/adapter/time";
import { Contract, Input } from "@marlowe.io/language-core-v1";
import { Next } from "@marlowe.io/language-core-v1/next";

export type RuntimeLifecycle = {
  wallet: WalletAPI;
  contracts: ContractsAPI;
  payouts: PayoutsAPI;
};

/**
 *
 * @description Dependency Injection for the Contract API
 * @hidden
 */
export type ContractsDI = WalletDI & RestDI;

export type ProvideInput = (next: Next) => ApplyInputsRequest;

export type CreateRequest = {
  contract: Contract;
  roles?: RolesConfig;
  tags?: Tags;
  metadata?: Metadata;
  minUTxODeposit?: number;
};

export type ApplyInputsRequest = {
  inputs: Input[];
  tags?: Tags;
  metadata?: Metadata;
  invalidBefore?: ISO8601;
  invalidHereafter?: ISO8601;
};
/**
 * This Interface provides capabilities for runnning a Contract over Cardano.
 */
export interface ContractsAPI {
  /**
   * Submit to the Cardano Ledger, the Transaction(Tx) that will create the Marlowe Contract passed in the request.
   * @param request Request parameters for creating a Marlowe Contract on Cardano
   * @throws DecodingError
   */
  submitCreateTx(request: CreateRequest): Promise<[ContractId, TxId]>;

  /**
   * @experimental
   * Submit to the Cardano Ledger & Wait Confirmation, the Transaction(Tx) that will create the Marlowe Contract passed in the request.
   * It's higher level capabilities compared to `submitCreateTx`.
   * It combines `submitCreateTx` & waitConfirmation for you to abstract Cardano infrastructure concerns.
   * @param request Request parameters for creating a Marlowe Contract on Cardano
   * @throws DecodingError
   */
  create(request: CreateRequest): Promise<ContractId>;

  /**
   * Submit to the Cardano Ledger, the Transaction(Tx) that will apply inputs to a given created contract (see `submitCreateTx`).
   * It's lower level version of `applyInputs`.
   * @param contractId Contract Id where inputs will be applied
   * @param inputsRequest inputs to apply
   * @throws DecodingError
   */
  submitApplyInputsTx(
    contractId: ContractId,
    inputsRequest: ApplyInputsRequest
  ): Promise<TxId>;

  /**
   * Provide Applicable Inputs and Reducibility Information for a given contract for the connected wallet.
   * @param contractId Contract Id of a created contract
   * @throws DecodingError
   */
  getNext(contractId: ContractId): Promise<Next>;

  /**
   * @experimental
   * Submit to the Cardano Ledger & Wait Confirmation, the Transaction(Tx) that will apply inputs to a given created contract (see `create`).
   * It's higher level version of `submitApplyInputsTx`.
   * It combines `submitApplyInputsTx`, `getNext` & waitConfirmation for you to abstract Cardano infrastructure concerns
   * and gives you the ability to describe the execution of a Marlowe Contract in a more declarative way.
   * @param contractId Contract Id where inputs will be applied
   * @param provideInput It's a function to provide where the current `Next` of the given `contractId` is feeded
   *                     and some applicable inputs needs to be returned.
   * @throws DecodingError
   */
  applyInputs(
    contractId: ContractId,
    provideInput: ProvideInput
  ): Promise<TxId>;

  /**
   * Waits for a transaction to be confirmed.
   * @experimental
   * @param txId the transaction hash/id to wait for confirmation
   * @returns true if the transaction is confirmed, false otherwise
   */

  waitConfirmation(txId: TxId): Promise<boolean>;
}
export type PayoutsDI = WalletDI & RestDI;

export interface PayoutsAPI {
  /**
   * Provide All the availaible payouts for the connected Wallet
   * @param filters provide filtering capabilities on the available payouts returned
   * @throws DecodingError
   */
  available(filters?: Filters): Promise<PayoutAvailable[]>;

  /**
   * TODO: comment
   * @throws DecodingError
   */
  withdraw(payoutIds: PayoutId[]): Promise<void>;
  /**
   * Provide All the withdrawn payouts for the connected Wallet
   * @param filters provide filtering capabilities on the withdrawn payouts returned
   * @throws DecodingError
   */
  withdrawn(filters?: Filters): Promise<PayoutWithdrawn[]>;
}

/**
 * Provide filtering capabilities on the payouts returned only by ContractIds
 * @param byContractIds filters the payouts by contract Ids
 * @throws DecodingError
 */
export const onlyByContractIds = (contractIds: ContractId[]) =>
  ({
    byContractIds: contractIds,
    byMyRoleTokens: (myRoles) => myRoles,
  } as Filters);

/**
 * Provide filtering capabilities on the payouts returned
 * @param byContractIds filters the payouts by contract Ids
 * @param byMyRoleTokens filters the payouts by role tokens owned in the connected wallet
 * @throws DecodingError
 */
export type Filters = {
  byContractIds: ContractId[];
  byMyRoleTokens: (myRolesOnWallet: AssetId[]) => AssetId[];
};
