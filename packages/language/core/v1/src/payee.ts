import * as t from "io-ts/lib/index.js";
import { Party } from "./participants.js";

export type AccountId = t.TypeOf<typeof Party>;
export const AccountId = Party;

export type Payee = t.TypeOf<typeof Payee>;
export const Payee = t.union([
  t.type({ account: AccountId }),
  t.type({ party: Party }),
]);
