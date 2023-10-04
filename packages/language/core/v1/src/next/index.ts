import * as t from "io-ts/lib/index.js";
import { ApplicableInputs } from "./applicables/index.js";
import { isNone, none } from "fp-ts/lib/Option.js";
export * as Deposit from "./applicables/canDeposit.js";
export * as Choice from "./applicables/canChoose.js";
export * as Notify from "./applicables/canNotify.js";

export type Next = t.TypeOf<typeof Next>;
export const Next = t.type({
  can_reduce: t.boolean,
  applicable_inputs: ApplicableInputs,
});

export const emptyApplicables = (next: Next) => {
  return (
    next.applicable_inputs.choices.length === 0 &&
    next.applicable_inputs.deposits.length === 0 &&
    isNone(next.applicable_inputs.notify)
  );
};

export const noNext: Next = {
  can_reduce: false,
  applicable_inputs: {
    deposits: [],
    choices: [],
    notify: none,
  },
};
