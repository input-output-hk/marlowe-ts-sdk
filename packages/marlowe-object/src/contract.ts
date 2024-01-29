import * as t from "io-ts/lib/index.js";
import { Timeout, BuiltinByteString } from "@marlowe.io/language-core-v1";
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
import { Reference, ReferenceGuard } from "./reference.js";

export { Timeout, BuiltinByteString };

export class Close<A> extends String {
  constructor(public annotation?: A) {
    super("close");
  }
}

export const close = <A>(annotation?: A) => new Close<A>(annotation);

export const CloseGuard: t.Type<Close<unknown>> = new t.Type(
  "close",
  (input: unknown): input is Close<unknown> => input == "close",
  (input, context) =>
    input == "close" ? t.success("close" as const) : t.failure(input, context),
  t.identity
);

/**
 * Marlowe Object version of {@link @marlowe.io/language-core-v1!index.Pay | Core Pay}.
 * @category Contract
 */
export interface Pay<A> {
  annotation?: A;
  pay: Value;
  token: Token;
  from_account: AccountId;
  to: Payee;
  then: Contract<A>;
}

/**
 * {@link !io-ts-usage | Dynamic type guard} for the {@link Pay | pay type}.
 * @category Contract
 */
export const PayGuard = t.recursion<Pay<unknown>>("Pay", () =>
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
export interface If<A> {
  annotation?: A;
  if: Observation;
  then: Contract<A>;
  else: Contract<A>;
}

/**
 * {@link !io-ts-usage | Dynamic type guard} for the {@link If | if type}.
 * @category Contract
 */
export const IfGuard: t.Type<If<unknown>> = t.recursion("If", () =>
  t.type({
    if: ObservationGuard,
    then: ContractGuard,
    else: ContractGuard,
  })
);

/**
 * Marlowe Object version of {@link @marlowe.io/language-core-v1!index.Let | Core Let}.
 * @category Contract
 */
export interface Let<A> {
  annotation?: A;
  let: ValueId;
  be: Value;
  then: Contract<A>;
}

/**
 * {@link !io-ts-usage | Dynamic type guard} for the {@link Let | let type}.
 * @category Contract
 */
export const LetGuard: t.Type<Let<unknown>> = t.recursion("Let", () =>
  t.type({ let: G.ValueId, be: ValueGuard, then: ContractGuard })
);

/**
 * Marlowe Object version of {@link @marlowe.io/language-core-v1!index.Assert | Core Assert}.
 * @category Contract
 */
export interface Assert<A> {
  annotation?: A;
  assert: Observation;
  then: Contract<A>;
}

/**
 * {@link !io-ts-usage | Dynamic type guard} for the {@link Assert | assert type}.
 * @category Contract
 */
export const AssertGuard: t.Type<Assert<unknown>> = t.recursion("Assert", () =>
  t.type({ assert: ObservationGuard, then: ContractGuard })
);

/**
 * Marlowe Object version of {@link @marlowe.io/language-core-v1!index.When | Core When}.
 * @category Contract
 */
export interface When<A> {
  annotation?: A;
  when: Case<A>[];
  timeout: Timeout;
  timeout_continuation: Contract<A>;
}
/**
 * {@link !io-ts-usage | Dynamic type guard} for the {@link When | when type}.
 * @category Contract
 */
export const WhenGuard: t.Type<When<unknown>> = t.recursion("When", () =>
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
export interface NormalCase<A> {
  case: Action;
  then: Contract<A>;
}

/**
 * {@link !io-ts-usage | Dynamic type guard} for the {@link NormalCase | normal case type}.
 * @category Contract
 */
export const NormalCaseGuard: t.Type<NormalCase<unknown>> = t.recursion(
  "Case",
  () => t.type({ case: ActionGuard, then: ContractGuard })
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
export type Case<A> = NormalCase<A> | MerkleizedCase;

/**
 * {@link !io-ts-usage | Dynamic type guard} for the {@link Case | case type}.
 * @category Contract
 */
export const CaseGuard: t.Type<Case<unknown>> = t.recursion("Case", () =>
  t.union([NormalCaseGuard, MerkleizedCaseGuard])
);

/**
 * Marlowe Object version of {@link @marlowe.io/language-core-v1!index.MerkleizedCase | Core MerkleizedCase} with
 * the ability to reference other contracts.
 * @category Contract
 */
export type Contract<A> =
  | Close<A>
  | Pay<A>
  | If<A>
  | When<A>
  | Let<A>
  | Assert<A>
  | Reference;

/**
 * {@link !io-ts-usage | Dynamic type guard} for the {@link Contract | contract type}.
 * @category Contract
 */
export const ContractGuard: t.Type<Contract<unknown>> = t.recursion(
  "Contract",
  () =>
    t.union([
      CloseGuard,
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
  close: (contract: Close<unknown>) => T;
  pay: (pay: Pay<unknown>) => T;
  if: (contract: If<unknown>) => T;
  when: (contract: When<unknown>) => T;
  let: (contract: Let<unknown>) => T;
  assert: (contract: Assert<unknown>) => T;
  reference: (contract: Reference) => T;
};

/**
 * Pattern matching on the Contract type
 * @hidden
 * @category Contract
 */
export function matchContract<T>(
  matcher: ContractMatcher<T>
): (contract: Contract<unknown>) => T;
export function matchContract<T>(
  matcher: Partial<ContractMatcher<T>>
): (contract: Contract<unknown>) => T | undefined;
export function matchContract<T>(matcher: Partial<ContractMatcher<T>>) {
  return (contract: Contract<unknown>) => {
    if (CloseGuard.is(contract) && matcher.close) {
      return matcher.close(contract);
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

function stripCaseAnnotations<A>(c: Case<A>): Case<undefined> {
  if ("then" in c) {
    return { ...c, then: stripContractAnnotations(c.then) };
  } else {
    return c;
  }
}

export function stripContractAnnotations<A>(
  contract: Contract<A>
): Contract<undefined> {
  return matchContract<Contract<undefined>>({
    close: () => "close" as const,
    pay: (p) => ({
      ...p,
      then: stripContractAnnotations(p.then),
      annotation: undefined,
    }),
    if: (i) => ({
      ...i,
      then: stripContractAnnotations(i.then),
      else: stripContractAnnotations(i.else),
      annotation: undefined,
    }),
    when: (w) => ({
      ...w,
      when: w.when.map(stripCaseAnnotations),
      timeout_continuation: stripContractAnnotations(w.timeout_continuation),
      annotation: undefined,
    }),
    let: (l) => ({
      ...l,
      then: stripContractAnnotations(l.then),
      annotation: undefined,
    }),
    assert: (a) => ({
      ...a,
      then: stripContractAnnotations(a.then),
      annotation: undefined,
    }),
    reference: (r) => ({ ...r, annotation: undefined }),
  })(contract);
}
