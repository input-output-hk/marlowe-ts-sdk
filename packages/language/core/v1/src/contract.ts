import * as t from "io-ts/lib/index.js";
import { Observation } from "./value-and-observation.js";
import { AccountId } from "./payee.js";
import { Payee } from "./payee.js";
import { Token } from "./token.js";
import { Value, ValueId } from "./value-and-observation.js";
import { Action } from "./actions.js";
import { pipe } from "fp-ts/lib/function.js";
import getUnixTime from "date-fns/getUnixTime/index.js";

export const close = "close";
export type Close = t.TypeOf<typeof Close>;
export const Close = t.literal("close");

export const pay = (
  pay: Value,
  token: Token,
  from_account: AccountId,
  to: Payee,
  then: Contract
) => ({
  pay: pay,
  token: token,
  from_account: from_account,
  to: to,
  then: then,
});

export type Pay = {
  pay: Value;
  token: Token;
  from_account: AccountId;
  to: Payee;
  then: Contract;
};

export const Pay = t.recursion<Pay>("Pay", () =>
  t.type({
    pay: Value,
    token: Token,
    from_account: AccountId,
    to: Payee,
    then: Contract,
  })
);

export type If = { if: Observation; then: Contract; else: Contract };

export const If: t.Type<If> = t.recursion("If", () =>
  t.type({ if: Observation, then: Contract, else: Contract })
);

export type Let = { let: ValueId; be: Value; then: Contract };

export const Let: t.Type<Let> = t.recursion("Let", () =>
  t.type({ let: ValueId, be: Value, then: Contract })
);

export type Assert = { assert: Observation; then: Contract };

export const Assert: t.Type<Assert> = t.recursion("Assert", () =>
  t.type({ assert: Observation, then: Contract })
);

export type When = {
  when: Case[];
  timeout: Timeout;
  timeout_continuation: Contract;
};

export const When: t.Type<When> = t.recursion("When", () =>
  t.type({
    when: t.array(Case),
    timeout: Timeout,
    timeout_continuation: Contract,
  })
);

export type Case = { case: Action; then: Contract };

export const Case: t.Type<Case> = t.recursion("Case", () =>
  t.type({ case: Action, then: Contract })
);

export type Timeout = t.TypeOf<typeof Timeout>;
export const Timeout = t.bigint;

export const datetoTimeout = (date: Date): Timeout =>
  pipe(
    date,
    getUnixTime,
    (a) => a * 1_000,
    BigInt,
    (a) => a.valueOf()
  );

export const timeoutToDate = (timeout: Timeout): Date =>
  new Date(Number(timeout));

export type Contract = Close | Pay | If | When | Let | Assert;

export const Contract: t.Type<Contract> = t.recursion("Contract", () =>
  t.union([Close, Pay, If, When, Let, Assert])
);
