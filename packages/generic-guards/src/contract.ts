import * as t from "io-ts/lib/index.js";
import { unk } from "./unk.js";

export const Pay = <
  Value extends t.Mixed = t.UnknownType,
  Token extends t.Mixed = t.UnknownType,
  AccountId extends t.Mixed = t.UnknownType,
  Payee extends t.Mixed = t.UnknownType,
  Contract extends t.Mixed = t.UnknownType
>(
  guards: Partial<{
    pay: Value;
    token: Token;
    from_account: AccountId;
    to: Payee;
    then: Contract;
  }>
) =>
  t.type({
    pay: unk(guards.pay),
    token: unk(guards.token),
    from_account: unk(guards.from_account),
    to: unk(guards.to),
    then: unk(guards.then),
  });

export const If = <
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

export const Let = <
  ValueId extends t.Mixed = t.UnknownType,
  Value extends t.Mixed = t.UnknownType,
  Contract extends t.Mixed = t.UnknownType
>(
  guards: Partial<{
    let: ValueId;
    be: Value;
    then: Contract;
  }>
) =>
  t.type({
    let: unk(guards.let),
    be: unk(guards.be),
    then: unk(guards.then),
  });

export const When = <
  When extends t.Mixed = t.UnknownType,
  Timeout extends t.Mixed = t.UnknownType,
  TimeoutContinuation extends t.Mixed = t.UnknownType
>(
  guards: Partial<{
    when: When;
    timeout: Timeout;
    timeout_continuation: TimeoutContinuation;
  }>
) =>
  t.type({
    when: unk(guards.when),
    timeout: unk(guards.timeout),
    timeout_continuation: unk(guards.timeout_continuation),
  });

export const NormalCase = <
  Action extends t.Mixed = t.UnknownType,
  Contract extends t.Mixed = t.UnknownType
>(
  g: Partial<{
    case: Action;
    then: Contract;
  }>
) => t.type({ case: unk(g.case), then: unk(g.then) });
