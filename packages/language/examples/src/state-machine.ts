import { Bundle, Case, Reference } from "@marlowe.io/marlowe-object";
import {
  Action,
  Choice,
  Deposit,
  InputContent,
  lovelace,
  Notify,
  Party,
  Timeout,
} from "@marlowe.io/language-core-v1";
import { MarloweJSON } from "@marlowe.io/adapter/codec";
import { type } from "os";
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

const undefSM = null as unknown as DelayPaymentSM;

function closeSM<T>(state: T): StateMachine<T> {
  return {
    state,
    continuationBundle: {
      contract: { ref: "close" },
      bundle: [{ label: "close", type: "contract", value: "close" }],
    },
  };
}

type WhenSMParams<T> = {
  state: T;
  on: [Action, StateMachine<T>][];
  timeout: Timeout;
  onTimeout: (timeout: Timeout) => StateMachine<T>;
};

function whenSM<T>(params: WhenSMParams<T>): StateMachine<T> {
  const timeoutStateMachine = params.onTimeout(params.timeout);
  const timeoutRef = timeoutStateMachine.continuationBundle.contract;

  const whenLabel = "when"; // FIXME

  const cases = params.on.map(([action, cont]) => {
    return {
      case: action,
      then: cont.continuationBundle.contract,
    } as Case;
  });
  const bundles = params.on.flatMap(
    ([_, cont]) => cont.continuationBundle.bundle
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

  const bundle =
    timeoutStateMachine.continuationBundle.bundle.concat(bundles.concat(whenBundle));

  return {
    state: params.state,
    continuationBundle: {
      contract: { ref: whenLabel },
      bundle,
    },
  };
}

function delayPayment(input: DelayPaymentParameters): DelayPaymentSM {


  return whenSM<DelayPaymentState>({
    state: { type: "before-deposit" },
    on: [
      [
        {
          party: input.payer,
          deposits: input.amount,
          of_token: lovelace,
          into_account: input.payee,
        },
        closeSM({ type: "closed", reason: "deposit succesfully payed" }),
      ],
    ],
    timeout: 0n,
    onTimeout: () =>
      closeSM({ type: "closed", reason: "initial deposit timeout" }),
  });
}

const example = delayPayment({
  payer: { address: "addr_test1qqzejnp7fn6vqs7qnfany8fmpnd7e6eeexfrclun3n7amcwgqvtgteuax0yajw3ljzmu4dtprgr2uvd8xmfaqzx8dvdsmffljy" },
  payee: { address: "addr_test1qqzejnp7fn6vqs7qnfany8fmpnd7e6eeexfrclun3n7amcwgqvtgteuax0yajw3ljzmu4dtprgr2uvd8xmfaqzx8dvdsmffljy" },
  amount: 100_000_000n,
  deposit_timeout: 1733889316000n,
  release_timeout: 1733889316000n,
});
console.log(MarloweJSON.stringify(example.continuationBundle, null, 2));
