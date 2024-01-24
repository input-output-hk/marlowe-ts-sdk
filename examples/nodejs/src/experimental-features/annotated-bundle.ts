import { Bundle, Case, ContractBundle } from "@marlowe.io/marlowe-object";
import { Action, Timeout } from "@marlowe.io/language-core-v1";

export type AnnotatedBundle<T> = {
  bundle: ContractBundle;
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
    bundle: {
      main: ref,
      bundle: [{ label: ref, type: "contract", value: "close" }],
    },
  };
}

type WhenAParams<T> = {
  annotation: T;
  on: [Action, AnnotatedBundle<T>][];
  timeout: Timeout;
  onTimeout: AnnotatedBundle<T>;
};

function whenA<T>(params: WhenAParams<T>): AnnotatedBundle<T> {
  const timeoutBundle = params.onTimeout;
  const timeoutRef = { ref: timeoutBundle.bundle.main };

  const whenLabel = `when-${fixmeCounter()}`; // FIXME

  const cases = params.on.map(([action, cont]) => {
    return {
      case: action,
      then: { ref: cont.bundle.main },
    } as Case;
  });
  const bundles = params.on.flatMap(([_, cont]) => cont.bundle.bundle);

  const whenBundle: Bundle = [
    {
      label: whenLabel,
      type: "contract",
      value: {
        when: cases,
        timeout: params.timeout,
        timeout_continuation: timeoutRef,
      },
    },
  ];

  const bundle = timeoutBundle.bundle.bundle.concat(bundles.concat(whenBundle));

  return {
    annotation: params.annotation,
    bundle: {
      main: whenLabel,
      bundle,
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
