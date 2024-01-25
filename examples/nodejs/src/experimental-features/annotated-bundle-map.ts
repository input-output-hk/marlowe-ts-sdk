import {
  Bundle,
  Case,
  ContractObjectMap,
  Label,
  ObjectType,
} from "@marlowe.io/marlowe-object";
import { Action, Timeout } from "@marlowe.io/language-core-v1";
import * as M from "fp-ts/lib/Map.js";
import { deepEqual } from "@marlowe.io/adapter/deep-equal";

let globalCounter = 0;
function fixmeCounter() {
  return globalCounter++;
}
function closeA<T>(annotation?: T): ContractObjectMap<T> {
  const ref = `close-${fixmeCounter()}`;
  const contract = annotation
    ? { annotation, contract: "close" as const }
    : "close";
  return {
    main: ref,
    objects: new Map([
      // TODO: Nothing is checking that contract and close match. We need to improve the omit
      [ref, { type: "contract", value: contract }],
    ]),
  };
}

type WhenAParams<T> = {
  annotation: T;
  when: [Action, ContractObjectMap<T>][];
  timeout: Timeout;
  timeout_continuation: ContractObjectMap<T>;
};

type FIXMEMAP<T> = Map<Label, Omit<ObjectType<T>, "label">>;

function whenA<T>(params: WhenAParams<T>): ContractObjectMap<T> {
  const timeoutBundle = params.timeout_continuation;

  const timeoutRef = { ref: timeoutBundle.main };

  const whenLabel = `when-${fixmeCounter()}`; // FIXME

  const cases = params.when.map(([action, cont]) => {
    return {
      case: action,
      then: { ref: cont.main },
    } as Case<T>;
  });
  const casesObjects = params.when.flatMap(
    ([_, cont]) => cont.objects as FIXMEMAP<T>
  );

  const labelEqual = {
    equals: (a: Label, b: Label) => a === b,
  };
  const mergeSameObject = {
    // TODO: Give name to the Omit.
    concat: (
      a: Omit<ObjectType<T>, "label">,
      b: Omit<ObjectType<T>, "label">
    ) => {
      if (deepEqual(a, b)) return a;
      throw new Error("Can't merge two objecs with different values");
    },
  };
  const objects = [...casesObjects, timeoutBundle.objects].reduce(
    (acc, curr) => M.union(labelEqual, mergeSameObject)(acc)(curr),
    new Map([
      [
        whenLabel,
        {
          type: "contract",
          value: {
            annotation: params.annotation,
            when: cases,
            timeout: params.timeout,
            timeout_continuation: timeoutRef,
          },
        },
      ],
    ]) as FIXMEMAP<T>
  );

  return {
    main: whenLabel,
    objects,
  };
}

type AnnotatedConstructors<T> = {
  when: (params: WhenAParams<T>) => ContractObjectMap<T>;
  close: (state: T) => ContractObjectMap<T>;
};

export function mkAnnotatedContract<T>(
  creator: (constructors: AnnotatedConstructors<T>) => ContractObjectMap<T>
): ContractObjectMap<T> {
  return creator({
    when: whenA,
    close: closeA,
  });
}
