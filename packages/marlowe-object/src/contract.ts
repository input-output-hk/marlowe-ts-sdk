import * as t from "io-ts/lib/index.js";
import {
  close,
  Close,
  Timeout,
  BuiltinByteString,
} from "@marlowe.io/language-core-v1";
import * as G from "@marlowe.io/language-core-v1/guards";

import {
  Observation,
  ObservationGuard,
  Value,
  ValueId,
} from "./value-and-observation.js";
import { AccountId, AccountIdGuard, Payee } from "./payee.js";
import { PayeeGuard } from "./payee.js";
import { Token, TokenGuard } from "./token.js";
import { ValueGuard } from "./value-and-observation.js";
import { Action, ActionGuard } from "./actions.js";
import { pipe } from "fp-ts/lib/function.js";
import getUnixTime from "date-fns/getUnixTime/index.js";
import { Reference, ReferenceGuard } from "./reference.js";

export { close, Close, Timeout, BuiltinByteString };

/**
 * Marlowe Object version of {@link @marlowe.io/language-core-v1!index.Pay | Core Pay}.
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
 * {@link !io-ts-usage | Dynamic type guard} for the {@link Pay | pay type}.
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
 * Marlowe Object version of {@link @marlowe.io/language-core-v1!index.If | Core If}.
 * @category Contract
 */
export interface If {
  if: Observation;
  then: Contract;
  else: Contract;
}

/**
 * {@link !io-ts-usage | Dynamic type guard} for the {@link If | if type}.
 * @category Contract
 */
export const IfGuard: t.Type<If> = t.recursion("If", () =>
  t.type({ if: ObservationGuard, then: ContractGuard, else: ContractGuard })
);

/**
 * Marlowe Object version of {@link @marlowe.io/language-core-v1!index.Let | Core Let}.
 * @category Contract
 */
export interface Let {
  let: ValueId;
  be: Value;
  then: Contract;
}

/**
 * {@link !io-ts-usage | Dynamic type guard} for the {@link Let | let type}.
 * @category Contract
 */
export const LetGuard: t.Type<Let> = t.recursion("Let", () =>
  t.type({ let: G.ValueId, be: ValueGuard, then: ContractGuard })
);

/**
 * Marlowe Object version of {@link @marlowe.io/language-core-v1!index.Assert | Core Assert}.
 * @category Contract
 */
export interface Assert {
  assert: Observation;
  then: Contract;
}

/**
 * {@link !io-ts-usage | Dynamic type guard} for the {@link Assert | assert type}.
 * @category Contract
 */
export const AssertGuard: t.Type<Assert> = t.recursion("Assert", () =>
  t.type({ assert: ObservationGuard, then: ContractGuard })
);

/**
 * Marlowe Object version of {@link @marlowe.io/language-core-v1!index.When | Core When}.
 * @category Contract
 */
export interface When {
  when: Case[];
  timeout: Timeout;
  timeout_continuation: Contract;
}
/**
 * {@link !io-ts-usage | Dynamic type guard} for the {@link when | when type}.
 * @category Contract
 */
export const WhenGuard: t.Type<When> = t.recursion("When", () =>
  t.type({
    when: t.array(CaseGuard),
    timeout: G.Timeout,
    timeout_continuation: ContractGuard,
  })
);

/**
 * Marlowe Object version of {@link @marlowe.io/language-core-v1!index.NormalCase | Core NormalCase}.
 * @category Contract
 */
export interface NormalCase {
  case: Action;
  then: Contract;
}

/**
 * {@link !io-ts-usage | Dynamic type guard} for the {@link NormalCase | normal case type}.
 * @category Contract
 */
export const NormalCaseGuard: t.Type<NormalCase> = t.recursion("Case", () =>
  t.type({ case: ActionGuard, then: ContractGuard })
);

/**
 * Marlowe Object version of {@link @marlowe.io/language-core-v1!index.MerkleizedCase | Core MerkleizedCase}.
 * DON'T CREATE THIS ON YOUR OWN, let the runtime do it for you.
 * @category Contract
 */
export interface MerkleizedCase {
  case: Action;
  /**
   * A hash of the contract that will be executed if the case is matched.
   * Never construct this value yourself, the runtime should calculate hashing.
   */
  merkleized_then: BuiltinByteString;
}

/**
 * {@link !io-ts-usage | Dynamic type guard} for the {@link MerkleizedCase | merkleized case type}.
 * @category Contract
 */
export const MerkleizedCaseGuard: t.Type<MerkleizedCase> = t.type({
  case: ActionGuard,
  merkleized_then: t.string,
});

/**
 * @category Contract
 */
export type Case = NormalCase | MerkleizedCase;

/**
 * {@link !io-ts-usage | Dynamic type guard} for the {@link Case | case type}.
 * @category Contract
 */
export const CaseGuard: t.Type<Case> = t.recursion("Case", () =>
  t.union([NormalCaseGuard, MerkleizedCaseGuard])
);

/**
 * Marlowe Object version of {@link @marlowe.io/language-core-v1!index.MerkleizedCase | Core MerkleizedCase} with
 * the ability to reference other contracts.
 * @category Contract
 */
export type Contract = Close | Pay | If | When | Let | Assert | Reference;

/**
 * {@link !io-ts-usage | Dynamic type guard} for the {@link Contract | contract type}.
 * @category Contract
 */
export const ContractGuard: t.Type<Contract> = t.recursion("Contract", () =>
  t.union([
    G.Close,
    PayGuard,
    IfGuard,
    WhenGuard,
    LetGuard,
    AssertGuard,
    ReferenceGuard,
  ])
);

/**
 * Pattern match object on the Contract type
 * @category Contract
 * @hidden
 */
export type ContractMatcher<T> = {
  close: () => T;
  pay: (pay: Pay) => T;
  if: (contract: If) => T;
  when: (contract: When) => T;
  let: (contract: Let) => T;
  assert: (contract: Assert) => T;
  reference: (contract: Reference) => T;
};

/**
 * Pattern matching on the Contract type
 * @hidden
 * @category Contract
 */
export function matchContract<T>(
  matcher: ContractMatcher<T>
): (contract: Contract) => T;
export function matchContract<T>(
  matcher: Partial<ContractMatcher<T>>
): (contract: Contract) => T | undefined;
export function matchContract<T>(matcher: Partial<ContractMatcher<T>>) {
  return (contract: Contract) => {
    if (G.Close.is(contract) && matcher.close) {
      return matcher.close();
    } else if (PayGuard.is(contract) && matcher.pay) {
      return matcher.pay(contract);
    } else if (IfGuard.is(contract) && matcher.if) {
      return matcher.if(contract);
    } else if (WhenGuard.is(contract) && matcher.when) {
      return matcher.when(contract);
    } else if (LetGuard.is(contract) && matcher.let) {
      return matcher.let(contract);
    } else if (AssertGuard.is(contract) && matcher.assert) {
      return matcher.assert(contract);
    } else if (ReferenceGuard.is(contract) && matcher.reference) {
      return matcher.reference(contract);
    }
  };
}
