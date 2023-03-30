import * as t from "io-ts";
import { AccountId } from "../../common/payee/account";
import { Party } from "../../common/payee/party";
import { Token } from "../../common/token";
import { Value } from "../../common/value";

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