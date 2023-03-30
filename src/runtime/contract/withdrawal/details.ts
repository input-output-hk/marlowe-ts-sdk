
import * as t from "io-ts";
import { BlockHeader } from "../../common/block";

import { WithdrawalId } from "./id";
import { TxStatus } from "../transaction/status";
import { PolicyId } from "../../common/policyId";
import { TxOutRef } from "../../common/tx/outRef";
import { RoleName } from "../role";


export type PayoutRef = t.TypeOf<typeof PayoutRef>
export const PayoutRef = t.type(
    { contractId : TxOutRef
    , payout : TxOutRef
    , roleTokenMintingPolicyId : PolicyId
    , role : RoleName
    })

export type Details = t.TypeOf<typeof Details>
export const Details 
  = t.type(
      { withdrawalId: WithdrawalId
      , status: TxStatus
      , block: BlockHeader
      , payouts : t.array(PayoutRef) 
    })

