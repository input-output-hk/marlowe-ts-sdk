import { matchAction } from "./actions.js";
import { BundleList, ContractBundleList } from "./bundle-list.js";
import * as List from "./bundle-list.js";
import { ContractBundleMap } from "./bundle-map.js";
import { matchContract } from "./contract.js";
import { matchParty } from "./participants.js";
import { matchPayee } from "./payee.js";
import { Label } from "./reference.js";
import { Token } from "./token.js";
import { matchObservation, matchValue } from "./value-and-observation.js";

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

type ObjectTypes =
  | "action"
  | "contract"
  | "observation"
  | "party"
  | "token"
  | "value";

export class ObjectTypeMismatchError extends Error {
  constructor(label: Label, expected: ObjectTypes, got: ObjectTypes) {
    super(`Expected ${label} to be a ${expected} but got ${got} instead.`);
  }
}
// TODO: Rename to bundleMapToList
/**
 * Converts a {@link ContractBundleMap} to a {@link ContractBundleList} while checking
 * that all references are valid and there are no circular dependencies.
 */
export function bundleMapToList<A>(
  contractBundleMap: ContractBundleMap<A>
): ContractBundleList<A> {
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
  const bundle: BundleList<A> = [];
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
        goContract([...parents, label])(obj.value);
        break;
      case "value":
        goValue(obj.value);
        break;
      case "token":
        goToken(obj.value);
        break;
      case "party":
        goParty(obj.value);
        break;
      case "observation":
        goObservation(obj.value);
        break;
      case "action":
        goAction(obj.value);
        break;
    }
    bundle.push({ label, type, value: obj.value } as List.ObjectType<A>);
  }
  goRef(contractBundleMap.main, "contract");
  return { main: contractBundleMap.main, bundle };
}
