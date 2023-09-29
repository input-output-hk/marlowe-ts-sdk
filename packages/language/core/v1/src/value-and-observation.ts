/**
 * This module defines the mutually recursive types for Values and Observations as defined in the Marlowe Specification.
 * @see Section 2.1.5 of the {@link https://github.com/input-output-hk/marlowe/releases/download/v3/specification-v3.pdf | Marlowe Specification}
 * @packageDocumentation
 */
import * as t from "io-ts/lib/index.js";
import { Party } from "./participants.js";

export const constant = (constant: bigint) => constant;
export type Constant = t.TypeOf<typeof Constant>;
export const Constant = t.bigint;

export type TimeIntervalStart = t.TypeOf<typeof TimeIntervalStart>;
export const TimeIntervalStart = t.literal("time_interval_start");

export type TimeIntervalEnd = t.TypeOf<typeof TimeIntervalEnd>;
export const TimeIntervalEnd = t.literal("time_interval_end");

export type NegValue = { negate: Value };
export const NegValue: t.Type<NegValue> = t.recursion("NegValue", () =>
  t.type({ negate: Value })
);

export type AddValue = { add: Value; and: Value };

export const AddValue: t.Type<AddValue> = t.recursion("AddValue", () =>
  t.type({ add: Value, and: Value })
);

export type SubValue = { value: Value; minus: Value };

export const SubValue: t.Type<SubValue> = t.recursion("SubValue", () =>
  t.type({ value: Value, minus: Value })
);

export const mulValue = (multiply: Value, times: Value) => ({
  multiply: multiply,
  times: times,
});
export type MulValue = { multiply: Value; times: Value };

export const MulValue: t.Type<MulValue> = t.recursion("MulValue", () =>
  t.type({ multiply: Value, times: Value })
);

export type DivValue = { divide: Value; by: Value };

export const DivValue: t.Type<DivValue> = t.recursion("DivValue", () =>
  t.type({ divide: Value, by: Value })
);

export type ChoiceName = t.TypeOf<typeof ChoiceName>;
export const ChoiceName = t.string;

export type ChoiceId = t.TypeOf<typeof ChoiceId>;
export const ChoiceId = t.type({
  choice_name: ChoiceName,
  choice_owner: Party,
});

export type ChoiceValue = { value_of_choice: ChoiceId };
export const ChoiceValue: t.Type<ChoiceValue> = t.recursion("ChoiceValue", () =>
  t.type({ value_of_choice: ChoiceId })
);

export type ValueId = t.TypeOf<typeof ValueId>;
export const ValueId = t.string;

export type UseValue = { use_value: ValueId };
export const UseValue: t.Type<UseValue> = t.recursion("UseValue", () =>
  t.type({ use_value: ValueId })
);

export type Cond = { if: Observation; then: Value; else: Value };
export const Cond: t.Type<Cond> = t.recursion("Cond", () =>
  t.type({ if: Observation, then: Value, else: Value })
);

export type Value =
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

export const Value: t.Type<Value> = t.recursion("Value", () =>
  t.union([
    Constant,
    NegValue,
    AddValue,
    SubValue,
    MulValue,
    DivValue,
    ChoiceValue,
    TimeIntervalStart,
    TimeIntervalEnd,
    UseValue,
    Cond,
  ])
);

export type And = { both: Observation; and: Observation };
export const And: t.Type<And> = t.recursion("And", () =>
  t.type({ both: Observation, and: Observation })
);

export type Or = { either: Observation; or: Observation };
export const Or: t.Type<Or> = t.recursion("Or", () =>
  t.type({ either: Observation, or: Observation })
);

export type Not = { not: Observation };
export const Not: t.Type<Not> = t.recursion("Not", () =>
  t.type({ not: Observation })
);

export type Chose = { chose_something_for: ChoiceId };
export const Chose: t.Type<Chose> = t.recursion("Chose", () =>
  t.type({ chose_something_for: ChoiceId })
);

export type Equal = { value: Value; equal_to: Value };

export const Equal: t.Type<Equal> = t.recursion("Equal", () =>
  t.type({ value: Value, equal_to: Value })
);

export type Greater = { value: Value; gt: Value };

export const Greater: t.Type<Greater> = t.recursion("Greater", () =>
  t.type({ value: Value, gt: Value })
);

export type GreaterOrEqual = { value: Value; ge_than: Value };

export const GreaterOrEqual: t.Type<GreaterOrEqual> = t.recursion(
  "GreaterOrEqual",
  () => t.type({ value: Value, ge_than: Value })
);

export type Lower = { value: Value; lt: Value };

export const Lower: t.Type<Lower> = t.recursion("Lower", () =>
  t.type({ value: Value, lt: Value })
);

export type LowerOrEqual = { value: Value; le_than: Value };

export const LowerOrEqual: t.Type<LowerOrEqual> = t.recursion(
  "LowerOrEqual",
  () => t.type({ value: Value, le_than: Value })
);

export type Observation =
  | And
  | Or
  | Not
  | Chose
  | Equal
  | Greater
  | GreaterOrEqual
  | Lower
  | LowerOrEqual
  | boolean;

export const Observation: t.Type<Observation> = t.recursion("Observation", () =>
  t.union([
    And,
    Or,
    Not,
    Chose,
    Equal,
    Greater,
    GreaterOrEqual,
    Lower,
    LowerOrEqual,
    t.boolean,
  ])
);
