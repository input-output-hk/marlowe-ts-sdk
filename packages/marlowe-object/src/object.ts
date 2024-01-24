import * as t from "io-ts/lib/index.js";
import { Action, ActionGuard, matchAction } from "./actions.js";
import {
  Contract,
  ContractGuard,
  matchContract,
  stripContractAnnotations,
} from "./contract.js";
import { Party, PartyGuard, matchParty } from "./participants.js";
import { Label, LabelGuard } from "./reference.js";
import { Token, TokenGuard } from "./token.js";
import {
  ValueGuard,
  Value,
  Observation,
  ObservationGuard,
  matchObservation,
  matchValue,
} from "./value-and-observation.js";
import { Payee, matchPayee } from "./payee.js";

/**
 * Bundle of a {@link Label} that references a {@link Party}.
 * @category Object
 */
export interface ObjectParty {
  label: Label;
  type: "party";
  value: Party;
}

/**
 * {@link !io-ts-usage | Dynamic type guard} for the {@link ObjectParty | object party type}.
 * @category Object
 */
export const ObjectPartyGuard: t.Type<ObjectParty> = t.type({
  label: LabelGuard,
  type: t.literal("party"),
  value: PartyGuard,
});

/**
 * Bundle of a {@link Label} that references a {@link Value}.
 * @category Object
 */
export interface ObjectValue {
  label: Label;
  type: "value";
  value: Value;
}

/**
 * {@link !io-ts-usage | Dynamic type guard} for the {@link ObjectValue | object value type}.
 * @category Object
 */
export const ObjectValueGuard: t.Type<ObjectValue> = t.type({
  label: LabelGuard,
  type: t.literal("value"),
  value: ValueGuard,
});

/**
 * Bundle of a {@link Label} that references an {@link Observation}.
 * @category Object
 */
export interface ObjectObservation {
  label: Label;
  type: "observation";
  value: Observation;
}

/**
 * {@link !io-ts-usage | Dynamic type guard} for the {@link ObjectObservation | object observation type}.
 * @category Object
 */
export const ObjectObservationGuard: t.Type<ObjectObservation> = t.type({
  label: LabelGuard,
  type: t.literal("observation"),
  value: ObservationGuard,
});

/**
 * Bundle of a {@link Label} that references a {@link Token}.
 * @category Object
 */
export interface ObjectToken {
  label: Label;
  type: "token";
  value: Token;
}

/**
 * {@link !io-ts-usage | Dynamic type guard} for the {@link ObjectToken | object token type}.
 * @category Object
 */
export const ObjectTokenGuard: t.Type<ObjectToken> = t.type({
  label: LabelGuard,
  type: t.literal("token"),
  value: TokenGuard,
});

/**
 * Bundle of a {@link Label} that references a {@link Contract}.
 * @category Object
 */
export interface ObjectContract<A> {
  label: Label;
  type: "contract";
  value: Contract<A>;
}

/**
 * {@link !io-ts-usage | Dynamic type guard} for the {@link ObjectContract | object contract type}.
 * @category Object
 */
export const ObjectContractGuard: t.Type<ObjectContract<unknown>> = t.type({
  label: LabelGuard,
  type: t.literal("contract"),
  value: ContractGuard,
});

/**
 * Bundle of a {@link Label} that references an {@link Action}.
 * @category Object
 */
export interface ObjectAction {
  label: Label;
  type: "action";
  value: Action;
}

/**
 * {@link !io-ts-usage | Dynamic type guard} for the {@link ObjectAction | object action type}.
 * @category Object
 */
export const ObjectActionGuard: t.Type<ObjectAction> = t.type({
  label: LabelGuard,
  type: t.literal("action"),
  value: ActionGuard,
});

/**
 * A bundle of a {@link Label} that references a {@link Party}, {@link Value}, {@link Observation}, {@link Token}, {@link Contract}, or {@link Action}.
 * @category Object
 */
export type ObjectType<A> =
  | ObjectParty
  | ObjectValue
  | ObjectObservation
  | ObjectToken
  | ObjectContract<A>
  | ObjectAction;

/**
 * {@link !io-ts-usage | Dynamic type guard} for the {@link ObjectType | object type}.
 * @category Object
 */
export const ObjectTypeGuard = t.union([
  ObjectPartyGuard,
  ObjectValueGuard,
  ObjectObservationGuard,
  ObjectTokenGuard,
  ObjectContractGuard,
  ObjectActionGuard,
]);

function stripObjectTypeAnnotations<A>(
  obj: ObjectType<A>
): ObjectType<undefined> {
  if (obj.type === "contract") {
    return {
      type: obj.type,
      label: obj.label,
      value: stripContractAnnotations(obj.value),
    };
  }
  return obj;
}
/**
 * A bundle of {@link ObjectType}s.
 * @category Object
 */
export type Bundle<A> = ObjectType<A>[];

/**
 * {@link !io-ts-usage | Dynamic type guard} for the {@link Bundle | bundle type}.
 * @category Object
 */
export const BundleGuard = t.array(ObjectTypeGuard);

function stripBundleAnnotations<A>(bundle: Bundle<A>): Bundle<undefined> {
  return bundle.map(stripObjectTypeAnnotations);
}

/**
 * A contract bundle is just a {@link Bundle} with a main entrypoint.
 * @category Object
 */
export interface ContractBundle<A> {
  main: Label;
  bundle: Bundle<A>;
}

/**
 * {@link !io-ts-usage | Dynamic type guard} for the {@link ContractBundle | contract bundle type}.
 */
export const ContractBundleGuard: t.Type<ContractBundle<unknown>> = t.type({
  main: LabelGuard,
  bundle: BundleGuard,
});

