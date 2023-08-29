
import * as t from "io-ts/lib/index.js";
import { optionFromNullable } from "io-ts-types";

import { ContractId, AssetId, PayoutId, AddressBech32,  WithdrawalId, AssetQuantity } from "@marlowe.io/runtime-core";

import { PayoutStatus } from "./status.js";

export type Tokens = t.TypeOf<typeof Tokens>
export const Tokens = t.record(t.string, t.record(t.string, t.bigint))

export type Assets = t.TypeOf<typeof Assets>
export const Assets
    = t.type(
        { lovelace: AssetQuantity
        , tokens: Tokens 
      })

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


