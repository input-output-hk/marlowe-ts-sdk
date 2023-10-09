import * as t from "io-ts/lib/index.js";
import { optionFromNullable } from "io-ts-types";

import { MarloweVersion } from "@marlowe.io/language-core-v1/version";

import {
  BlockHeader,
  Metadata,
  PolicyId,
  TagsGuard,
} from "@marlowe.io/runtime-core";

import { TxStatus } from "./transaction/status.js";
import { ContractIdGuard } from "@marlowe.io/runtime-core";
/**
 * A contract header contains minimal contract information that can be used to identify a contract.
 * Use TODO to get full contract details
 *
 * @see The {@link ContractHeader:var | dynamic validator} for this type.
 * @see The {@link https://github.com/input-output-hk/marlowe-cardano/blob/b39fe3c3ed67d41cdea6d45700093e7ffa4fad62/marlowe-runtime-web/src/Language/Marlowe/Runtime/Web/Types.hs#L502 | The backend definition } of this type
 * @category GetContractsResponse
 */
export interface ContractHeader extends t.TypeOf<typeof ContractHeader> {}
/**
 * This is a {@link !io-ts-usage | Dynamic type validator} for a {@link ContractHeader:type}.
 * @category Validator
 * @category GetContractsResponse
 */
export const ContractHeader = t.type({
  contractId: ContractIdGuard,
  roleTokenMintingPolicyId: PolicyId,
  version: MarloweVersion,
  // TODO: Add continuations
  tags: TagsGuard,
  metadata: Metadata,
  status: TxStatus,
  block: optionFromNullable(BlockHeader),
});
