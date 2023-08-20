import { optionFromNullable } from "io-ts-types";
import * as t from "io-ts/lib/index.js";
import { Contract } from "@marlowe.io/language-core-v1";
import { MarloweState } from "@marlowe.io/language-core-v1/state";
import { ContractId } from "./id.js";
import { TextEnvelope } from "../../common/textEnvelope.js";
import { BlockHeader } from "../../common/block.js";
import { MarloweVersion } from "../../common/version.js";
import { PolicyId } from "../../common/policyId.js";
import { Metadata } from "../../common/metadata/index.js";
import { TxStatus } from "./transaction/status.js";
import { TxOutRef } from "../../common/tx/outRef.js";
import { RoleName } from "./role.js";


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



