/**
 * This module defines the mutually recursive types for Values and Observations as defined in the Marlowe Specification.
 * @see Section 2.1.5 of the {@link https://github.com/input-output-hk/marlowe/releases/download/v3/specification-v3.pdf | Marlowe Specification}
 * @packageDocumentation
 */
import * as t from "io-ts/lib/index.js";
import { ChoiceId, ChoiceIdGuard } from "./choices.js";
import { AccountId, AccountIdGuard } from "./payee.js";
import { Token, TokenGuard } from "./token.js";

/**
 * TODO: Comment
 * @category Value
 */
export interface AvailableMoney {
  amount_of_token: Token;
  in_account: AccountId;
}

/**
 * TODO: Comment
 * @category Value
 */
export const AvailableMoneyGuard: t.Type<AvailableMoney> = t.type({
  amount_of_token: TokenGuard,
  in_account: AccountIdGuard,
});

/**
 * Search [[lower-name-builders]]
 * @hidden
 */
export const constant = (constant: bigint) => constant;

/**
 * TODO: Comment
 * @category Value
 */
export type Constant = bigint;
/**
 * TODO: Comment
 * @category Value
 */
export const ConstantGuard: t.Type<Constant> = t.bigint;

/**
 * TODO: Comment
 * @category Value
 */
export type TimeIntervalStart = "time_interval_start";
/**
 * TODO: Comment
 * @category Value
 */
export const TimeIntervalStartGuard: t.Type<TimeIntervalStart> = t.literal(
  "time_interval_start"
);

/**
 * TODO: Comment
 * @category Value
 */
export type TimeIntervalEnd = "time_interval_end";
/**
 * TODO: Comment
 * @category Value
 */
export const TimeIntervalEndGuard = t.literal("time_interval_end");
/**
 * TODO: Comment
 * @category Value
 */
export interface NegValue {
  negate: Value;
}
/**
 * TODO: Comment
 * @category Value
 */
export const NegValueGuard: t.Type<NegValue> = t.recursion("NegValue", () =>
  t.type({ negate: ValueGuard })
);

/**
 * TODO: Comment
 * @category Value
 */
export interface AddValue {
  add: Value;
  and: Value;
}

/**
 * TODO: Comment
 * @category Value
 */
export const AddValueGuard: t.Type<AddValue> = t.recursion("AddValue", () =>
  t.type({ add: ValueGuard, and: ValueGuard })
);

/**
 * TODO: Comment
 * @category Value
 */
export interface SubValue {
  value: Value;
  minus: Value;
}

/**
 * TODO: Comment
 * @category Value
 */
export const SubValueGuard: t.Type<SubValue> = t.recursion("SubValue", () =>
  t.type({ value: ValueGuard, minus: ValueGuard })
);

/**
 * Search [[lower-name-builders]]
 * @hidden
 */
export const mulValue = (multiply: Value, times: Value) => ({
  multiply: multiply,
  times: times,
});

/**
 * TODO: Comment
 * @category Value
 */
export interface MulValue {
  multiply: Value;
  times: Value;
}

/**
 * TODO: Comment
 * @category Value
 */
export const MulValueGuard: t.Type<MulValue> = t.recursion("MulValue", () =>
  t.type({ multiply: ValueGuard, times: ValueGuard })
);

/**
 * TODO: Comment
 * @category Value
 */
export interface DivValue {
  divide: Value;
  by: Value;
}

/**
 * TODO: Comment
 * @category Value
 */
export const DivValueGuard: t.Type<DivValue> = t.recursion("DivValue", () =>
  t.type({ divide: ValueGuard, by: ValueGuard })
);

/**
 * TODO: Comment
 * @category Value
 */
export type ChoiceValue = { value_of_choice: ChoiceId };
/**
 * TODO: Comment
 * @category Value
 */
export const ChoiceValueGuard: t.Type<ChoiceValue> = t.recursion(
  "ChoiceValue",
  () => t.type({ value_of_choice: ChoiceIdGuard })
);

export type ValueId = string;
export const ValueIdGuard: t.Type<ValueId> = t.string;
/**
 * TODO: Comment
 * @category Value
 */
export interface UseValue {
  use_value: ValueId;
}
/**
 * TODO: Comment
 * @category Value
 */
export const UseValueGuard: t.Type<UseValue> = t.recursion("UseValue", () =>
  t.type({ use_value: ValueIdGuard })
);

/**
 * TODO: Comment
 * @category Value
 */
export interface Cond {
  if: Observation;
  then: Value;
  else: Value;
}

/**
 * TODO: Comment
 * @category Value
 */
export const CondGuard: t.Type<Cond> = t.recursion("Cond", () =>
  t.type({ if: ObservationGuard, then: ValueGuard, else: ValueGuard })
);

