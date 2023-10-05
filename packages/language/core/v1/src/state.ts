import * as t from "io-ts/lib/index.js";
import { AccountIdGuard } from "./payee.js";

import { ValueId, ValueIdGuard } from "./value-and-observation.js";
import { TokenGuard } from "./token.js";
import { ChoiceId, ChoiceIdGuard } from "./choices.js";

export type Account = t.TypeOf<typeof Account>;
export const Account = t.tuple([
  t.tuple([AccountIdGuard, TokenGuard]),
  t.bigint,
]);

/**
 * TODO: Comment
 * @category State
 */
export type Accounts = t.TypeOf<typeof AccountsGuard>;
// DISCUSSION: Instead of having a custom guard for this we could have
//             an associative Map guard.
/**
 * TODO: Comment
 * @category State
 */
export const AccountsGuard = t.array(Account);

// DISCUSSION: Should we have the serialization representation here (associative map)
//             or to have a real JS Map? All the other types are in serialization representation.
/**
 * TODO: Comment
 * @see Section 2.1.8 and appendix E.14 of the {@link https://github.com/input-output-hk/marlowe/releases/download/v3/Marlowe.pdf | Marlowe spec}
 * @category State
 */
export interface MarloweState {
  accounts: Accounts;
  /**
   * TODO: Comment
   * Serialized as associative map
   */
  boundValues: Array<[ValueId, bigint]>;
  /**
   * TODO: Comment
   * Serialized as associative map
   */
  choices: Array<[ChoiceId, bigint]>;
  minTime: bigint;
}
/**
 * TODO: Comment
 * @see Section 2.1.8 and appendix E.14 of the {@link https://github.com/input-output-hk/marlowe/releases/download/v3/Marlowe.pdf | Marlowe spec}
 * @category State
 */
export const MarloweStateGuard: t.Type<MarloweState> = t.type({
  accounts: AccountsGuard,
  boundValues: t.array(t.tuple([ValueIdGuard, t.bigint])),
  choices: t.array(t.tuple([ChoiceIdGuard, t.bigint])),
  minTime: t.bigint,
});
