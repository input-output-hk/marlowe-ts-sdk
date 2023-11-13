import { Sort, strCmp } from "@marlowe.io/adapter/assoc-map";
import * as t from "io-ts/lib/index.js";
import { Party, partyCmp, PartyGuard } from "./participants.js";

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
 * Sorting function for ChoiceId as defined in the Marlowe Specification (SemanticsGuarantees.thy)
 * @hidden
 */
export function choiceIdCmp(a: ChoiceId, b: ChoiceId): Sort {
  const nameCmp = strCmp(a.choice_name, b.choice_name);
  if (nameCmp !== "EqualTo") {
    return nameCmp;
  }
  return partyCmp(a.choice_owner, b.choice_owner);
}

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

/**
 * Checks if a chosen number is between a given bound
 * @category Choice
 */
export function inBound(num: bigint, bound: Bound): boolean {
  return num >= bound.from && num <= bound.to;
}

/**
 * Checks if a chosen number is within any of the given bounds
 * @category Choice
 */
export function inBounds(num: bigint, bounds: Bound[]): boolean {
  return bounds.some((bound) => inBound(num, bound));
}
