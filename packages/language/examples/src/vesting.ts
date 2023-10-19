/**
 * This module offers capabalities for running a Vesting contract, this contract is defined
 * as follows :
 *
 * The vesting contract is defined as follows:
 *   1. There are `N` vesting periods.
 *   2. Each vesting period involves `P` tokens.
 *   3. The Provider initially deposits `N * P` tokens into the contract.
 *   4. At the end of each vesting period, `P` tokens are transferred from the
 *      emProviderloyer account to the Claimer account.
 *   5. During each vesting period, the Provider may cancel the contract, receiving
 *      back the *unvested* funds from their account and distributing the *vested* funds
 *      to the employee.
 *
 *   6. Also during each vesting period, the Claimer may withdraw once any of the funds in
 *      their account. The Provider can still cancel the contract during the vesting period
 *      after the employee has withdrawn funds during that vesting period.
 *
 *   7. When the contract's ultimate timeout is reached, vested and unvested funds are
 *      distributed to the Claimer and Provider, respectively.
 *
 *   8. The Provider may cancel the contract during the first vesting period.
 *   9. The Provider may not cancel the contract after all funds have been vested.
 * @packageDocumentation
 */

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
} from "@marlowe.io/language-core-v1/next";
import * as O from "fp-ts/lib/Option.js";
import { pipe } from "fp-ts/lib/function.js";

/**
 * Create The Vesting Marlowe Contract
 * @param request Request For Creating a Vesting Marlowe Contract
 * @category Vesting Contract DSL Generation
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
 * @category Vesting Request
 */
export type VestingRequest = {
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
 * @category Vesting Request
 */
export type Frequency =
  | "annually"
  | "half-yearly"
  | "quarterly"
  | "monthly"
  | "weekly"
  | "daily"
  | "hourly"
  | "by-10-minutes";

/**
 * Vesting Scheme Definition
 * @category Vesting Request
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
  /**
   * The token and its amount to be vested by the provider
   */
  expectedInitialDeposit: TokenValue;
};

/**
 * Vesting Contract State
 * @category Vesting State
 */
export type VestingState =
  | WaitingDepositByProvider
  | NoDepositBeforeDeadline
  | WithinVestingPeriod
  | VestingEnded
  | Closed
  | UnknownState;

/**
 * `WaitingDepositByProvider` State :
 * The contract has been created. But no inputs has been applied yet.
 * Inputs are predefined, as a user of this contract, you don't need to create these inputs yourself.
 * You can provide this input directly to `applyInputs` on the `ContractLifeCycleAPI` :
 * 1. `depositInput` is availaible if the connected wallet is the Provider.
 * @category Vesting State
 */
export type WaitingDepositByProvider = {
  name: "WaitingDepositByProvider";
  scheme: VestingScheme;
  initialDepositDeadline: Date;
  depositInput?: Input[];
};

/**
 * {@link VestingState:type | Vesting State} where the Initial Deposit deadline has passed.
 * It supposed to be given by the Provider and is a prerequesite to
 * continue the contract logic.
 * @category Vesting State
 */
export type NoDepositBeforeDeadline = {
  name: "NoDepositBeforeDeadline";
  scheme: VestingScheme;
  initialDepositDeadline: Date;
  payMinUtxoBackInput: Input[];
};

/**
 * {@link VestingState:type | Vesting State} where the contract in within a vesting period `currentPeriod`
 * Inputs are predefined, as a user of this contract, you don't need to create these inputs yourself.
 * You can provide this input directly to `applyInputs` on the `ContractLifeCycleAPI` :
 * 1. `cancelInput` is availaible if the connected wallet is the Provider.
 * 2. `withdrawInput` is availaible if the connected wallet is the Claimer.
 * @category Vesting State
 */
export type WithinVestingPeriod = {
  name: "WithinVestingPeriod";
  scheme: VestingScheme;
  currentPeriod: bigint;
  periodInterval: [Date, Date];
  quantities: Quantities;
  cancelInput?: Input[];
  withdrawInput?: Input[];
};

/**
 * {@link VestingState:type | Vesting State} where the contract has passed all its vesting periods
 * Inputs are predefined, as a user of this contract, you don't need to create these inputs yourself.
 * You can provide this input directly to `applyInputs` on the `ContractLifeCycleAPI` :
 *  - `withdrawInput` is availaible if the connected wallet is the Claimer.
 * @category Vesting State
 */
