import * as t from "io-ts/lib/index.js";

// TODO: Try to make newtype as this gets replaced to string
//       in the docs.
export type TxId = t.TypeOf<typeof TxId>;
export const TxId = t.string; // to refine
