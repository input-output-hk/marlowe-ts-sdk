import * as t from "io-ts/lib/index.js";
import { Party, PartyGuard } from "./participants.js";

/**
 * TODO: Comment
 * @category Choice
 */
export type ChoiceName = string;

/**
 * TODO: Comment
 * @category Choice
 */
export const ChoiceNameGuard: t.Type<ChoiceName> = t.string;

/**
 * TODO: Comment
 * @category Choice
 */
export interface ChoiceId {
  choice_name: ChoiceName;
  choice_owner: Party;
}

/**
 * TODO: Comment
 * @category Choice
 */
export const ChoiceIdGuard: t.Type<ChoiceId> = t.type({
  choice_name: ChoiceNameGuard,
  choice_owner: PartyGuard,
});

/**
 * TODO: Comment
 * @category Choice
 */
export interface Bound {
  from: bigint;
  to: bigint;
}

// TODO: Try to remove recursion
/**
 * TODO: Comment
 * @category Choice
 */
export const BoundGuard: t.Type<Bound> = t.recursion("Bound", () =>
  t.type({ from: t.bigint, to: t.bigint })
);

/**
 * TODO: Comment
 * @category Choice
 */
export type ChosenNum = bigint;

/**
 * TODO: Comment
 * @category Choice
 */
export const ChosenNumGuard: t.Type<ChosenNum> = t.bigint;
