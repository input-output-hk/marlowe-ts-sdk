import { optionFromNullable } from "io-ts-types";
import * as t from "io-ts/lib/index.js";

import { ISO8601 } from "@marlowe.io/adapter/time";
import { BuiltinByteString, Input } from "@marlowe.io/language-core-v1";
import { MarloweState } from "@marlowe.io/language-core-v1/state";
import { Contract } from "@marlowe.io/language-core-v1";

import { BlockHeader } from "../../common/block.js";
import { Metadata } from "../../common/metadata/index.js";
import { ContractId } from "../id.js";
import { TransactionId } from "./id.js";
import { TxOutRef } from "../../common/tx/outRef.js";
import { TxStatus } from "./status.js";
import { Tags } from "../../common/metadata/tag.js";
import { TxId } from "../../common/tx/id.js";
import { TextEnvelope } from "../../common/textEnvelope.js";

export type Details = t.TypeOf<typeof Details>
export const Details
    = t.type(
        { contractId: ContractId
        , transactionId: TransactionId
        , continuations : optionFromNullable(BuiltinByteString)
        , tags : Tags
        , metadata : Metadata
        , status: TxStatus
        , block: optionFromNullable(BlockHeader)
        , inputUtxo : TxOutRef
        , inputs : t.array(Input)
        , outputUtxo :optionFromNullable(TxOutRef)
        , outputContract : optionFromNullable(Contract)
        , outputState : optionFromNullable(MarloweState)
        , consumingTx : optionFromNullable(TxId)
        , invalidBefore : ISO8601
        , invalidHereafter : ISO8601
        , txBody : optionFromNullable(TextEnvelope)
      })


