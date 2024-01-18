import { Bundle, Case, Reference } from "@marlowe.io/marlowe-object";
import {
  Action,
  Choice,
  datetoTimeout,
  Deposit,
  lovelace,
  Notify,
  Party,
  Timeout,
} from "@marlowe.io/language-core-v1";
import { MarloweJSON } from "@marlowe.io/adapter/codec";

type ContractBundle = {
  contract: Reference;
  bundle: Bundle;
};

type NotifyEvent = {
  type: "notify";
  notify: Notify;
};

type ChoiceEvent = {
  type: "choice";
  choice: Choice;
};
type DepositEvent = {
  type: "deposit";
  deposit: Deposit;
};

type TimeoutEvent = {
  type: "timeout";
  timeout: Timeout;
};
type Event = NotifyEvent | ChoiceEvent | DepositEvent | TimeoutEvent;

type StateMachine<T> = {
  continuationBundle: ContractBundle;
  state: T;
  // transition:  (event: Event) => (state: T, machine: StateMachine<T>) => StateMachine<T>
};

type DelayPaymentState =
  | { type: "before-deposit" }
  | { type: "waiting-for-release"; amount: bigint }
  | { type: "closed"; reason: string };

type DelayPaymentParameters = {
  payer: Party;
  payee: Party;
  amount: bigint;
  deposit_timeout: Timeout;
  release_timeout: Timeout;
};

type DelayPaymentSM = StateMachine<DelayPaymentState>;

let globalCounter = 0;
function fixmeCounter() {
  return globalCounter++;
}

function closeSM<T>(state: T): StateMachine<T> {
  const ref = `close-${fixmeCounter()}`;
  return {
    state,
    continuationBundle: {
      contract: { ref },
      bundle: [{ label: ref, type: "contract", value: "close" }],
    },
  };
}

type WhenSMParams<T> = {
  state: T;
  on: [Action, StateMachine<T>][];
  timeout: Timeout;
  onTimeout: StateMachine<T>;
};

function whenSM<T>(params: WhenSMParams<T>): StateMachine<T> {
  const timeoutStateMachine = params.onTimeout;
  const timeoutRef = timeoutStateMachine.continuationBundle.contract;

  const whenLabel = `when-${fixmeCounter()}`; // FIXME

  const cases = params.on.map(([action, cont]) => {
    return {
      case: action,
      then: cont.continuationBundle.contract,
    } as Case;
  });
  const bundles = params.on.flatMap(
    ([_, cont]) => cont.continuationBundle.bundle,
  );

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

  const bundle = timeoutStateMachine.continuationBundle.bundle.concat(
    bundles.concat(whenBundle),
  );

  return {
    state: params.state,
    continuationBundle: {
      contract: { ref: whenLabel },
      bundle,
    },
  };
}

type SMConstructors<T> = {
  when: (params: WhenSMParams<T>) => StateMachine<T>;
  close: (state: T) => StateMachine<T>;
};

function mkSMContract<T>(
  creator: (constructors: SMConstructors<T>) => StateMachine<T>,
): StateMachine<T> {
  return creator({
    when: whenSM,
    close: closeSM,
  });
}

function delayPayment2(input: DelayPaymentParameters): DelayPaymentSM {
  return mkSMContract<DelayPaymentState>(({ when, close }) => {
    const initialDeposit = (cont: DelayPaymentSM) =>
      when({
        state: { type: "before-deposit" },
        on: [
          [
            {
              party: input.payer,
              deposits: input.amount,
              of_token: lovelace,
              into_account: input.payee,
            },
            cont,
          ],
        ],
        timeout: input.deposit_timeout,
        onTimeout: close({
          type: "closed",
          reason: "initial deposit timeout",
        }),
      });
    const waitForRelease = when({
      state: { type: "waiting-for-release", amount: input.amount },
      on: [],
      timeout: input.release_timeout,
      onTimeout: close({
        type: "closed",
        reason: "deposit succesfully payed",
      }),
    });

    return initialDeposit(waitForRelease);
  });
}

function delayPayment(input: DelayPaymentParameters): DelayPaymentSM {
  const initialDeposit = (cont: DelayPaymentSM) =>
    whenSM<DelayPaymentState>({
      state: { type: "before-deposit" },
      on: [
        [
          {
            party: input.payer,
            deposits: input.amount,
            of_token: lovelace,
            into_account: input.payee,
          },
          cont,
        ],
      ],
      timeout: input.deposit_timeout,
      onTimeout: closeSM({ type: "closed", reason: "initial deposit timeout" }),
    });
  const waitForRelease = whenSM<DelayPaymentState>({
    state: { type: "waiting-for-release", amount: input.amount },
    on: [],
    timeout: input.release_timeout,
    onTimeout: closeSM({ type: "closed", reason: "deposit succesfully payed" }),
  });

  return initialDeposit(waitForRelease);
}

const example = delayPayment({
  payer: {
    address:
      "addr_test1qqzejnp7fn6vqs7qnfany8fmpnd7e6eeexfrclun3n7amcwgqvtgteuax0yajw3ljzmu4dtprgr2uvd8xmfaqzx8dvdsmffljy",
  },
  payee: {
    address:
      "addr_test1qqzejnp7fn6vqs7qnfany8fmpnd7e6eeexfrclun3n7amcwgqvtgteuax0yajw3ljzmu4dtprgr2uvd8xmfaqzx8dvdsmffljy",
  },
  amount: 100_000_000n,
  deposit_timeout: datetoTimeout(new Date("2024-01-01")),
  release_timeout: datetoTimeout(new Date("2024-01-02")),
});
console.log(
  MarloweJSON.stringify(
    [
      example.continuationBundle.contract.ref,
      example.continuationBundle.bundle,
    ],
    null,
    2,
  ),
);
