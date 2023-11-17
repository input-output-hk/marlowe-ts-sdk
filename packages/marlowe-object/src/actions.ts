import * as t from "io-ts/lib/index.js";
import * as G from "@marlowe.io/language-core-v1/guards";

import {
  Observation,
  ObservationGuard,
  Value,
} from "./value-and-observation.js";
import { ChoiceId, ChoiceIdGuard } from "./choices.js";
import { Party, PartyGuard } from "./participants.js";
import { AccountId, AccountIdGuard } from "./payee.js";
import { Token, TokenGuard } from "./token.js";
import { ValueGuard } from "./value-and-observation.js";
import { Bound } from "./choices.js";
import { Reference, ReferenceGuard } from "./reference.js";
/**
 * Marlowe Object version of {@link @marlowe.io/language-core-v1!index.Choice | Core Choice}.
 * @category Action
 */
export interface Choice {
  choose_between: Bound[];
  for_choice: ChoiceId;
}

// TODO: Try to remove recursion
/**
 * {@link !io-ts-usage | Dynamic type guard} for the {@link Choice | choice type}.
 * @category Action
 */
export const ChoiceGuard: t.Type<Choice> = t.recursion("Choice", () =>
  t.type({ choose_between: t.array(G.Bound), for_choice: ChoiceIdGuard })
);

/**
 * Marlowe Object version of {@link @marlowe.io/language-core-v1!index.Deposit | Core Deposit}.
 * @category Action
 */
export interface Deposit {
  party: Party;
  deposits: Value;
  of_token: Token;
  into_account: AccountId;
}

/**
 * {@link !io-ts-usage | Dynamic type guard} for the {@link Deposit | deposit type}.
 * @category Action
 */
export const DepositGuard: t.Type<Deposit> = t.type({
  party: PartyGuard,
  deposits: ValueGuard,
  of_token: TokenGuard,
  into_account: AccountIdGuard,
});

/**
 * Marlowe Object version of {@link @marlowe.io/language-core-v1!index.Notify | Core Notify}.
 * @category Action
 */
export interface Notify {
  notify_if: Observation;
}

/**
 * {@link !io-ts-usage | Dynamic type guard} for the {@link Notify | notify type}.
 * @category Action
 */
export const NotifyGuard: t.Type<Notify> = t.recursion("Notify", () =>
  t.type({ notify_if: ObservationGuard })
);

/**
 * Marlowe Object version of {@link @marlowe.io/language-core-v1!index.Action | Core Action} with
 * the ability to reference other actions.
 * @category Action
 */
export type Action = Deposit | Choice | Notify | Reference;

/**
 * {@link !io-ts-usage | Dynamic type guard} for the {@link Action | action type}.
 * @category Action
 */
export const ActionGuard: t.Type<Action> = t.recursion("Action", () =>
  t.union([DepositGuard, ChoiceGuard, NotifyGuard, ReferenceGuard])
);
