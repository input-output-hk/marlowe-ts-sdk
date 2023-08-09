import * as t from "io-ts";

export type TxId = t.TypeOf<typeof TxId>
export const TxId = t.string // to refine