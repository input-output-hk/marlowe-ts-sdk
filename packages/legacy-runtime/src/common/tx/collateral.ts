import { pipe } from "fp-ts/lib/function.js";
import * as CSL from '@emurgo/cardano-serialization-lib-browser'
import { TxOutRef, txOutRef } from "./outRef.js";
import { hex } from '@47ng/codec'

export const deserializeCollateral : (collateral:string) =>  TxOutRef 
    = (collateral) => 
        pipe( CSL.TransactionUnspentOutput.from_bytes(hex.decode(collateral))
            , utxo => txOutRef (utxo.input().transaction_id().to_hex() + '#' + utxo.input().index().toString()))

