import * as t from "io-ts";

export type TxStatus = t.TypeOf<typeof TxStatus>
export const TxStatus = t.union([ t.literal('unsigned'),t.literal('submitted'),t.literal('confirmed') ])
