import { optionFromNullable } from "io-ts-types";
import * as t from "io-ts/lib/index.js";
import { Contract } from "@marlowe.io/language-core-v1";
import { MarloweState } from "@marlowe.io/language-core-v1/state";
import { MarloweVersion } from "@marlowe.io/language-core-v1/version";
import { ContractId } from "@marlowe.io/core";

import { TxStatus } from "./transaction/status.js";

import { RoleName } from "./role.js";
import { TxOutRef, BlockHeader, Metadata, TextEnvelope,PolicyId } from "@marlowe.io/core";


export type Payout = t.TypeOf<typeof Payout>
export const Payout
  = t.type(
      { payoutId: TxOutRef
      , role: RoleName
    })

export type ContractDetails = t.TypeOf<typeof ContractDetails>
export const ContractDetails
  = t.type(
      { contractId: ContractId
      , roleTokenMintingPolicyId: PolicyId
      , version: MarloweVersion
      , status: TxStatus
      , block: optionFromNullable(BlockHeader)
      , metadata: Metadata
      , initialContract: Contract
      , currentContract: optionFromNullable(Contract) // 3 actions
      , state:  optionFromNullable(MarloweState)
      , txBody: optionFromNullable(TextEnvelope)
      , utxo:   optionFromNullable(TxOutRef)
      , unclaimedPayouts: t.array(Payout)
    })



