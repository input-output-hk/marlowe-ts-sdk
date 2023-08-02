import { optionFromNullable } from "io-ts-types";
import { BlockHeader } from "../../common/block";
import { Metadata } from "../../common/metadata";
import { ContractId } from "../id";
import { TransactionId } from "./id";
import { TxOutRef } from "../../common/tx/outRef";
import { TxStatus } from "./status";
import * as t from "io-ts";
import { BuiltinByteString } from "@marlowe/language-core-v1/semantics/contract/when/input";
import { Tags } from "../../common/metadata/tag";

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

