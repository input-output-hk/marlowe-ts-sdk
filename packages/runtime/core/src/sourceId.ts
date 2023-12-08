import * as t from "io-ts/lib/index.js";

export type SourceId = string;
export const SourceIdGuard = t.string;
