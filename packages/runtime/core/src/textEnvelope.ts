import reporter from "jsonbigint-io-ts-reporters";
import { Newtype } from "newtype-ts";
import { fromNewtype, option, optionFromNullable } from "io-ts-types";
import * as t from "io-ts/lib/index.js";

/**
 * @see {@link https://input-output-hk.github.io/cardano-node/cardano-api/lib/Cardano-Api-SerialiseTextEnvelope.html}
 */
// DISCUSSION: The same structure serves for unsigned and signed transactions... Should we make them nominal
//             so that you cannot confuse them? Maybe a simple Singed or Unsigned is a good starting point but
//             might be insufficient for multiple signatures. To capture that we could have two type parameters
//             "missing signatures" and "current signatures" and by signing something we move it from missing to witness
//             at the type level.
//             We could also parametrize the type on the `type` property. I noticed that when we build the transaction
//             the runtime responds with `Tx BabbageEra` but when we submit it we need to use `ShelleyTxWitness BabbageEra`
export interface TextEnvelope extends t.TypeOf<typeof TextEnvelope> {}
export const TextEnvelope = t.type({
  type: t.string,
  description: t.string,
  cborHex: t.string,
});

export type MarloweTxCBORHex = string;
export type HexTransactionWitnessSet = string;

export const transactionWitnessSetTextEnvelope: (
  hexTransactionWitnessSet: HexTransactionWitnessSet
) => TextEnvelope = (hexTransactionWitnessSet) => ({
  type: "ShelleyTxWitness BabbageEra",
  description: "",
  cborHex: hexTransactionWitnessSet,
});
