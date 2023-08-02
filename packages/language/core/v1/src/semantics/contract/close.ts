import * as t from "io-ts";

export const close = 'close'            
export type Close = t.TypeOf<typeof Close>
export const Close = t.literal('close')