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
import { Contract, Environment, Input } from "@marlowe.io/language-core-v1";
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

export type CreateContractRequest = {
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
   * @param createContractRequest Request parameters for creating a Marlowe Contract on Cardano
   * @throws DecodingError
   */
  createContract(
    createContractRequest: CreateContractRequest
  ): Promise<[ContractId, TxId]>;

  /**
   * Submit to the Cardano Ledger, the Transaction(Tx) that will apply inputs to a given created contract.
   * @param contractId Contract Id where inputs will be applied
   * @param applyInputsRequest inputs to apply
   * @throws DecodingError
   */
  applyInputs(
    contractId: ContractId,
    applyInputsRequest: ApplyInputsRequest
  ): Promise<TxId>;

  /**
   * @experimental
   * Provide Applicability and Reducibility Information moving forward for a given contract connected to a wallet.
   * @description
   *  This piece of information should help you :
   *  - 1) Deciding which inputs to provide for the current state of the given contract
   *  - 2) Constructing the inputs to apply for a given contract
   * @param contractId Contract Id of a created contract
   * @throws DecodingError
   */
  getNextApplicabilityAndReducibility(
    contractId: ContractId,
    environement: Environment
  ): Promise<Next>;
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
