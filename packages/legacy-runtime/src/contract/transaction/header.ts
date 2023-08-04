import { optionFromNullable } from "io-ts-types";
import { BlockHeader } from "../../common/block.js";
import { Metadata } from "../../common/metadata/index.js";
import { ContractId } from "../id.js";
import { TransactionId } from "./id.js";
import { TxOutRef } from "../../common/tx/outRef.js";
import { TxStatus } from "./status.js";
import * as t from "io-ts";
import { BuiltinByteString } from "@marlowe/language-core-v1/semantics/contract/when/input/index.js";
import { Tags } from "../../common/metadata/tag.js";

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

