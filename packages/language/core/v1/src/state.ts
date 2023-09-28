import * as t from "io-ts/lib/index.js";
import { AccountId } from "./payee.js";

import { ChoiceId, ValueId } from "./value-and-observation.js";
import { Token } from "./token.js";

export type Account = t.TypeOf<typeof Account>;
export const Account = t.tuple([t.tuple([AccountId, Token]), t.bigint]);

export type Accounts = t.TypeOf<typeof Accounts>;
export const Accounts = t.array(Account);

export type MarloweState = t.TypeOf<typeof MarloweState>;

export const MarloweState = t.type({
  accounts: Accounts,
  boundValues: t.array(t.tuple([ValueId, t.bigint])),
  choices: t.array(t.tuple([ChoiceId, t.bigint])),
  minTime: t.bigint,
});