export type VestingEnded = {
  name: "VestingEnded";
  scheme: VestingScheme;
  quantities: Quantities;
  withdrawInput?: Input[];
};

/**
 * {@link VestingState:type | Vesting State} where the contract is closed
 * @category Vesting State
 */
export type Closed = { name: "Closed"; scheme: VestingScheme };

/**
 * The contract is in an unexpected state
 * @category Vesting State
 */
export type UnknownState = {
  name: "UnknownState";
  scheme: VestingScheme;
  state: MarloweState;
  next: Next;
};

export type Quantities = {
  total: bigint;
  vested: bigint;
  claimed: bigint;
  withdrawable: bigint;
};

/**
 * Provide the State in which a vesting contract is.
 * @category Vesting State
 */
export const getVestingState = async (
  scheme: VestingScheme,
  stateOpt: O.Option<MarloweState>,
  getNext: (environement: Environment) => Promise<Next>
): Promise<VestingState> => {
  const state = pipe(
    stateOpt,
    O.match(
      () => null,
      (a) => a
    )
  );
  if (state == null) return { name: "Closed", scheme: scheme };

  const startTimeout: Timeout = datetoTimeout(new Date(scheme.start));
  const periodInMilliseconds: bigint = getPeriodInMilliseconds(
    scheme.frequency
  );
  // Employer needs to deposit before the first vesting period
  const initialDepositDeadline: Timeout = startTimeout + periodInMilliseconds;
  const now = datetoTimeout(new Date());
  const currentPeriod: bigint = (now - startTimeout) / periodInMilliseconds;
  const periodInterval: [Date, Date] = [
    timeoutToDate(startTimeout + periodInMilliseconds * currentPeriod + 1n),
    timeoutToDate(
      startTimeout + periodInMilliseconds * (currentPeriod + 1n) - 1n
    ),
  ];
  const vestingAmountPerPeriod =
    scheme.expectedInitialDeposit.amount / BigInt(scheme.numberOfPeriods);
  const vested = currentPeriod * vestingAmountPerPeriod;

  const claimed = state.choices
    .filter((a) => a[0].choice_name === "withdraw")
    .map((a) => a[1])
    .reduce((sum, current) => sum + current, 0n);
  const quantities: Quantities = {
    total: scheme.expectedInitialDeposit.amount,
    vested: vested,
    claimed: claimed,
    withdrawable: vested - claimed,
  };

  const environment = mkEnvironment(periodInterval[0])(periodInterval[1]);
  const next = await getNext(environment);

  if (
    // Passed the deadline, can reduce , deposit == min utxo
    now > initialDepositDeadline &&
    next.can_reduce &&
    emptyApplicables(next) &&
    state?.accounts.length === 1 &&
    state?.accounts[0][1] <= 3_000_000 // min utxo
  )
    return {
      name: "NoDepositBeforeDeadline",
      scheme: scheme,
      initialDepositDeadline: timeoutToDate(initialDepositDeadline),
      payMinUtxoBackInput: [],
    };

  if (
    // can reduce, periods have passed.
    next.can_reduce &&
    emptyApplicables(next) &&
    currentPeriod >= scheme.numberOfPeriods
  )
    return {
      name: "VestingEnded",
      quantities: {
        total: scheme.expectedInitialDeposit.amount,
        vested: scheme.expectedInitialDeposit.amount,
        claimed: claimed,
        withdrawable: scheme.expectedInitialDeposit.amount - claimed,
      },
      scheme: scheme,
      withdrawInput: [],
    };

  // Initial Deposit Phase
  if (
    // before deposit deadline or 1 period and deposit < initial deposit
    state?.accounts.length == 1 &&
    now < initialDepositDeadline &&
    state?.accounts[0][1] <= scheme.expectedInitialDeposit.amount
  ) {
    const depositInput =
      next.applicable_inputs.deposits.length == 1
        ? [Deposit.toInput(next.applicable_inputs.deposits[0])]
        : undefined;
    return {
      name: "WaitingDepositByProvider",
      scheme: scheme,
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
      scheme: scheme,
      currentPeriod: currentPeriod,
      periodInterval: periodInterval,
      quantities: quantities,
      cancelInput: [Choice.toInput(next.applicable_inputs.choices[0])(1n)],
    };
  if (
    next.applicable_inputs.choices.length == 1 &&
    next.applicable_inputs.choices[0].for_choice.choice_name == "withdraw"
  )
    return {
      name: "WithinVestingPeriod",
      scheme: scheme,
      currentPeriod: currentPeriod,
      periodInterval: periodInterval,
      quantities,
      withdrawInput: [
        Choice.toInput(next.applicable_inputs.choices[0])(
          quantities.withdrawable
        ),
      ],
    };
  if (next.applicable_inputs.choices.length == 2)
    return {
      name: "WithinVestingPeriod",
      scheme: scheme,
      currentPeriod: currentPeriod,
      periodInterval: periodInterval,
      quantities: quantities,
      cancelInput: [Choice.toInput(next.applicable_inputs.choices[1])(1n)],
      withdrawInput: [
        Choice.toInput(next.applicable_inputs.choices[0])(
          quantities.withdrawable
        ),
      ],
    };
  return { name: "UnknownState", scheme: scheme, state: state, next: next };
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
    case "weekly":
      return 7n * getPeriodInMilliseconds("daily");
    case "daily":
      return 24n * getPeriodInMilliseconds("hourly");
    case "hourly":
      return 1n * 60n * 60n * 1000n;
    case "by-10-minutes":
      return 10n * 60n * 1000n;
  }
};

