/**
 * This module offers capabalities for running a Token plan contract, this contract is defined
 * as follows :
 *   1. There are `N` vesting periods.
 *   2. Each vesting period involves `P` tokens.
 *   3. The Provider deposits `N * P` tokens into the contract before the plan starts.
 *   4. At the end of each vesting period, `P` tokens are transferred from the
 *      Provider account to the Claimer account.
 *   5. During each vesting period, the Provider may cancel the contract, receiving
 *      back the *unvested* funds from their account and distributing the *vested* funds
 *      to the claimer.
 *
 *   6. Also during each vesting period, the Claimer may withdraw once any of the funds in
 *      their account. The Provider can still cancel the contract during the vesting period
 *      after the claimer has withdrawn funds during that vesting period.
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
  IChoice,
} from "@marlowe.io/language-core-v1";

import * as O from "fp-ts/lib/Option.js";
import { pipe } from "fp-ts/lib/function.js";
import * as G from "@marlowe.io/language-core-v1/guards";
import { default as LZString } from "lz-string";
import { MarloweJSON } from "@marlowe.io/adapter/codec";
import { lovelace } from "@marlowe.io/language-core-v1/playground-v1";
/**
 * Create The Vesting Marlowe Contract
 * @param request Request For Creating a Vesting Marlowe Contract
 * @category Vesting Contract DSL Generation
 */
export const mkContract = function (request: TokenPlan): Contract {
  const { numberOfPeriods } = request;
  if (numberOfPeriods < 1)
    throw "The number of periods needs to be greater or equal to 1";

  return initialProviderDeposit(request, claimerDepositDistribution(request));
};

/**
 * Request For Creating a Vesting Marlowe Contract
 * @category Token Plan
 */
export type TokenPlan = {
  /**
   * A participant that provides the tokens to be vested
   */
  provider: Party;
  /**
   * The recipient of the tokens
   */
  claimer: Party;
  /**
   * Start of the token plan. The contract needs to be created and the provider needs to
   * deposit the tokens before this date.
   */
  start: Date;
  /**
   * Frequency at which chunks of tokens will be released
   */
  frequency: Frequency;
  /**
   * Number of Periods to release all the tokens
   */
  numberOfPeriods: bigint;
  /**
   * The amount of tokens that are vested each period.
   * @remark Using tokens per period means that we need to calculate the initial deposit as `numberOfPeriods * tokensPerPeriod`.
   *         It would be more natural as a Plan parameter to use an initialDeposit, and calculate the amount vested in each period
   *         as `initialDeposit / numberOfPeriods`, but that can cause rounding errors, so the former is preferred.
   */
  tokensPerPeriod: TokenValue;
};

/**
 * Frequency at which chunks of tokens will be released
 * @category Token Plan
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
  quantities: Quantities;
  withdrawInput?: Input[];
};

/**
 * {@link VestingState:type | Vesting State } where the contract is closed
 * @category Vesting State
 */
export type Closed = {
  name: "Closed";
  closeCondition: CloseCondition;
};

export type CloseCondition =
  | DepositDeadlineCloseCondition
  | CancelledCloseCondition
  | FullyClaimedCloseCondition
  | UnknownCloseCondition;

/**
 * {@link VestingState:type | Vesting Closed State} the contract is closed because the provider didn't provide the deposit
 * before the deadline.
 * @category Vesting State
 */
export type DepositDeadlineCloseCondition = {
  name: "DepositDeadlineCloseCondition";
};

/**
 * {@link VestingState:type | Vesting Closed State} the contract is closed because the provider has cancelled the token plan
 * before the end.
 * @category Vesting State
 */
export type CancelledCloseCondition = {
  name: "CancelledCloseCondition";
  percentageClaimed: bigint;
};

/**
 * {@link VestingState:type | Vesting Closed State} the contract is closed because the claimer has fully withdrawn the tokens from the
 * plan (happy path).
 * @category Vesting State
 */
export type FullyClaimedCloseCondition = { name: "FullyClaimedCloseCondition" };

/**
 * {@link VestingState:type | Vesting Closed State} the contract is closed but in an unexpected manner
 * @category Vesting State
 */
export type UnknownCloseCondition = {
  name: "UnknownCloseCondition";
  inputHistory: Input[];
};

/**
 * The contract is in an unexpected state
 * @category Vesting State
 */
export type UnknownState = {
  name: "UnknownState";
  state: MarloweState;
};

export type Quantities = {
  total: bigint;
  vested: bigint;
  claimed: bigint;
  withdrawable: bigint;
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

const initialProviderDeposit = function (
  plan: TokenPlan,
  continuation: Contract
): Contract {
  const { provider, start, frequency, numberOfPeriods, tokensPerPeriod } = plan;
  if (numberOfPeriods < 1)
    throw "The number of periods needs to be greater or equal to 1";

  // Provider needs to deposit before the first vesting period
  const initialDepositDeadline: Timeout = datetoTimeout(start);
  return {
    when: [
      {
        case: {
          party: provider,
          deposits: tokensPerPeriod.amount * numberOfPeriods,
          of_token: tokensPerPeriod.token,
          into_account: provider,
        },
        then: continuation,
      },
    ],
    timeout: initialDepositDeadline,
    timeout_continuation: close,
  };
};

// Provider needs to deposit before the first vesting period
const claimerDepositDistribution = function (plan: TokenPlan): Contract {
  const {
    claimer,
    provider,
    start,
    frequency,
    numberOfPeriods,
    tokensPerPeriod,
  } = plan;

  const planStartTimeout: Timeout = datetoTimeout(start);

  /**  NOTE: Currently this logic presents the withdrawal and cancel for the last period, even though it doesn't make sense
   *        because there is nothing to cancel, and even if the claimer does a partial withdrawal, they receive the balance in their account.
   */
  const go = function (periodIndex: bigint): Contract {
    const periodInMilliseconds = getPeriodInMilliseconds(frequency);

    const continuation: Contract =
      periodIndex === numberOfPeriods ? close : go(periodIndex + 1n);

    const periodStart = planStartTimeout + periodIndex * periodInMilliseconds;
    const periodEnd = periodStart + periodInMilliseconds;

    // On every period, we allow a claimer to do a withdrawal.
    const claimerWithdrawCase: Case = {
      case: {
        choose_between: [
          {
            from: 1n,
            to: periodIndex * tokensPerPeriod.amount,
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
        token: tokensPerPeriod.token,
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
      timeout: periodStart,
      timeout_continuation: {
        pay: tokensPerPeriod.amount,
        token: tokensPerPeriod.token,
        from_account: provider,
        to: {
          account: claimer,
        },
        then: {
          when:
            periodIndex === numberOfPeriods
              ? [claimerWithdrawCase]
              : [claimerWithdrawCase, providerCancelCase],
          timeout: periodEnd,
          timeout_continuation: continuation,
        },
      },
    };
  };

  return go(1n);
};

function createPlaygroundLink(contract: Contract) {
  const compressed = LZString.compressToEncodedURIComponent(
    MarloweJSON.stringify(contract)
  );
  const link = `http://localhost:8009/#/importContract?marlowe-view=blockly&contract=${compressed}`;
  return link;
}

const testingPlan: TokenPlan = {
  provider: { address: "provider" },
  claimer: { address: "token" },
  start: new Date("2024-11-08T00:00:00.000Z"),
  frequency: "annually",
  numberOfPeriods: 2n,
  tokensPerPeriod: { token: lovelace, amount: 15_000_000n },
};

console.log(createPlaygroundLink(mkContract(testingPlan)));
