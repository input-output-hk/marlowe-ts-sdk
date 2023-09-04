import * as t from "io-ts/lib/index.js";

export type MarloweVersion = t.TypeOf<typeof MarloweVersion>;
export const MarloweVersion = t.literal("v1");
