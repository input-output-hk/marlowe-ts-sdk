
import * as t from "io-ts";
import { iso, Newtype } from "newtype-ts";
import { fromNewtype } from "io-ts-types";
import { TxId } from "../../../runtime/common/tx/id";
import { pipe } from "fp-ts/lib/function";

export type TransactionId = Newtype<{ readonly TransactionId: unique symbol }, string> 
export const TransactionId = fromNewtype<TransactionId>(t.string)
export const unTransactionId =  iso<TransactionId>().unwrap
export const transactionId =  iso<TransactionId>().wrap

export const idToTxId : (transactionId : TransactionId) => TxId 
    = (transactionId) => 
        pipe( transactionId
            , unTransactionId
            )