import {
  Bundle,
  Case,
  ContractBundle,
  Reference,
} from "@marlowe.io/marlowe-object";
import {
  Action,
  Address,
  Choice,
  datetoTimeout,
  Deposit,
  lovelace,
  Notify,
  Party,
  Timeout,
} from "@marlowe.io/language-core-v1";
import { MarloweJSON } from "@marlowe.io/adapter/codec";
import { SingleInputTx } from "@marlowe.io/language-core-v1/semantics";

//********************************************************************************
//********************************************************************************
//********************************************************************************
//********************************************************************************
//********************************************************************************
//********************************************************************************

// #region Delay Payment State
/**
 * The delay payment contract can be in one of the following logical states:
 */
type DelayPaymentState =
  | InitialState
  | PaymentDeposited
  | PaymentMissed
  | PaymentReady
  | Closed;
/**
 * In the initial state the contract is waiting for the payment to be deposited
 */
type InitialState = {
  type: "InitialState";
};

/**
 * After the payment is deposited, the contract is waiting for the payment to be released
 */
type PaymentDeposited = {
  type: "PaymentDeposited";
};

/**
 * If the payment is not deposited by the deadline, the contract can be closed.
 * NOTE: It is not necesary to close the contract, as it will consume transaction fee (but it will release
 *       the minUTXO)
 */
type PaymentMissed = {
  type: "PaymentMissed";
};

/**
 * After the release deadline, the payment is still in the contract, and it is ready to be released.
 */
type PaymentReady = {
  type: "PaymentReady";
};

type Closed = {
  type: "Closed";
  result: "Missed deposit" | "Payment released";
};

type DelayPaymentAnnotations =
  | "initialDeposit"
  | "WaitForRelease"
  | "PaymentMissedClose"
  | "PaymentReleasedClose";

function printState(state: DelayPaymentState, scheme: DelayPaymentScheme) {
  switch (state.type) {
    case "InitialState":
      console.log(
        `Waiting ${scheme.payFrom.address} to deposit ${scheme.amount}`
      );
      break;
    case "PaymentDeposited":
      console.log(
        `Payment deposited, waiting until ${scheme.releaseDeadline} to be able to release the payment`
      );
      break;
    case "PaymentMissed":
      console.log(
        `Payment missed on ${scheme.depositDeadline}, contract can be closed to retrieve minUTXO`
      );
      break;
    case "PaymentReady":
      console.log(`Payment ready to be released`);
      break;
    case "Closed":
      console.log(`Contract closed: ${state.result}`);
      break;
  }
}

function getState(
  scheme: DelayPaymentScheme,
  currentTime: Date,
  history: SingleInputTx[]
): DelayPaymentState {
  if (history.length === 0) {
    if (currentTime < scheme.depositDeadline) {
      return { type: "InitialState" };
    } else {
      return { type: "PaymentMissed" };
    }
  } else if (history.length === 1) {
    // If the first transaction doesn't have an input, it means it was used to advace a timeouted contract
    if (!history[0].input) {
      return { type: "Closed", result: "Missed deposit" };
    }
    if (currentTime < scheme.releaseDeadline) {
      return { type: "PaymentDeposited" };
    } else {
      return { type: "PaymentReady" };
    }
  } else if (history.length === 2) {
    return { type: "Closed", result: "Payment released" };
  } else {
    throw new Error("Wrong state/contract, too many transactions");
  }
}

// #endregion
/**
 * These are the parameters of the contract
 */
interface DelayPaymentScheme {
  /**
   * Who is making the delayed payment
   */
  payFrom: Address;
  /**
   * Who is receiving the payment
   */
  payTo: Address;
  /**
   * The amount of lovelaces to be paid
   */
  amount: bigint;
  /**
   * The deadline for the payment to be made. If the payment is not made by this date, the contract can be closed
   */
  depositDeadline: Date;
  /**
   * A date after the payment can be released to the receiver.
   * NOTE: An empty transaction must be done to close the contract
   */
  releaseDeadline: Date;
}

function delayPayment(
  input: DelayPaymentScheme
): AnnotatedBundle<DelayPaymentAnnotations> {
  return mkAnnotatedContract<DelayPaymentAnnotations>(({ when, close }) => {
    const initialDeposit = (cont: AnnotatedBundle<DelayPaymentAnnotations>) =>
      when({
        annotation: "initialDeposit",
        on: [
          [
            {
              party: input.payFrom,
              deposits: input.amount,
              of_token: lovelace,
              into_account: input.payTo,
            },
            cont,
          ],
        ],
        timeout: datetoTimeout(input.depositDeadline),
        onTimeout: close("PaymentMissedClose"),
      });
    const waitForRelease = when({
      annotation: "WaitForRelease",
      on: [],
      timeout: datetoTimeout(input.releaseDeadline),
      onTimeout: close("PaymentReleasedClose"),
    });

    return initialDeposit(waitForRelease);
  });
}

const example = delayPayment({
  payFrom: {
    address:
      "addr_test1qqzejnp7fn6vqs7qnfany8fmpnd7e6eeexfrclun3n7amcwgqvtgteuax0yajw3ljzmu4dtprgr2uvd8xmfaqzx8dvdsmffljy",
  },
  payTo: {
    address:
      "addr_test1qqzejnp7fn6vqs7qnfany8fmpnd7e6eeexfrclun3n7amcwgqvtgteuax0yajw3ljzmu4dtprgr2uvd8xmfaqzx8dvdsmffljy",
  },
  amount: 100_000_000n,
  depositDeadline: new Date("2024-01-01"),
  releaseDeadline: new Date("2024-01-02"),
});

console.log(
  MarloweJSON.stringify([example.bundle.main, example.bundle.bundle], null, 2)
);
