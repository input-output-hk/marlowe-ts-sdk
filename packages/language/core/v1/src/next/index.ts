import * as t from "io-ts/lib/index.js";
import { ApplicableInputs } from "./applicables/index.js";
import { isNone, none } from "fp-ts/lib/Option.js";
export * as Deposit from "./applicables/canDeposit.js";
export * as Choice from "./applicables/canChoose.js";
export * as Notify from "./applicables/canNotify.js";

/**
 * Provides reducibility and input applicability information for a contract
 */
export { ApplicableInputs };
export type Next = t.TypeOf<typeof Next>;
export const Next = t.type({
  can_reduce: t.boolean,
  applicable_inputs: ApplicableInputs,
});

/**
 * empty Applicables indicates if the contract is in a state where no inputs can be applied.
 */
export const emptyApplicables = (next: Next) => {
  return (
    next.applicable_inputs.choices.length === 0 &&
    next.applicable_inputs.deposits.length === 0 &&
    isNone(next.applicable_inputs.notify)
  );
};

/**
 * noNext is a state where no apply or reduce on a contract
 */
export const noNext: Next = {
  can_reduce: false,
  applicable_inputs: {
    deposits: [],
    choices: [],
    notify: none,
  },
};
