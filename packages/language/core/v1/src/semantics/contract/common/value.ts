import * as t from "io-ts";
import { iso, Newtype } from "newtype-ts";
import { fromNewtype } from "io-ts-types";
import { Party } from "../common/payee/party.js";
import { Observation } from "./observations.js";

export const constant = (constant:bigint) => constant
export type Constant = t.TypeOf<typeof Constant>
export const Constant = t.bigint

export type TimeIntervalStart  = t.TypeOf<typeof TimeIntervalStart>
export const TimeIntervalStart = t.literal('time_interval_start')

export type TimeIntervalEnd    = t.TypeOf<typeof TimeIntervalEnd>
export const TimeIntervalEnd   = t.literal('time_interval_end')

export type  NegValue  = { negate: Value }
export const NegValue : t.Type<NegValue> = t.recursion('NegValue', () => t.type({ negate: Value }))

export type  AddValue
  = { add: Value
    , and: Value }

export const AddValue : t.Type<AddValue> = t.recursion('AddValue', () => t.type({ add: Value, and: Value }))

export type  SubValue
  = { value: Value
    , minus: Value }

export const SubValue : t.Type<SubValue> = t.recursion('SubValue', () => t.type({ value: Value, minus: Value }))

export const mulValue = (multiply:Value,times:Value) => ({ multiply: multiply, times: times })
export type  MulValue
  = { multiply: Value
    , times: Value }

export const MulValue : t.Type<MulValue> = t.recursion('MulValue', () => t.type({ multiply: Value, times: Value }))

export type  DivValue
  =  { divide: Value
    , by: Value }

export const DivValue : t.Type<DivValue> = t.recursion('DivValue', () => t.type({ divide: Value, by: Value }))

export type  ChoiceName = t.TypeOf<typeof ChoiceName>
export const ChoiceName = t.string

export type  ChoiceId  =
    { choice_name: ChoiceName
    , choice_owner: Party }

export const ChoiceId : t.Type<ChoiceId> = t.recursion('ChoiceId', () => t.type({ choice_name: ChoiceName, choice_owner: Party }))

export type  ChoiceValue  =  { value_of_choice: ChoiceId }
export const ChoiceValue : t.Type<ChoiceValue> = t.recursion('ChoiceValue', () => t.type({ value_of_choice: ChoiceId }))


export type  ValueId = t.TypeOf<typeof ValueId>
export const ValueId = t.string

export type  UseValue  =  { use_value: ValueId }
export const UseValue : t.Type<UseValue> = t.recursion('UseValue', () => t.type({ use_value: ValueId }))

export type  Cond  =  { if: Observation, then: Value, else: Value }
export const Cond : t.Type<Cond> = t.recursion('Cond', () => t.type({ if: Observation, then: Value, else: Value }))

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
  | Cond

export const Value :t.Type<Value> = t.recursion('Value', () =>
      t.union([ Constant
              , NegValue
              , AddValue
              , SubValue
              , MulValue
              , DivValue
              , ChoiceValue
              , TimeIntervalStart
              , TimeIntervalEnd
              , UseValue
              , Cond]))