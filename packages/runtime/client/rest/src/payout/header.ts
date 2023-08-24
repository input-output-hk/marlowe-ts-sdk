
import * as t from "io-ts/lib/index.js";

import { ContractId, AssetId, PayoutId } from "@marlowe.io/runtime-core";
import { PayoutStatus } from "./status.js";
import { WithdrawalId } from "../contract/withdrawal/id.js";
import { optionFromNullable } from "io-ts-types";

export type PayoutHeader = t.TypeOf<typeof PayoutHeader>
export const PayoutHeader
    = t.type(
        { contractId: ContractId
        , payoutId: PayoutId
        , withdrawalId : optionFromNullable(WithdrawalId)
        , role: AssetId
        , status : PayoutStatus
      })