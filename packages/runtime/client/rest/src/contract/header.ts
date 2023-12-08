import * as t from "io-ts/lib/index.js";
import * as O from "fp-ts/lib/Option.js";
import { optionFromNullable } from "io-ts-types";

import { MarloweVersion } from "@marlowe.io/language-core-v1/version";

import {
  BlockHeader,
  BlockHeaderGuard,
  Metadata,
  PolicyId,
  Tags,
  TagsGuard,
  ContractId,
  ContractIdGuard,
} from "@marlowe.io/runtime-core";

import { TxStatus } from "./transaction/status.js";

/**
 * A contract header contains minimal contract information that can be used to identify a contract.
 * Use {@link index.RestClient#getContractById} to get full contract details
 *
 * @see The {@link https://github.com/input-output-hk/marlowe-cardano/blob/b39fe3c3ed67d41cdea6d45700093e7ffa4fad62/marlowe-runtime-web/src/Language/Marlowe/Runtime/Web/Types.hs#L502 | The backend definition } of this type
 * @category Endpoint : Get Contracts
 */
export interface ContractHeader {
  /**
   * The contract id
   */
  contractId: ContractId;
  /**
   * The policy id of the role token minting policy
   */
  roleTokenMintingPolicyId: PolicyId;
  /**
   * The Marlowe version
   */
  version: MarloweVersion;
  /**
   * Optional tags associated with the contract
   */
  tags: Tags;
  /**
   * Optional metadata associated with the contract
   */
  metadata: Metadata;
  /**
   * Current status of the contract
   */
  status: TxStatus;
  /**
   * Basic information about the block the contract was created in (if any)
   */
  block: O.Option<BlockHeader>;
}

/**
 * This is a {@link !io-ts-usage | Dynamic type validator} for a {@link ContractHeaderGuard:type}.
 * @category Validator
 * @category Endpoint : Get Contracts
 * @hidden
 */
export const ContractHeaderGuard = t.type({
  contractId: ContractIdGuard,
  roleTokenMintingPolicyId: PolicyId,
  version: MarloweVersion,
  // TODO: Add continuations
  tags: TagsGuard,
  metadata: Metadata,
  status: TxStatus,
  block: optionFromNullable(BlockHeaderGuard),
});
