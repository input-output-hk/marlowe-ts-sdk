
import { ContractId } from "./id";
import { TextEnvelope } from "../../runtime/common/textEnvelope";
import { optionFromNullable } from "io-ts-types";
import * as t from "io-ts";
import { BlockHeader } from "../../runtime/common/block";
import { MarloweVersion } from "../../runtime/common/version";
import { PolicyId } from "../../runtime/common/policyId";
import { Metadata } from "../../runtime/common/metadata";
import { TxStatus } from "./transaction/status";
import { TxOutRef } from "../../runtime/common/tx/outRef";
import { Contract } from "../../language/core/v1/semantics/contract";
import { MarloweState } from "../../language/core/v1/semantics/state";
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
  


