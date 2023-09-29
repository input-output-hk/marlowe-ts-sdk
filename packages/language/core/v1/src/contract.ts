import * as t from "io-ts/lib/index.js";
import {
  Observation,
  ObservationGuard,
  Value,
  ValueId,
} from "./value-and-observation.js";
import { AccountId, AccountIdGuard, Payee } from "./payee.js";
import { PayeeGuard } from "./payee.js";
import { Token, TokenGuard } from "./token.js";
import { ValueGuard, ValueIdGuard } from "./value-and-observation.js";
import { Action, ActionGuard } from "./actions.js";
import { pipe } from "fp-ts/lib/function.js";
import getUnixTime from "date-fns/getUnixTime/index.js";

/**
 * Search [[lower-name-builders]]
 * @hidden
 */
export const close = "close";
/**
 * TODO: Comment
 * @category Contract
 */
export type Close = "close";

/**
 * TODO: Comment
 * @category Contract
 */
export const CloseGuard: t.Type<Close> = t.literal("close");

/**
 * @hidden
 */
//
// [[lower-name-builders]] DISCUSSION:
//     What should we do with the lower case constructors? close, pay, role, etc... There are some that are impossible to
//     make, for example `let` and `if` which are reserved words in JS. For the moment I'm hidding them from the API.
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

/**
 * TODO: Comment
 * @category Contract
 */
export interface Pay {
  pay: Value;
  token: Token;
  from_account: AccountId;
  to: Payee;
  then: Contract;
}

/**
 * TODO: Comment
 * @category Contract
 */
export const PayGuard = t.recursion<Pay>("Pay", () =>
  t.type({
    pay: ValueGuard,
    token: TokenGuard,
    from_account: AccountIdGuard,
    to: PayeeGuard,
    then: ContractGuard,
  })
);

/**
 * TODO: Comment
 * @category Contract
 */
export interface If {
  /**
   * TODO: Comment
   */
  if: Observation;
  /**
   * TODO: Comment
   */
  then: Contract;
  /**
   * TODO: Comment
   */
  else: Contract;
}

/**
 * TODO: Comment
 * @category Contract
 */
export const IfGuard: t.Type<If> = t.recursion("If", () =>
  t.type({ if: ObservationGuard, then: ContractGuard, else: ContractGuard })
);

/**
 * TODO: Comment
 * @category Contract
 */
export interface Let {
  /**
   * TODO: Comment
   */
  let: ValueId;
  /**
   * TODO: Comment
   */
  be: Value;
  /**
   * TODO: Comment
   */
  then: Contract;
}

/**
 * TODO: Comment
 * @category Contract
 */
export const LetGuard: t.Type<Let> = t.recursion("Let", () =>
  t.type({ let: ValueIdGuard, be: ValueGuard, then: ContractGuard })
);

/**
 * TODO: Comment
 * @category Contract
 */
export interface Assert {
  /**
   * TODO: Comment
   */
  assert: Observation;
  /**
   * TODO: Comment
   */
  then: Contract;
}

/**
 * TODO: Comment
 * @category Contract
 */
export const AssertGuard: t.Type<Assert> = t.recursion("Assert", () =>
  t.type({ assert: ObservationGuard, then: ContractGuard })
);

/**
 * TODO: Comment
 * @category Contract
 */
export interface When {
  /**
   * TODO: Comment
   */
  when: Case[];
  /**
   * TODO: Comment
   */
  timeout: Timeout;
  /**
   * TODO: Comment
   */
  timeout_continuation: Contract;
}
/**
 * TODO: Comment
 * @category Contract
 */
export const WhenGuard: t.Type<When> = t.recursion("When", () =>
  t.type({
    when: t.array(CaseGuard),
    timeout: TimeoutGuard,
    timeout_continuation: ContractGuard,
  })
);

/**
 * TODO: Comment
 * @category Contract
 */
export interface Case {
  /**
   * TODO: Comment
   */
  case: Action;
  /**
   * TODO: Comment
   */
  then: Contract;
}

/**
 * TODO: Comment
 * @category Contract
 */
export const CaseGuard: t.Type<Case> = t.recursion("Case", () =>
  t.type({ case: ActionGuard, then: ContractGuard })
);

/**
 * TODO: Comment
 * @category Contract
 */
export type Timeout = bigint;
/**
 * TODO: Comment
 * @category Contract
 */
export const TimeoutGuard: t.Type<Timeout> = t.bigint;

/**
 * @hidden
 */
export const datetoTimeout = (date: Date): Timeout =>
  pipe(
    date,
    getUnixTime,
    (a) => a * 1_000,
    BigInt,
    (a) => a.valueOf()
  );

/**
 * @hidden
 */
export const timeoutToDate = (timeout: Timeout): Date =>
  new Date(Number(timeout));
export type Contract = Close | Pay | If | When | Let | Assert;

/**
 * TODO: Comment
 * @category Contract
 */
export const ContractGuard: t.Type<Contract> = t.recursion("Contract", () =>
  t.union([CloseGuard, PayGuard, IfGuard, WhenGuard, LetGuard, AssertGuard])
);
