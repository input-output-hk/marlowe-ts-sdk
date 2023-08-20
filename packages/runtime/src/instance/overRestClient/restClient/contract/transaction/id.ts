
import * as t from "io-ts/lib/index.js";
import { iso, Newtype } from "newtype-ts";
import { fromNewtype } from "io-ts-types";
import { TxId } from "../../../../../common/tx/id.js";
import { pipe } from "fp-ts/lib/function.js";

export type TransactionId = Newtype<{ readonly TransactionId: unique symbol }, string>
export const TransactionId = fromNewtype<TransactionId>(t.string)
export const unTransactionId =  iso<TransactionId>().unwrap
export const transactionId =  iso<TransactionId>().wrap

export const idToTxId : (transactionId : TransactionId) => TxId
    = (transactionId) =>
        pipe( transactionId
            , unTransactionId
            )