export function stripContractBundleAnnotations<A>(
  bundle: ContractBundle<A>
): ContractBundle<undefined> {
  return {
    main: bundle.main,
    bundle: stripBundleAnnotations(bundle.bundle),
  };
}

// TODO: Move into its own module
export interface ContractObjectMap<A> {
  main: Label;
  objects: Map<Label, Omit<ObjectType<A>, "label">>;
}

export class CircularDependencyError extends Error {
  constructor(label: Label) {
    super(`Circular dependency detected ${label}`);
  }
}

export class MissingLabelError extends Error {
  constructor(label: Label) {
    super(`Missing label ${label}`);
  }
}

type ObjectTypes = ObjectType<unknown>["type"];

export class ObjectTypeMismatchError extends Error {
  constructor(label: Label, expected: ObjectTypes, got: ObjectTypes) {
    super(`Expected ${label} to be a ${expected} but got ${got} instead.`);
  }
}

/**
 * Converts a {@link ContractObjectMap} to a {@link ContractBundle} while checking
 * that all references are valid and there are no circular dependencies.
 */
export function mapToContractBundle<A>(
  contractBundleMap: ContractObjectMap<A>
): ContractBundle<A> {
  const goValue = matchValue({
    availableMoney: (v) => {
      goToken(v.amount_of_token);
      goParty(v.in_account);
    },
    negValue: (v) => {
      goValue(v.negate);
    },
    addValue: (v) => {
      goValue(v.add);
      goValue(v.and);
    },
    subValue: (v) => {
      goValue(v.value);
      goValue(v.minus);
    },
    mulValue: (v) => {
      goValue(v.multiply);
      goValue(v.times);
    },
    divValue: (v) => {
      goValue(v.divide);
      goValue(v.by);
    },
    choiceValue: (v) => {
      goParty(v.value_of_choice.choice_owner);
    },
    cond: (v) => {
      goObservation(v.if);
      goValue(v.then);
      goValue(v.else);
    },
    reference: (v) => goRef(v.ref, "value"),
  });
  function goToken(token: Token) {
    if ("ref" in token) {
      goRef(token.ref, "token");
    }
  }
  const goParty = matchParty({
    reference: (p) => goRef(p.ref, "party"),
  });

  const goObservation = matchObservation({
    andObs: (o) => {
      goObservation(o.and);
      goObservation(o.both);
    },
    orObs: (o) => {
      goObservation(o.either);
      goObservation(o.or);
    },
    notObs: (o) => {
      goObservation(o.not);
    },
    choseSomething: (o) => {
      goParty(o.chose_something_for.choice_owner);
    },
    valueEQ: (o) => {
      goValue(o.value);
      goValue(o.equal_to);
    },
    valueGT: (o) => {
      goValue(o.value);
      goValue(o.gt);
    },
    valueGE: (o) => {
      goValue(o.value);
      goValue(o.ge_than);
    },
    valueLT: (o) => {
      goValue(o.value);
      goValue(o.lt);
    },
    valueLE: (o) => {
      goValue(o.value);
      goValue(o.le_than);
    },
    reference: (o) => goRef(o.ref, "observation"),
  });

  const goAction = matchAction({
    deposit: (a) => {
      goParty(a.party);
      goValue(a.deposits);
      goToken(a.of_token);
      goParty(a.into_account);
    },
    choice: (a) => {
      goParty(a.for_choice.choice_owner);
    },
    notify: (a) => {
      goObservation(a.notify_if);
    },
    reference: (a) => goRef(a.ref, "action"),
  });

  const goPayee = matchPayee({
    party: goParty,
    account: goParty,
  });

  const goContract = (parents: Label[]) =>
    matchContract({
      pay: (c) => {
        goValue(c.pay);
        goToken(c.token);
        goParty(c.from_account);
        goPayee(c.to);
        goContract(parents)(c.then);
      },
      if: (c) => {
        goObservation(c.if);
        goContract(parents)(c.then);
        goContract(parents)(c.else);
      },
      when: (c) => {
        c.when.forEach((aCase) => {
          goAction(aCase.case);
          if ("then" in aCase) {
            goContract(parents)(aCase.then);
          } else {
            goRef(aCase.merkleized_then, "contract");
          }
        });
        goContract(parents)(c.timeout_continuation);
      },
      let: (c) => {
        goValue(c.be);
        goContract(parents)(c.then);
      },
      assert: (c) => {
        goObservation(c.assert);
        goContract(parents)(c.then);
      },
      reference: (c) => goRef(c.ref, "contract", parents),
    });

  // Global variables between the inner recursions
  const bundle: Bundle<A> = [];
  const visited = new Set<Label>();

  function goRef(label: Label, type: ObjectTypes, parents: Label[] = []) {
    const obj = contractBundleMap.objects.get(label);
    if (!obj) {
      throw new MissingLabelError(label);
    }
    if (obj.type !== type) {
      throw new ObjectTypeMismatchError(label, type, obj.type);
    }

    // We don't process the same element twice.
    if (visited.has(label)) {
      return;
    }

    visited.add(label);

    switch (obj.type) {
      case "contract":
        if (parents.includes(label)) {
          throw new CircularDependencyError(label);
        }
        goContract([...parents, label])(obj.value as Contract<A>);
        break;
      case "value":
        goValue(obj.value as Value);
        break;
      case "token":
        goToken(obj.value as Token);
        break;
      case "party":
        goParty(obj.value as Party);
        break;
      case "observation":
        goObservation(obj.value as Observation);
        break;
      case "action":
        goAction(obj.value as Action);
        break;
    }
    bundle.push({ label, type, value: obj.value } as ObjectType<A>);
  }
  goRef(contractBundleMap.main, "contract");
  return { main: contractBundleMap.main, bundle };
}
