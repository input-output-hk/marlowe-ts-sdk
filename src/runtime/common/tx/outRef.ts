import * as t from "io-ts";

export type TxOutRef = t.TypeOf<typeof TxOutRef>
export const TxOutRef = t.string // to refine