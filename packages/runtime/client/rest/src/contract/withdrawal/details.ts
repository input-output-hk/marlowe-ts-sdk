
import * as t from "io-ts/lib/index.js";


import { WithdrawalId } from "./id.js";
import { TxStatus } from "../transaction/status.js";

import { optionFromNullable } from "io-ts-types/lib/optionFromNullable.js";
import { BlockHeader } from "@marlowe.io/runtime-core";
import { PayoutHeader } from "../../payout/header.js";


export type WithdrawalDetails = t.TypeOf<typeof WithdrawalDetails>
export const WithdrawalDetails
  = t.type(
      { withdrawalId: WithdrawalId
      , status: TxStatus
      , block: optionFromNullable(BlockHeader)
      , payouts : t.array(PayoutHeader)
    })

