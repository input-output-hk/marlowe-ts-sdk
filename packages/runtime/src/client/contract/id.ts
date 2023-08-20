import * as t from "io-ts/lib/index.js";
import { iso, Newtype } from "newtype-ts";
import { fromNewtype } from "io-ts-types";
import { split } from "fp-ts/lib/string.js";
import { pipe } from "fp-ts/lib/function.js";
import { head } from "fp-ts/lib/ReadonlyNonEmptyArray.js";
import { TxId } from "../../common/tx/id.js";

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