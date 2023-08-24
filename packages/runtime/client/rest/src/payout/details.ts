
import * as t from "io-ts/lib/index.js";
import { optionFromNullable } from "io-ts-types";

import { ContractId, AssetId, PayoutId, AddressBech32, Assets } from "@marlowe.io/runtime-core";
import { WithdrawalId } from "../contract/withdrawal/id.js";
import { PayoutStatus } from "./status.js";

export type PayoutDetails = t.TypeOf<typeof PayoutDetails>
export const PayoutDetails
    = t.type(
      { payoutId: PayoutId
      , contractId: ContractId
      , withdrawalId : optionFromNullable(WithdrawalId) 
      , role: AssetId
      , payoutValidatorAddress: AddressBech32
      , status : PayoutStatus
      , assets : Assets
      })


