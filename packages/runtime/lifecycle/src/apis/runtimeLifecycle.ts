import * as TE from "fp-ts/lib/TaskEither.js";
import * as F from "fp-ts/lib";
import { WalletAPI } from "@marlowe.io/wallet/api";
import * as O from "fp-ts/lib/Option.js";
import { CreateRequest, ProvideInput, TxAPI } from "./tx.js";
import {
  AssetId,
  ContractId,
  PayoutAvailable,
  PayoutId,
  PayoutWithdrawn,
} from "@marlowe.io/runtime-core";
import { DecodingError } from "@marlowe.io/adapter/codec";

export type RuntimeLifecycle = {
  wallet: WalletAPI;
  contracts: {
    create: (
      payload: CreateRequest
    ) => TE.TaskEither<Error | DecodingError, ContractId>;
    applyInputs: (
      contractId: ContractId
    ) => (
      provideInput: ProvideInput
    ) => TE.TaskEither<Error | DecodingError, ContractId>;
  };
  payouts: {
    available: (
      filtersOption: O.Option<Filters>
    ) => TE.TaskEither<Error | DecodingError, PayoutAvailable[]>;
    withdraw: (
      payoutIds: PayoutId[]
    ) => TE.TaskEither<Error | DecodingError, void>;
    withdrawn: (
      filtersOption: O.Option<Filters>
    ) => TE.TaskEither<Error | DecodingError, PayoutWithdrawn[]>;
  };
};

export const onlyByContractIds: (
  contractIds: ContractId[]
) => O.Option<Filters> = (contractIds) =>
  O.some({
    byContractIds: contractIds,
    byMyRoleTokens: (myRoles) => myRoles,
  });

export type Filters = {
  byContractIds: ContractId[];
  byMyRoleTokens: (myRolesOnWallet: AssetId[]) => AssetId[];
};
