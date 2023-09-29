import * as t from "io-ts/lib/index.js";
import { optionFromNullable } from "io-ts-types";

import * as G from "@marlowe.io/language-core-v1/guards";
import {
  Tags,
  Metadata,
  BlockHeader,
  TxOutRef,
  TxId,
} from "@marlowe.io/runtime-core";

import { ContractId } from "@marlowe.io/runtime-core";
import { TxStatus } from "./status.js";

// TODO: Link to getTransactions endpoint
/**
 * A Marlowe Transaction Header contains information about a contract transaction.
 *
 * @see The {@link TxHeader:var | dynamic validator} for this type.
 * @see The {@link https://github.com/input-output-hk/marlowe-cardano/blob/b39fe3c3ed67d41cdea6d45700093e7ffa4fad62/marlowe-runtime-web/src/Language/Marlowe/Runtime/Web/Types.hs#L502 | The backend definition } of this type
 */
export interface TxHeader extends t.TypeOf<typeof TxHeader> {}

/**
 * This is a {@link !io-ts-usage | Dynamic type validator} for a {@link TxHeader:type}.
 * @category Validator
 */
export const TxHeader = t.type({
  /**
   * The ID of the Marlowe contract instance
   */
  contractId: ContractId,
  transactionId: TxId,
  continuations: optionFromNullable(G.BuiltinByteString),
  tags: Tags,
  metadata: Metadata,
  status: TxStatus,
  block: optionFromNullable(BlockHeader),
  utxo: optionFromNullable(TxOutRef),
});
