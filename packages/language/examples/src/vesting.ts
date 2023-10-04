import {
  Contract,
  Case,
  datetoTimeout,
  timeoutToDate,
  close,
  TokenValue,
  Timeout,
  Party,
  MarloweState,
  Environment,
  mkEnvironment,
  Input,
} from "@marlowe.io/language-core-v1";
import {
  Choice,
  Deposit,
  Next,
  emptyApplicables,
  noNext,
} from "@marlowe.io/language-core-v1/next";
import addMinutes from "date-fns/addMinutes";
import subMinutes from "date-fns/subMinutes";
import * as O from "fp-ts/lib/Option.js";
import { pipe } from "fp-ts/lib/function.js";

/**
 * Vesting Contract Example
 * @description : a Token `Provider` block funds on a Marlowe Contract and allow a Token `Claimer` to retrieve them
 * based on a Vesting Scheme.
 * Cancel Policy :
 * 1) At any Vesting Period, The Token Provider can cancel the vesting schedule, then all the downstream vested period will be canceled too.
 * 2) Once a vested period is claimable by the Claimer, The Provider can't cancel the transaction.
 * @param request Request For Creating a Vesting Marlowe Contract
 */
export const mkContract = function (request: VestingRequest): Contract {
  const {
    scheme: { numberOfPeriods },
  } = request;
  if (numberOfPeriods < 1)
    throw "The number of periods needs to be greater or equal to 1";

  return initialEmployerDeposit(request, employeeDepositDistribution(request));
};

/**
 * Request For Creating a Vesting Marlowe Contract
 */
export type VestingRequest = {
  /**
   * The token and its amount to be vested by the provider
   */
  tokenValue: TokenValue;
  /**
   * The party definition of the Token Provider (Role token or a Cardano Address)
   */
  provider: Party;
  /**
   * The party definition of the Token Claimer (Role token or a Cardano Address)
   */
  claimer: Party;
  /**
   * The vesting scheme definition between Token Claimer & Provider
   */
  scheme: VestingScheme;
};

/**
 * Frequency at which chunks of tokens will be released
 */
export type Frequency =
  | "annually"
  | "half-yearly"
  | "quarterly"
  | "monthly"
  | "daily"
  | "hourly";

/**
 * Vesting Scheme Definition
 */
export type VestingScheme = {
  /**
   * Start of the vesting schedule
   */
  start: Date;
  /**
   * Frequency at which chunks of tokens will be released
   */
  frequency: Frequency;
  /**
   * Number of Periods the Provider wants, to release the totality of the tokens to the claimer.
   */
  numberOfPeriods: bigint;
};

export type State = // Initial Deposit

    | {
        name: "WaitingDepositByProvider";
        initialDepositDeadline: Date;
        depositInput?: Input[];
      }

    // Initial Deposit Failed
    | {
        name: "NoDepositBeforeDeadline";
        initialDepositDeadline: Date;
        payMinUtxoBackInput: Input[];
      }

    // Distribution of Initial Deposit
    | {
        name: "WithinVestingPeriod";
        currentPeriod: bigint;
        periodInterval: [Date, Date];
        amountToWithdraw: bigint;
        cancelInput?: Input[];
        withdrawInput?: Input[];
      }
    // Vesting Last Period has elapsed
    | { name: "VestingEnded"; withdrawInput: Input[] }

    // Closed Contract
    | { name: "Closed" }
    | {
        unknownState: {
          request: VestingRequest;
          state: MarloweState;
          next: Next;
        };
      };

export const getState = async (
  request: VestingRequest,
  stateOpt: O.Option<MarloweState>,
  getNext: (environement: Environment) => Promise<Next>
): Promise<State> => {
  const state = pipe(
    stateOpt,
    O.match(
      () => null,
      (a) => a
    )
  );
  if (state == null) return { name: "Closed" };

  const startTimeout: Timeout = datetoTimeout(new Date(request.scheme.start));
  const periodInMilliseconds: bigint = getPeriodInMilliseconds(
    request.scheme.frequency
  );
  // Employer needs to deposit before the first vesting period
  const initialDepositDeadline: Timeout = startTimeout + periodInMilliseconds;
  const now = datetoTimeout(new Date());
  const currentPeriod: bigint =
    (now - startTimeout) / periodInMilliseconds + 1n;
  const periodInterval: [Date, Date] = [
    timeoutToDate(
      startTimeout + periodInMilliseconds * (currentPeriod - 1n) + 1n
    ),
    timeoutToDate(startTimeout + periodInMilliseconds * currentPeriod - 1n),
  ];

  if (now > initialDepositDeadline && state?.accounts.length === 1)
    return {
      name: "NoDepositBeforeDeadline",
      initialDepositDeadline: timeoutToDate(initialDepositDeadline),
      payMinUtxoBackInput: [],
    };

  const environment = mkEnvironment(periodInterval[0])(periodInterval[1]);
  const next = await getNext(environment);
  if (next.can_reduce && emptyApplicables(next) && state?.accounts.length > 1)
    return { name: "VestingEnded", withdrawInput: [] };

  // Initial Deposit Phase
  if (state?.accounts.length == 1) {
    const depositInput =
      next.applicable_inputs.deposits.length == 1
        ? [Deposit.toInput(next.applicable_inputs.deposits[0])]
        : undefined;
    return {
      name: "WaitingDepositByProvider",
      initialDepositDeadline: timeoutToDate(initialDepositDeadline),
      depositInput: depositInput,
    };
  }
  if (
    next.applicable_inputs.choices.length == 1 &&
    next.applicable_inputs.choices[0].for_choice.choice_name == "cancel"
  )
    return {
      name: "WithinVestingPeriod",
      currentPeriod: currentPeriod,
      periodInterval: periodInterval,
      amountToWithdraw: 0n,
      cancelInput: [Choice.toInput(next.applicable_inputs.choices[0])(1n)],
    };
  if (
    next.applicable_inputs.choices.length == 1 &&
    next.applicable_inputs.choices[0].for_choice.choice_name == "withdraw"
  )
    return {
      name: "WithinVestingPeriod",
      currentPeriod: currentPeriod,
      periodInterval: periodInterval,
      amountToWithdraw:
        next.applicable_inputs.choices[0].can_choose_between[0].to,
      withdrawInput: [
        Choice.toInput(next.applicable_inputs.choices[0])(
          next.applicable_inputs.choices[0].can_choose_between[0].to
        ),
      ],
    };
  if (next.applicable_inputs.choices.length == 2)
    return {
      name: "WithinVestingPeriod",
      currentPeriod: currentPeriod,
      periodInterval: periodInterval,
      amountToWithdraw:
        next.applicable_inputs.choices[0].can_choose_between[0].to,
      cancelInput: [Choice.toInput(next.applicable_inputs.choices[1])(1n)],
      withdrawInput: [
        Choice.toInput(next.applicable_inputs.choices[0])(
          next.applicable_inputs.choices[0].can_choose_between[0].to
        ),
      ],
    };
  return { unknownState: { request: request, state: state, next: next } };
};

