import * as t from "io-ts/lib/index.js";
import * as O from "fp-ts/lib/Option.js";
import { optionFromNullable } from "io-ts-types";

import * as G from "@marlowe.io/language-core-v1/guards";
import {
  Tags,
  TagsGuard,
  Metadata,
  BlockHeader,
  BlockHeaderGuard,
  TxOutRef,
  TxId,
  ContractId,
} from "@marlowe.io/runtime-core";

import { ContractIdGuard } from "@marlowe.io/runtime-core";
import { TxStatus } from "./status.js";
import { BuiltinByteString } from "@marlowe.io/language-core-v1";

// TODO: Link to getTransactions endpoint
/**
 * A Marlowe TxHeader contains minimal information that can be used to identify a Marlowe transaction.
 * Use {@link index.RestAPI#getContractTransactionById} to get full transaction details
 *
 * @see The {@link https://github.com/input-output-hk/marlowe-cardano/blob/b39fe3c3ed67d41cdea6d45700093e7ffa4fad62/marlowe-runtime-web/src/Language/Marlowe/Runtime/Web/Types.hs#L502 | The backend definition } of this type
 * @category GetTransactionsForContractResponse
 */
export interface TxHeader {
  /**
   * The ID of the Marlowe contract instance
   */
  contractId: ContractId;
  transactionId: TxId;
  continuations: O.Option<BuiltinByteString>;
  tags: Tags;
  metadata: Metadata;
  status: TxStatus;
  block: O.Option<BlockHeader>;
  utxo: O.Option<TxOutRef>;
}

/**
 * This is a {@link !io-ts-usage | Dynamic type validator} for a {@link TxHeader}.
 * @category Validator
 */
export const TxHeaderGuard = t.type({
  contractId: ContractIdGuard,
  transactionId: TxId,
  continuations: optionFromNullable(G.BuiltinByteString),
  tags: TagsGuard,
  metadata: Metadata,
  status: TxStatus,
  block: optionFromNullable(BlockHeaderGuard),
  utxo: optionFromNullable(TxOutRef),
});
