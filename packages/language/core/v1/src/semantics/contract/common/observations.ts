import * as t from "io-ts";
import { iso, Newtype } from "newtype-ts";
import { fromNewtype } from "io-ts-types";
import { ChoiceId, Value } from "./value.js";

export type  And  = { both: Observation, and: Observation }
export const And : t.Type<And> = t.recursion('And', () => t.type({ both: Observation, and: Observation }))

export type  Or  = { either: Observation, or: Observation }
export const Or : t.Type<Or> = t.recursion('Or', () => t.type({ either: Observation, or: Observation }))

export type  Not  = { not: Observation }
export const Not : t.Type<Not> = t.recursion('Not', () => t.type({ not: Observation }))

export type  Chose  = { chose_something_for: ChoiceId }
export const Chose : t.Type<Chose> = t.recursion('Chose', () => t.type({ chose_something_for: ChoiceId }))

export type  Equal
  = { value: Value
    , equal_to: Value }

export const Equal : t.Type<Equal> = t.recursion('Equal', () =>
  t.type({ value: Value, equal_to: Value }))

export type  Greater
  = { value: Value
    , gt: Value }

export const Greater : t.Type<Greater> = t.recursion('Greater', () =>
  t.type({ value: Value, gt: Value }))

export type  GreaterOrEqual
= { value: Value
  , ge_than: Value }

export const GreaterOrEqual : t.Type<GreaterOrEqual> = t.recursion('GreaterOrEqual', () =>
  t.type({ value: Value, ge_than: Value }))

export type  Lower
= { value: Value
  , lt: Value }

export const Lower : t.Type<Lower> = t.recursion('Lower', () =>
  t.type({ value: Value, lt: Value }))

export type  LowerOrEqual
  = { value: Value
    , le_than: Value }

export const LowerOrEqual : t.Type<LowerOrEqual> = t.recursion('LowerOrEqual', () =>
  t.type({ value: Value, le_than: Value }))

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
  | boolean

export const Observation : t.Type<Observation> = t.recursion('Observation', () =>
  t.union([ And
          , Or
          , Not
          , Chose
          , Equal
          , Greater
          , GreaterOrEqual
          , Lower
          , LowerOrEqual
          , t.boolean]))