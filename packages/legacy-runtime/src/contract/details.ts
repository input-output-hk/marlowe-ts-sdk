
import { ContractId } from "./id";
import { TextEnvelope } from "../common/textEnvelope";
import { optionFromNullable } from "io-ts-types";
import * as t from "io-ts";
import { BlockHeader } from "../common/block";
import { MarloweVersion } from "../common/version";
import { PolicyId } from "../common/policyId";
import { Metadata } from "../common/metadata";
import { TxStatus } from "./transaction/status";
import { TxOutRef } from "../common/tx/outRef";
import { Contract } from "@marlowe/language-core-v1/semantics/contract";
import { MarloweState } from "@marlowe/language-core-v1/semantics/state";
import { RoleName } from "./role";


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



