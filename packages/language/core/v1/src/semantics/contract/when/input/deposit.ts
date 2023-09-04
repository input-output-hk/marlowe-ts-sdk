import * as t from "io-ts/lib/index.js";
import { AccountId } from "../../common/payee/account.js";
import { Party } from "../../common/payee/party.js";
import { Token } from "../../common/token.js";

export type InputDeposit = t.TypeOf<typeof InputDeposit>;
export const InputDeposit = t.type({
  input_from_party: Party,
  that_deposits: t.bigint,
  of_token: Token,
  into_account: AccountId,
});
