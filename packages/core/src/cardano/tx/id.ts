import * as t from "io-ts/lib/index.js";

export type TxId = t.TypeOf<typeof TxId>
export const TxId = t.string // to refine