import * as t from "io-ts";
import { iso, Newtype } from "newtype-ts";
import { fromNewtype } from "io-ts-types";
import { split } from "fp-ts/lib/string";
import { pipe } from "fp-ts/lib/function";
import { head } from "fp-ts/lib/ReadonlyNonEmptyArray";
import { TxId } from "@runtime/common/tx/id";

export type ContractId = Newtype<{ readonly ContractId: unique symbol }, string> 
export const ContractId = fromNewtype<ContractId>(t.string)
export const unContractId =  iso<ContractId>().unwrap
export const contractId =  iso<ContractId>().wrap


export const idToTxId : (contractId : ContractId) => TxId 
    = (contractId) => 
        pipe( contractId
            , unContractId
            , split('#')
            , head)