const initialEmployerDeposit = function (
  request: VestingRequest,
  continuation: Contract
): Contract {
  const {
    provider,
    scheme: { start, frequency, numberOfPeriods, expectedInitialDeposit },
  } = request;
  if (numberOfPeriods < 1)
    throw "The number of periods needs to be greater or equal to 1";

  const startTimeout: Timeout = datetoTimeout(start);
  const periodInMilliseconds: bigint = getPeriodInMilliseconds(frequency);
  // Provider needs to deposit before the first vesting period
  const initialDepositDeadline: Timeout = startTimeout + periodInMilliseconds;
  return {
    when: [
      {
        case: {
          party: provider,
          deposits: expectedInitialDeposit.amount,
          of_token: expectedInitialDeposit.token,
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
  return recursiveClaimerDepositDistribution(request, 1n);
};

/**  NOTE: Currently this logic presents the withdrawal and cancel for the last period, even though it doesn't make sense
 *        because there is nothing to cancel, and even if the employee does a partial withdrawal, they receive the balance in their account.
 */
const recursiveClaimerDepositDistribution = function (
  request: VestingRequest,
  periodIndex: bigint
): Contract {
  const {
    claimer,
    provider,
    scheme: { start, frequency, numberOfPeriods, expectedInitialDeposit },
  } = request;

  const vestingAmountPerPeriod =
    expectedInitialDeposit.amount / BigInt(numberOfPeriods);
  const startTimeout: Timeout = datetoTimeout(start);
  // Employer needs to deposit before the first vesting period
  const periodInMilliseconds = getPeriodInMilliseconds(frequency);

  const continuation: Contract =
    periodIndex === numberOfPeriods
      ? close
      : recursiveClaimerDepositDistribution(request, periodIndex + 1n);

  const vestingDate = startTimeout + periodIndex * periodInMilliseconds;
  const nextVestingDate = vestingDate + periodInMilliseconds;

  // On every period, we allow a claimer to do a withdrawal.
  const claimerWithdrawCase: Case = {
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
      token: expectedInitialDeposit.token,
      from_account: claimer,
      to: {
        party: claimer,
      },
      then: continuation,
    },
  };

  const providerCancelCase: Case = {
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
    when: [providerCancelCase],
    timeout: vestingDate,
    timeout_continuation: {
      pay: vestingAmountPerPeriod,
      token: expectedInitialDeposit.token,
      from_account: provider,
      to: {
        account: claimer,
      },
      then: {
        when:
          periodIndex === numberOfPeriods
            ? [claimerWithdrawCase]
            : [claimerWithdrawCase, providerCancelCase],
        timeout: nextVestingDate,
        timeout_continuation: continuation,
      },
    },
  };
};
