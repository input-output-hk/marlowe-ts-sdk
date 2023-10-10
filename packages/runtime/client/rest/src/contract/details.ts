import { optionFromNullable } from "io-ts-types";
import * as t from "io-ts/lib/index.js";
import { Contract, MarloweState } from "@marlowe.io/language-core-v1";
import * as G from "@marlowe.io/language-core-v1/guards";
import { MarloweVersion } from "@marlowe.io/language-core-v1/version";
import { ContractIdGuard } from "@marlowe.io/runtime-core";

import { TxStatus } from "./transaction/status.js";

import { RoleName } from "./role.js";
import {
  TxOutRef,
  BlockHeaderGuard,
  Metadata,
  TextEnvelopeGuard,
  PolicyId,
} from "@marlowe.io/runtime-core";

// QUESTION: Where do we have global documentation about how Roles and payouts work?
/**
 * Identifies a payout that can be withdrawn from a contract.
 * @see The {@link Payout:var | dynamic validator} for this type.
 * @interface
 */
export type Payout = t.TypeOf<typeof Payout>;

/**
 * This is a {@link !io-ts-usage | Dynamic type validator} for a {@link Payout:type}.
 * @category Validator
 */
export const Payout = t.type({
  /**
   * A reference to the payout script that contains the assets to be withdrawn.
   */
  payoutId: TxOutRef,
  /**
   * The {@link RoleName} of the participant that has the unclaimed Payout.
   */
  role: RoleName,
});

/**
 * Represents the response of the {@link index.RestAPI#getContractById | Get contract by id } endpoint
 * @see The {@link ContractDetails:var | dynamic validator} for this type.
 * @interface
 */
export interface ContractDetails extends t.TypeOf<typeof ContractDetails> {}

/**
 * This is a {@link !io-ts-usage | Dynamic type validator} for the {@link ContractDetails:type}.
 * @category Validator
 */
export const ContractDetails = t.type({
  contractId: ContractIdGuard,
  roleTokenMintingPolicyId: PolicyId,
  version: MarloweVersion,
  status: TxStatus,
  block: optionFromNullable(BlockHeaderGuard),
  metadata: Metadata,
  initialContract: G.Contract,
  currentContract: optionFromNullable(G.Contract), // 3 actions
  state: optionFromNullable(G.MarloweState),
  txBody: optionFromNullable(TextEnvelopeGuard),
  utxo: optionFromNullable(TxOutRef),
  unclaimedPayouts: t.array(Payout),
});
