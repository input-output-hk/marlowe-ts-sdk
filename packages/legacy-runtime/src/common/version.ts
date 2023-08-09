
import * as t from "io-ts";

export type MarloweVersion = t.TypeOf<typeof MarloweVersion>;
export const MarloweVersion = t.literal('v1')