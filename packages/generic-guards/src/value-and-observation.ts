import * as t from "io-ts/lib/index.js";
import { unk } from "./unk.js";

export const AvailableMoney = <
  Token extends t.Mixed = t.UnknownType,
  AccountId extends t.Mixed = t.UnknownType
>(
  guards: Partial<{
    amount_of_token: Token;
    in_account: AccountId;
  }>
) =>
  t.type({
    amount_of_token: unk(guards.amount_of_token),
    in_account: unk(guards.in_account),
  });

export const NegValue = <Value extends t.Mixed = t.UnknownType>(
  guards: Partial<{
    negate: Value;
  }>
) =>
  t.type({
    negate: unk(guards.negate),
  });

export const AddValue = <
  Value1 extends t.Mixed = t.UnknownType,
  Value2 extends t.Mixed = t.UnknownType
>(
  guards: Partial<{
    add: Value1;
    and: Value2;
  }>
) =>
  t.type({
    add: unk(guards.add),
    and: unk(guards.and),
  });

export const SubValue = <
  Value1 extends t.Mixed = t.UnknownType,
  Value2 extends t.Mixed = t.UnknownType
>(
  guards: Partial<{
    value: Value1;
    minus: Value2;
  }>
) =>
  t.type({
    value: unk(guards.value),
    minus: unk(guards.minus),
  });

export const MulValue = <
  Value1 extends t.Mixed = t.UnknownType,
  Value2 extends t.Mixed = t.UnknownType
>(
  guards: Partial<{ multiply: Value1; times: Value2 }>
) =>
  t.type({
    multiply: unk(guards.multiply),
    times: unk(guards.times),
  });

export const DivValue = <
  Value1 extends t.Mixed = t.UnknownType,
  Value2 extends t.Mixed = t.UnknownType
>(
  guards: Partial<{ divide: Value1; by: Value2 }>
) =>
  t.type({
    divide: unk(guards.divide),
    by: unk(guards.by),
  });

export const ChoiceValue = <ChoiceId extends t.Mixed = t.UnknownType>(
  guards: Partial<{ value_of_choice: ChoiceId }>
) =>
  t.type({
    value_of_choice: unk(guards.value_of_choice),
  });

export const UseValue = <ValueId extends t.Mixed = t.UnknownType>(
  guards: Partial<{ use_value: ValueId }>
) =>
  t.type({
    use_value: unk(guards.use_value),
  });

export const Cond = <
  Observation extends t.Mixed = t.UnknownType,
  ThenContract extends t.Mixed = t.UnknownType,
  ElseContract extends t.Mixed = t.UnknownType
>(
  guards: Partial<{
    if: Observation;
    then: ThenContract;
    else: ElseContract;
  }>
) =>
  t.type({
    if: unk(guards.if),
    then: unk(guards.then),
    else: unk(guards.else),
  });

export const AndObs = <
  Observation1 extends t.Mixed = t.UnknownType,
  Observation2 extends t.Mixed = t.UnknownType
>(
  guards: Partial<{ both: Observation1; and: Observation2 }>
) => t.type({ both: unk(guards.both), and: unk(guards.and) });

export const OrObs = <
  Observation1 extends t.Mixed = t.UnknownType,
  Observation2 extends t.Mixed = t.UnknownType
>(
  guards: Partial<{ either: Observation1; or: Observation2 }>
) => t.type({ either: unk(guards.either), or: unk(guards.or) });

export const NotObs = <Observation extends t.Mixed = t.UnknownType>(
  guards: Partial<{ not: Observation }>
) => t.type({ not: unk(guards.not) });

export const ChoseSomething = <ChoiceId extends t.Mixed = t.UnknownType>(
  guards: Partial<{ chose_something_for: ChoiceId }>
) => t.type({ chose_something_for: unk(guards.chose_something_for) });

export const ValueEQ = <
  Value1 extends t.Mixed = t.UnknownType,
  Value2 extends t.Mixed = t.UnknownType
>(
  guards: Partial<{ value: Value1; equal_to: Value2 }>
) =>
  t.type({
    value: unk(guards.value),
    equal_to: unk(guards.equal_to),
  });

export const ValueGT = <
  Value1 extends t.Mixed = t.UnknownType,
  Value2 extends t.Mixed = t.UnknownType
>(
  guards: Partial<{ value: Value1; gt: Value2 }>
) =>
  t.type({
    value: unk(guards.value),
    gt: unk(guards.gt),
  });

export const ValueGE = <
  Value1 extends t.Mixed = t.UnknownType,
  Value2 extends t.Mixed = t.UnknownType,
  >(guards: Partial<{ value: Value1; ge_than: Value2 }>) =>
  t.type({
    value: unk(guards.value),
    ge_than: unk(guards.ge_than),
  });

export const ValueLT = <
  Value1 extends t.Mixed = t.UnknownType,
  Value2 extends t.Mixed = t.UnknownType
>(
  guards: Partial<{ value: Value1; lt: Value2 }>
) =>
  t.type({
    value: unk(guards.value),
    lt: unk(guards.lt),
  });

export const ValueLE = <
  Value1 extends t.Mixed = t.UnknownType,
  Value2 extends t.Mixed = t.UnknownType
>(
  guards: Partial<{ value: Value1; le_than: Value2 }>
) =>
  t.type({
    value: unk(guards.value),
    le_than: unk(guards.le_than),
  });
