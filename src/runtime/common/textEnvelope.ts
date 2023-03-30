import reporter from 'io-ts-reporters'
import { Newtype } from "newtype-ts";
import { fromNewtype,option, optionFromNullable } from "io-ts-types";
import * as t from "io-ts";

// see : https://input-output-hk.github.io/cardano-node/cardano-api/lib/Cardano-Api-SerialiseTextEnvelope.html

export type TextEnvelope = t.TypeOf<typeof TextEnvelope>
export const TextEnvelope = t.type({ type:t.string, description:t.string, cborHex:t.string})

export type MarloweTxCBORHex = string;
export type HexTransactionWitnessSet = string

export const transactionWitnessSetTextEnvelope : (hexTransactionWitnessSet: HexTransactionWitnessSet) => TextEnvelope
  = (hexTransactionWitnessSet) => ({type:"ShelleyTxWitness BabbageEra", description:"",cborHex:hexTransactionWitnessSet})