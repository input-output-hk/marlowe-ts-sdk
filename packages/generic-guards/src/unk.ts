import * as t from "io-ts/lib/index.js";

export const unk = <T extends t.Mixed = t.UnknownType>(g?: T): T =>
  g ?? (t.unknown as any as T);