const getPeriodInMilliseconds = function (frequency: Frequency): bigint {
  switch (frequency) {
    case "annually":
      return 2n * getPeriodInMilliseconds("half-yearly");
    case "half-yearly":
      return 2n * getPeriodInMilliseconds("quarterly");
    case "quarterly":
      return 3n * getPeriodInMilliseconds("monthly");
    case "monthly":
      return 30n * getPeriodInMilliseconds("daily");
    case "daily":
      return 24n * getPeriodInMilliseconds("hourly");
    case "hourly":
      return 1n * 60n * 60n * 1000n;
  }
};

const initialEmployerDeposit = function (
  request: VestingRequest,
  continuation: Contract
): Contract {
  const {
    tokenValue,
    provider,
    scheme: { start, frequency, numberOfPeriods },
  } = request;
  if (numberOfPeriods < 1)
    throw "The number of periods needs to be greater or equal to 1";

  const startTimeout: Timeout = datetoTimeout(start);
  const periodInMilliseconds: bigint = getPeriodInMilliseconds(frequency);
  // Employer needs to deposit before the first vesting period
  const initialDepositDeadline: Timeout = startTimeout + periodInMilliseconds;
  return {
    when: [
      {
        case: {
          party: provider,
          deposits: tokenValue.amount,
          of_token: tokenValue.token,
          into_account: provider,
        },
        then: continuation,
      },
    ],
    timeout: initialDepositDeadline,
    timeout_continuation: close,
  };
};

const employeeDepositDistribution = function (
  request: VestingRequest
): Contract {
  return recursiveEmployeeDepositDistribution(request, 1n);
};

/**  NOTE: Currently this logic presents the withdrawal and cancel for the last period, even though it doesn't make sense
 *        because there is nothing to cancel, and even if the employee does a partial withdrawal, they receive the balance in their account.
 */
const recursiveEmployeeDepositDistribution = function (
  request: VestingRequest,
  periodIndex: bigint
): Contract {
  const {
    tokenValue,
    claimer,
    provider,
    scheme: { start, frequency, numberOfPeriods },
  } = request;

  const vestingAmountPerPeriod = tokenValue.amount / BigInt(numberOfPeriods);
  const startTimeout: Timeout = datetoTimeout(start);
  // Employer needs to deposit before the first vesting period
  const periodInMilliseconds = getPeriodInMilliseconds(frequency);

  const continuation: Contract =
    periodIndex == numberOfPeriods
      ? close
      : recursiveEmployeeDepositDistribution(request, periodIndex + 1n);
  const vestingDate = startTimeout + periodIndex * periodInMilliseconds;
  const nextVestingDate = vestingDate + periodInMilliseconds;

  // On every period, we allow an employee to do a withdrawal.
  const employeeWithdrawCase: Case = {
    case: {
      choose_between: [
        {
          from: 1n,
          to: periodIndex * vestingAmountPerPeriod,
        },
      ],
      for_choice: {
        choice_name: "withdraw",
        choice_owner: claimer,
      },
    },
    then: {
      pay: {
        value_of_choice: {
          choice_name: "withdraw",
          choice_owner: claimer,
        },
      },
      token: tokenValue.token,
      from_account: claimer,
      to: {
        party: claimer,
      },
      then: continuation,
    },
  };

  const employerCancelCase: Case = {
    case: {
      choose_between: [
        {
          from: 1n,
          to: 1n,
        },
      ],
      for_choice: {
        choice_name: "cancel",
        choice_owner: provider,
      },
    },
    then: close,
  };

  // 1) Wait for the vesting period.
  // 2) Release vested funds
  // 3) Allow the provider to withdraw or to cancel future vesting periods
  return {
    when: [employerCancelCase],
    timeout: vestingDate,
    timeout_continuation: {
      pay: vestingAmountPerPeriod,
      token: tokenValue.token,
      from_account: provider,
      to: {
        account: claimer,
      },
      then: {
        when:
          periodIndex == numberOfPeriods
            ? [employeeWithdrawCase]
            : [employeeWithdrawCase, employerCancelCase],
        timeout: nextVestingDate,
        timeout_continuation: continuation,
      },
    },
  };
};
