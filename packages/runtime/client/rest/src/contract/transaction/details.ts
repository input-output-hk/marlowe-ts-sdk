import { optionFromNullable } from "io-ts-types";
import * as t from "io-ts/lib/index.js";

import { ISO8601 } from "@marlowe.io/adapter/time";

import {
  BuiltinByteString,
  Input,
  MarloweState,
  Contract,
} from "@marlowe.io/language-core-v1";
import * as G from "@marlowe.io/language-core-v1/guards";
import {
  TagsGuard,
  Metadata,
  BlockHeader,
  TxOutRef,
  TxId,
  TextEnvelopeGuard,
} from "@marlowe.io/runtime-core";

import { ContractIdGuard } from "@marlowe.io/runtime-core";
import { TxStatus } from "./status.js";

export type Details = t.TypeOf<typeof Details>;
export const Details = t.type({
  contractId: ContractIdGuard,
  transactionId: TxId,
  continuations: optionFromNullable(G.BuiltinByteString),
  tags: TagsGuard,
  metadata: Metadata,
  status: TxStatus,
  block: optionFromNullable(BlockHeader),
  inputUtxo: TxOutRef,
  inputs: t.array(G.Input),
  outputUtxo: optionFromNullable(TxOutRef),
  outputContract: optionFromNullable(G.Contract),
  outputState: optionFromNullable(G.MarloweState),
  consumingTx: optionFromNullable(TxId),
  invalidBefore: ISO8601,
  invalidHereafter: ISO8601,
  txBody: optionFromNullable(TextEnvelopeGuard),
});
