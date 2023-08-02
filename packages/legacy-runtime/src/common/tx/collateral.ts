import { pipe } from "fp-ts/lib/function";
import { C, fromHex } from "lucid-cardano";
import { TxOutRef, txOutRef } from "./outRef";

export const deserializeCollateral : (hex:string) =>  TxOutRef = 
               (hex) => pipe(C.TransactionUnspentOutput.from_bytes(Buffer.from(hex, 'hex'))
                            , utxo => txOutRef (utxo.input().transaction_id().to_hex() + '#' + utxo.input().index().to_str()) 
                            ) 

