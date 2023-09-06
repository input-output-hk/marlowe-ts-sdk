import * as t from "io-ts/lib/index.js";

export const inputNotify = "input_notify";
export type InputNotify = t.TypeOf<typeof InputNotify>;
export const InputNotify = t.literal("input_notify");
