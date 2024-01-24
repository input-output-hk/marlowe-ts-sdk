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

export type AnnotatedBundle<T> = {
  objectMap: ContractObjectMap;
  annotation?: T;
};

let globalCounter = 0;
function fixmeCounter() {
  return globalCounter++;
}

function closeA<T>(annotation?: T): AnnotatedBundle<T> {
  const ref = `close-${fixmeCounter()}`;
  return {
    annotation,
    objectMap: {
      main: ref,
      objects: new Map([
        // TODO: Nothing is checking that contract and close match. We need to improve the omit
        [ref, { type: "contract", value: "close" }],
      ]),
    },
  };
}

type WhenAParams<T> = {
  annotation: T;
  when: [Action, AnnotatedBundle<T>][];
  timeout: Timeout;
  timeout_continuation: AnnotatedBundle<T>;
};

function whenA<T>(params: WhenAParams<T>): AnnotatedBundle<T> {
  const timeoutBundle = params.timeout_continuation;
  const timeoutRef = { ref: timeoutBundle.objectMap.main };

  const whenLabel = `when-${fixmeCounter()}`; // FIXME

  const cases = params.when.map(([action, cont]) => {
    return {
      case: action,
      then: { ref: cont.objectMap.main },
    } as Case;
  });
  const casesObjects = params.when.flatMap(
    ([_, cont]) => cont.objectMap.objects
  );

  const labelEqual = {
    equals: (a: Label, b: Label) => a === b,
  };
  const mergeSameObject = {
    // TODO: Give name to the Omit.
    concat: (a: Omit<ObjectType, "label">, b: Omit<ObjectType, "label">) => {
      if (deepEqual(a, b)) return a;
      throw new Error("Can't merge two objecs with different values");
    },
  };
  const objects = [...casesObjects, timeoutBundle.objectMap.objects].reduce(
    (acc, curr) => M.union(labelEqual, mergeSameObject)(acc)(curr),
    new Map([
      [
        whenLabel,
        {
          type: "contract",
          value: {
            when: cases,
            timeout: params.timeout,
            timeout_continuation: timeoutRef,
          },
        },
      ],
    ]) as ContractObjectMap["objects"]
  );

  return {
    annotation: params.annotation,
    objectMap: {
      main: whenLabel,
      objects,
    },
  };
}

type AnnotatedConstructors<T> = {
  when: (params: WhenAParams<T>) => AnnotatedBundle<T>;
  close: (state: T) => AnnotatedBundle<T>;
};

export function mkAnnotatedContract<T>(
  creator: (constructors: AnnotatedConstructors<T>) => AnnotatedBundle<T>
): AnnotatedBundle<T> {
  return creator({
    when: whenA,
    close: closeA,
  });
}
