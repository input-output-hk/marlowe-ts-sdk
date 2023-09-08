import * as TE from "fp-ts/lib/TaskEither.js";
import * as F from "fp-ts/lib";
import { WalletAPI } from "@marlowe.io/wallet/api";
import * as O from "fp-ts/lib/Option.js";
import { CreateRequest, ProvideInput } from "./tx.js";
import {
  AssetId,
  ContractId,
  PayoutAvailable,
  PayoutId,
  PayoutWithdrawn,
} from "@marlowe.io/runtime-core";
import { DecodingError } from "@marlowe.io/adapter/codec";

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
