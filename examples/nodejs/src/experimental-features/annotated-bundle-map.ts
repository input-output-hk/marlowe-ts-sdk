import {
  Close,
  Case,
  ContractBundleMap,
  Label,
} from "@marlowe.io/marlowe-object";
import * as BundleM from "@marlowe.io/marlowe-object/bundle-map";
import { Action, Timeout } from "@marlowe.io/language-core-v1";
import * as M from "fp-ts/lib/Map.js";
import { deepEqual } from "@marlowe.io/adapter/deep-equal";

let globalCounter = 0;
function fixmeCounter() {
  return globalCounter++;
}
function closeA<T>(annotation?: T): ContractBundleMap<T> {
  const ref = `close-${fixmeCounter()}`;
  return {
    main: ref,
    objects: new Map([
      // TODO: Nothing is checking that contract and close match. We need to improve the omit
      [ref, { type: "contract", value: new Close(annotation) }],
    ]),
  };
}

type WhenAParams<T> = {
  annotation: T;
  when: [Action, ContractBundleMap<T>][];
  timeout: Timeout;
  timeout_continuation: ContractBundleMap<T>;
};

function whenA<T>(params: WhenAParams<T>): ContractBundleMap<T> {
  const timeoutBundle = params.timeout_continuation;

  const timeoutRef = { ref: timeoutBundle.main };

  const whenLabel = `when-${fixmeCounter()}`; // FIXME

  const cases = params.when.map(([action, cont]) => {
    return {
      case: action,
      then: { ref: cont.main },
    } as Case<T>;
  });
  const casesObjects = params.when.flatMap(([_, cont]) => cont.objects);

  const labelEqual = {
    equals: (a: Label, b: Label) => a === b,
  };
  const mergeSameObject = {
    concat: (a: BundleM.ObjectType<T>, b: BundleM.ObjectType<T>) => {
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
    ])
  );

  return {
    main: whenLabel,
    objects,
  };
}

type AnnotatedConstructors<T> = {
  when: (params: WhenAParams<T>) => ContractBundleMap<T>;
  close: (state: T) => ContractBundleMap<T>;
};

export function mkAnnotatedContract<T>(
  creator: (constructors: AnnotatedConstructors<T>) => ContractBundleMap<T>
): ContractBundleMap<T> {
  return creator({
    when: whenA,
    close: closeA,
  });
}
