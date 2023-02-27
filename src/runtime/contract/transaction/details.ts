import { optionFromNullable } from "io-ts-types";
import { BlockHeader } from "../../common/block";
import { Metadata } from "../../common/metadata";
import { ContractId } from "../id";
import { TransactionId } from "./id";
import { TxOutRef } from "../../common/tx/outRef";
import { TxStatus } from "./status";
import * as t from "io-ts";
import { BuiltinByteString, Input } from "../../../language/core/v1/semantics/contract/when/input";
import { Tags } from "../../common/metadata/tag";
import { Contract } from "../../../language/core/v1/semantics/contract";
import { MarloweState } from "../../common/state";
import { TxId } from "../../common/tx/id";
import { ISO8601 } from "../../common/iso8601";
import { TextEnvelope } from "../../common/textEnvelope";

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


