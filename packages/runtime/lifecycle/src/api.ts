import { WalletAPI, WalletDI } from "@marlowe.io/wallet/api";
import {
  AssetId,
  ContractId,
  Metadata,
  PayoutAvailable,
  PayoutId,
  PayoutWithdrawn,
  Tags,
} from "@marlowe.io/runtime-core";
import { RestDI, RolesConfig } from "@marlowe.io/runtime-rest-client";
import { ISO8601 } from "@marlowe.io/adapter/time";
import { Contract, Input } from "@marlowe.io/language-core-v1";
import { Next } from "@marlowe.io/language-core-v1/next";

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
 * TODO: comment
 */
export interface ContractsAPI {
  /**
   * TODO: comment
   * @throws DecodingError
   */
  create(req: CreateRequest): Promise<ContractId>;
  // [[apply-inputs-next-provider]]
  // DISCUSSION: Instead of providing a function from "Next" => ApplyInputsRequest, I think
  //             this as a low level API should just receive the ApplyInputsRequest, and if we want we can
  //             add a "higher-level" helper
  //             Search for [apply-inputs-next-provider] for usage
  /**
   * TODO: comment
   * @throws DecodingError
   */
  applyInputs(
    contractId: ContractId,
    provideInput: ProvideInput
  ): Promise<ContractId>;
}
export type PayoutsDI = WalletDI & RestDI;

export interface PayoutsAPI {
  /**
   * TODO: comment
   * @throws DecodingError
   */
  available(filters?: Filters): Promise<PayoutAvailable[]>;

  /**
   * TODO: comment
   * @throws DecodingError
   */
  withdraw(payoutIds: PayoutId[]): Promise<void>;
  /**
   * TODO: comment
   * @throws DecodingError
   */
  withdrawn(filters?: Filters): Promise<PayoutWithdrawn[]>;
}

export type RuntimeLifecycle = {
  wallet: WalletAPI;
  contracts: ContractsAPI;
  payouts: PayoutsAPI;
};

export const onlyByContractIds = (contractIds: ContractId[]) =>
  ({
    byContractIds: contractIds,
    byMyRoleTokens: (myRoles) => myRoles,
  } as Filters);

export type Filters = {
  byContractIds: ContractId[];
  byMyRoleTokens: (myRolesOnWallet: AssetId[]) => AssetId[];
};
