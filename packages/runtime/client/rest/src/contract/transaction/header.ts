import * as t from "io-ts/lib/index.js";
import { optionFromNullable } from "io-ts-types";

import { BuiltinByteString } from "@marlowe.io/language-core-v1";
import { Tags, Metadata, BlockHeader, TxOutRef } from "@marlowe.io/runtime-core";


import { ContractId } from "@marlowe.io/runtime-core";
import { TransactionId } from "./id.js";
import { TxStatus } from "./status.js";


export type Header = t.TypeOf<typeof Header>
export const Header
    = t.type(
        { contractId: ContractId
        , transactionId: TransactionId
        , continuations : optionFromNullable(BuiltinByteString)
        , tags : Tags
        , metadata : Metadata
        , status: TxStatus
        , block: optionFromNullable(BlockHeader)
        , utxo: optionFromNullable(TxOutRef)
      })

