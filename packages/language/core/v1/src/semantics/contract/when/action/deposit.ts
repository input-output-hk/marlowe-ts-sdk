import * as t from "io-ts/lib/index.js";
import { AccountId } from "../../common/payee/account.js";
import { Party } from "../../common/payee/party.js";
import { Token } from "../../common/token.js";
import { Value } from "../../common/value.js";

export type Deposit =
  | { party: Party
    , deposits: Value
    , of_token: Token
    , into_account: AccountId }

export const Deposit : t.Type<Deposit>
    = t.recursion('Deposit', () =>
        t.type ({ party: Party
                , deposits: Value
                , of_token: Token
                , into_account: AccountId }))