/**
 * TODO: Comment
 * @category Value
 */
export type Value =
  | AvailableMoney
  | Constant
  | NegValue
  | AddValue
  | SubValue
  | MulValue
  | DivValue
  | ChoiceValue
  | TimeIntervalStart
  | TimeIntervalEnd
  | UseValue
  | Cond;

/**
 * TODO: Comment
 * @category Value
 */
export const ValueGuard: t.Type<Value> = t.recursion("Value", () =>
  t.union([
    AvailableMoneyGuard,
    ConstantGuard,
    NegValueGuard,
    AddValueGuard,
    SubValueGuard,
    MulValueGuard,
    DivValueGuard,
    ChoiceValueGuard,
    TimeIntervalStartGuard,
    TimeIntervalEndGuard,
    UseValueGuard,
    CondGuard,
  ])
);

/**
 * TODO: Comment
 * @category Observation
 */
export interface AndObs {
  both: Observation;
  and: Observation;
}

/**
 * TODO: Comment
 * @category Observation
 */
export const AndObsGuard: t.Type<AndObs> = t.recursion("AndObs", () =>
  t.type({ both: ObservationGuard, and: ObservationGuard })
);

/**
 * TODO: Comment
 * @category Observation
 */
export interface OrObs {
  either: Observation;
  or: Observation;
}

/**
 * TODO: Comment
 * @category Observation
 */
export const OrObsGuard: t.Type<OrObs> = t.recursion("OrObs", () =>
  t.type({ either: ObservationGuard, or: ObservationGuard })
);

/**
 * TODO: Comment
 * @category Observation
 */
export interface NotObs {
  not: Observation;
}
/**
 * TODO: Comment
 * @category Observation
 */
export const NotObsGuard: t.Type<NotObs> = t.recursion("NotObs", () =>
  t.type({ not: ObservationGuard })
);

/**
 * TODO: Comment
 * @category Observation
 */
export interface ChoseSomething {
  chose_something_for: ChoiceId;
}
/**
 * TODO: Comment
 * @category Observation
 */
// TODO: try to remove recursion
export const ChoseSomethingGuard: t.Type<ChoseSomething> = t.recursion(
  "ChoseSomething",
  () => t.type({ chose_something_for: ChoiceIdGuard })
);

/**
 * TODO: Comment
 * @category Observation
 */
export interface ValueEQ {
  value: Value;
  equal_to: Value;
}
/**
 * TODO: Comment
 * @category Observation
 */
export const ValueEQGuard: t.Type<ValueEQ> = t.recursion("ValueEQ", () =>
  t.type({ value: ValueGuard, equal_to: ValueGuard })
);

/**
 * TODO: Comment
 * @category Observation
 */
export interface ValueGT {
  value: Value;
  gt: Value;
}

/**
 * TODO: Comment
 * @category Observation
 */
export const ValueGTGuard: t.Type<ValueGT> = t.recursion("ValueGT", () =>
  t.type({ value: ValueGuard, gt: ValueGuard })
);

/**
 * TODO: Comment
 * @category Observation
 */
export interface ValueGE {
  value: Value;
  ge_than: Value;
}

/**
 * TODO: Comment
 * @category Observation
 */
export const ValueGEGuard: t.Type<ValueGE> = t.recursion("ValueGE", () =>
  t.type({ value: ValueGuard, ge_than: ValueGuard })
);

/**
 * TODO: Comment
 * @category Observation
 */
export interface ValueLT {
  value: Value;
  lt: Value;
}

/**
 * TODO: Comment
 * @category Observation
 */
export const ValueLTGuard: t.Type<ValueLT> = t.recursion("ValueLT", () =>
  t.type({ value: ValueGuard, lt: ValueGuard })
);

/**
 * TODO: Comment
 * @category Observation
 */
export interface ValueLE {
  value: Value;
  le_than: Value;
}

/**
 * TODO: Comment
 * @category Observation
 */
export const ValueLEGuard: t.Type<ValueLE> = t.recursion("ValueLE", () =>
  t.type({ value: ValueGuard, le_than: ValueGuard })
);

/**
 * TODO: Comment
 * @category Observation
 */
export type Observation =
  | AndObs
  | OrObs
  | NotObs
  | ChoseSomething
  | ValueEQ
  | ValueGT
  | ValueGE
  | ValueLT
  | ValueLE
  | boolean;

/**
 * TODO: Comment
 * @category Observation
 */
export const ObservationGuard: t.Type<Observation> = t.recursion(
  "Observation",
  () =>
    t.union([
      AndObsGuard,
      OrObsGuard,
      NotObsGuard,
      ChoseSomethingGuard,
      ValueEQGuard,
      ValueGTGuard,
      ValueGEGuard,
      ValueLTGuard,
      ValueLEGuard,
      t.boolean,
    ])
);
