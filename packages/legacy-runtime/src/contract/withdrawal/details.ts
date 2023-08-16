
import * as t from "io-ts/lib/index.js";
import { BlockHeader } from "../../common/block.js";

import { WithdrawalId } from "./id.js";
import { TxStatus } from "../transaction/status.js";
import { PolicyId } from "../../common/policyId.js";
import { TxOutRef } from "../../common/tx/outRef.js";
import { RoleName } from "../role.js";
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable.js";


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
      , block: optionFromNullable(BlockHeader)
      , payouts : t.array(PayoutRef)
    })

