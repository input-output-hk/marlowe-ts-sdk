import { optionFromNullable } from "io-ts-types";
import * as t from "io-ts/lib/index.js";
import { Contract, MarloweState } from "@marlowe.io/language-core-v1";
import * as G from "@marlowe.io/language-core-v1/guards";
import { MarloweVersion } from "@marlowe.io/language-core-v1/version";
import {
  AssetsMap,
  AssetsMapGuard,
  BlockHeader,
  ContractId,
  ContractIdGuard,
  PolicyIdGuard,
  Tags,
  TagsGuard,
  TextEnvelope,
} from "@marlowe.io/runtime-core";

import {
  TxOutRef,
  BlockHeaderGuard,
  Metadata,
  TextEnvelopeGuard,
  PolicyId,
} from "@marlowe.io/runtime-core";
import { assertGuardEqual, proxy } from "@marlowe.io/adapter/io-ts";
import { TxStatus } from "./transaction/status.js";

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
   * The {@link @marlowe.io/language-core-v1!index.RoleName | Role Name} of the participant that has the unclaimed Payout.
   */
  role: G.RoleName,
});

/**
 * Represents the response of the {@link index.RestClient#getContractById | Get Contract By Id } endpoint
 * @see The {@link ContractDetails:var | dynamic validator} for this type.
 * @interface
 * @category Endpoint : Get Contract By Id
 */
export type ContractDetails = {
  version: MarloweVersion;
  contractId: ContractId;
  initialContract: Contract;
  roleTokenMintingPolicyId: PolicyId;
  status: TxStatus;
  tags: Tags;
  metadata: Metadata;
  unclaimedPayouts: Payout[];
} /** Only available when the contract is Unsigned/Submitted and Active */ & {
  currentContract?: Contract;
  state?: MarloweState;
} /** Only available when Active */ & {
  utxo?: TxOutRef;
} /** Only available when the contract is confirmed */ & {
  block?: BlockHeader;
} /** Only available When the contract is Unsigned/Submitted */ & {
  txBody?: TextEnvelope;
};

/**
 * This is a {@link !io-ts-usage | Dynamic type validator} for the {@link ContractDetails:type}.
 * @category Validator
 * @category Endpoint : Get Contract By Id
 */
export const ContractDetailsGuard = assertGuardEqual(
  proxy<ContractDetails>(),
  t.intersection([
    t.type({
      version: MarloweVersion,
      contractId: ContractIdGuard,
      initialContract: G.Contract,
      roleTokenMintingPolicyId: PolicyIdGuard,
      status: TxStatus,
      tags: TagsGuard,
      metadata: Metadata,
      unclaimedPayouts: t.array(Payout),
    }),
    t.partial({ currentContract: G.Contract, state: G.MarloweState }),
    t.partial({ utxo: TxOutRef }),
    t.partial({ block: BlockHeaderGuard }),
    t.partial({ txBody: TextEnvelopeGuard }),
  ])
);
