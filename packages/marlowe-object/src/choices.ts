import * as t from "io-ts/lib/index.js";
import { ChoiceName, Bound, ChosenNum } from "@marlowe.io/language-core-v1";
import * as G from "@marlowe.io/language-core-v1/guards";
import { Party, PartyGuard } from "./participants.js";

export { ChoiceName, Bound, ChosenNum };

/**
 * Marlowe Object version of {@link @marlowe.io/language-core-v1!index.ChoiceId | Core ChoiceId}.
 * @category Choice
 */
export interface ChoiceId {
  choice_name: ChoiceName;
  choice_owner: Party;
}

/**
 * {@link !io-ts-usage | Dynamic type guard} for the {@link ChoiceId | choice id type}.
 * @category Choice
 */
export const ChoiceIdGuard: t.Type<ChoiceId> = t.type({
  choice_name: G.ChoiceName,
  choice_owner: PartyGuard,
});
