import * as t from "io-ts/lib/index.js";
import { iso, Newtype } from "newtype-ts";
import { fromNewtype } from "io-ts-types";
import { split } from "fp-ts/lib/string.js";
import { pipe } from "fp-ts/lib/function.js";
import { head } from "fp-ts/lib/ReadonlyNonEmptyArray.js";
import { TxId } from "../tx/id.js";


export type PayoutId = Newtype<{ readonly ContractId: unique symbol }, string>
export const PayoutId = fromNewtype<PayoutId>(t.string)
export const unPayoutId =  iso<PayoutId>().unwrap
export const payoutId =  iso<PayoutId>().wrap

export type PayoutIds = t.TypeOf<typeof PayoutIds>
export const PayoutIds = t.type({ payouts: t.array(PayoutId)})

export const payoutIdToTxId : (payoutId : PayoutId) => TxId
    = (payoutId) =>
        pipe( payoutId
            , unPayoutId
            , split('#')
            , head)