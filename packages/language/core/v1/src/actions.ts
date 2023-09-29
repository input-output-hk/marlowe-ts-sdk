import * as t from "io-ts/lib/index.js";

import { Observation } from "./value-and-observation.js";
import { ChoiceId } from "./value-and-observation.js";
import { Party } from "./participants.js";
import { AccountId } from "./payee.js";
import { Token } from "./token.js";
import { Value } from "./value-and-observation.js";

export type Bound = { from: bigint; to: bigint };

export const Bound: t.Type<Bound> = t.recursion("Bound", () =>
  t.type({ from: t.bigint, to: t.bigint })
);

export type Choice = { choose_between: Bound[]; for_choice: ChoiceId };

export const Choice: t.Type<Choice> = t.recursion("Choice", () =>
  t.type({ choose_between: t.array(Bound), for_choice: ChoiceId })
);

export type Deposit = {
  party: Party;
  deposits: Value;
  of_token: Token;
  into_account: AccountId;
};

export const Deposit: t.Type<Deposit> = t.type({
  party: Party,
  deposits: Value,
  of_token: Token,
  into_account: AccountId,
});

export type Notify = { notify_if: Observation };

export const Notify: t.Type<Notify> = t.recursion("Notify", () =>
  t.type({ notify_if: Observation })
);

export type Action = Deposit | Choice | Notify;

export const Action: t.Type<Action> = t.recursion("Action", () =>
  t.union([Deposit, Choice, Notify])
);
