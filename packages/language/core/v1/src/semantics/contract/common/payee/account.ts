import * as t from "io-ts";
import { Party } from "./party.js";
import { Token } from "../token.js";

export type AccountId =  t.TypeOf<typeof Party>
export const AccountId = Party

export type Account = t.TypeOf<typeof Account>
export const Account = t.tuple([t.tuple([AccountId,Token]),t.bigint])

export type Accounts = t.TypeOf<typeof Accounts>
export const Accounts = t.array(Account)