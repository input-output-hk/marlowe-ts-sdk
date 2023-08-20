import * as t from "io-ts/lib/index.js";
import { iso, Newtype } from "newtype-ts";
import { fromNewtype } from "io-ts-types";
import { pipe } from "fp-ts/lib/function.js";
import { TxId } from "../../../../../common/tx/id.js";

export type WithdrawalId = Newtype<{ readonly WithdrawalId: unique symbol }, string>
export const WithdrawalId = fromNewtype<WithdrawalId>(t.string)
export const unWithdrawalId =  iso<WithdrawalId>().unwrap
export const withdrawalId=  iso<WithdrawalId>().wrap


export const idToTxId : (withdrawalId : WithdrawalId) => TxId
    = (withdrawalId) =>
        pipe( withdrawalId
            , unWithdrawalId)