
import * as t from "io-ts/lib/index.js";

export type Available  = t.TypeOf<typeof Available>
export const Available = t.literal('available')

export type Withdrawn  = t.TypeOf<typeof Available>
export const Withdrawn = t.literal('withdrawn')

export type PayoutStatus = t.TypeOf<typeof PayoutStatus>
export const PayoutStatus = t.union ([Available,Withdrawn])



