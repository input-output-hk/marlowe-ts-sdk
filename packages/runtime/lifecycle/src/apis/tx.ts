import * as TE from "fp-ts/lib/TaskEither.js";
import { DecodingError } from "@marlowe.io/adapter/codec";
import { ISO8601 } from "@marlowe.io/adapter/time";

import { Contract } from "@marlowe.io/language-core-v1/semantics/contract/index.js";
import { Input } from "@marlowe.io/language-core-v1/semantics/contract/when/input/index.js";
import { Next } from "@marlowe.io/language-core-v1/semantics/next/index.js";

import { Tags, Metadata, ContractId, PayoutId } from "@marlowe.io/runtime-core";

import { RolesConfig } from "@marlowe.io/runtime-rest-client/contract/role.js";

// QUESTION: @N.H is this used?
export type TxAPI = {
  create: (
    payload: CreateRequest
  ) => TE.TaskEither<Error | DecodingError, ContractId>;
  applyInputs: (
    contractId: ContractId
  ) => (
    provideInput: ProvideInput
  ) => TE.TaskEither<Error | DecodingError, ContractId>;
  withdraw: (
    payoutIds: PayoutId[]
  ) => TE.TaskEither<Error | DecodingError, void>;
};

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
