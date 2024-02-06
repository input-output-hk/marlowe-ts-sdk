/**
This is an experimental module that aims to replace the current `next` features.
TODO: After PR-8891 and as part of PLT-9054 move these to the runtime-lifecycle package
      and create a github discussion to modify the backend.
 */

import {
  MarloweState,
  Party,
  Contract,
  Deposit,
  Choice,
  Input,
  ChosenNum,
  Environment,
  Timeout,
  getNextTimeout,
  datetoTimeout,
  Case,
  Action,
  Notify,
  InputContent,
  RoleName,
  Token,
  Bound,
} from "@marlowe.io/language-core-v1";
import {
  applyAllInputs,
  convertReduceWarning,
  evalObservation,
  evalValue,
  inBounds,
  Payment,
  reduceContractUntilQuiescent,
  TransactionWarning,
} from "@marlowe.io/language-core-v1/semantics";
import { AddressBech32, ContractId, PolicyId } from "@marlowe.io/runtime-core";
import { RestClient } from "@marlowe.io/runtime-rest-client";
import { WalletAPI } from "@marlowe.io/wallet";
import * as Big from "@marlowe.io/adapter/bigint";
import { Monoid } from "fp-ts/lib/Monoid.js";
import * as R from "fp-ts/lib/Record.js";
import { ContractDetails } from "../../../../packages/runtime/client/rest/dist/esm/contract/details.js";

type ActionApplicant = Party | "anybody";

export interface AppliedActionResult {
  /**
   * What inputs needs to be provided to apply the action
   */
  inputs: Input[];

  /**
   * What is the environment to apply the inputs
   */
  environment: Environment;
  /**
   * What is the new state after applying an action and reducing until quiescent
   */
  reducedState: MarloweState;
  /**
   * What is the new contract after applying an action and reducing until quiescent
   */
  reducedContract: Contract;
  /**
   * What warnings were produced while applying an action
   */
  warnings: TransactionWarning[];
  /**
   * What payments were produced while applying an action
   */
  payments: Payment[];
}

interface CanNotify {
  type: "Notify";
  policyId: PolicyId;
  applyAction(): AppliedActionResult;
}

interface CanDeposit {
  type: "Deposit";
  policyId: PolicyId;
  deposit: Deposit;

  applyAction(): AppliedActionResult;
}

interface CanChoose {
  type: "Choice";
  policyId: PolicyId;
  choice: Choice;

  applyAction(choice: ChosenNum): AppliedActionResult;
}

/**
 * This Applicable action is intended to be used when the contract is not in a quiescent state.
 * This means that the contract is either timed out, or it was just created and it doesn't starts with a `When`
 */
interface CanAdvance {
  type: "Advance";
  policyId: PolicyId;
  applyAction(): AppliedActionResult;
}

export type ApplicableAction = CanNotify | CanDeposit | CanChoose | CanAdvance;

function getApplicant(action: ApplicableAction): ActionApplicant {
  switch (action.type) {
    case "Notify":
    case "Advance":
      return "anybody";
    case "Deposit":
      return action.deposit.party;
    case "Choice":
      return action.choice.for_choice.choice_owner;
  }
}

/**
 * Computes a "safe" environment for the contract.
 */
async function computeEnvironment(
  restClient: RestClient,
  currentContract: Contract
): Promise<Environment> {
  const oneDayFrom = (time: Timeout) => time + 24n * 60n * 60n * 1000n; // in milliseconds
  // For the lower, bound we use the tip of the runtime chain.
  // If we used new Date(), the runtime can complain that the lower bound is too high
  // because it is ahead of the time that it knows.
  const status = await restClient.healthcheck();
  const lowerBound = datetoTimeout(
    new Date(status.tips.runtimeChain.slotTimeUTC)
  );

  // For the upper bound, we use the next timeout if available or one day from the lower bound.
  // IMPORTANT NOTE: With this code, if the upper bound is far into the future, and this interval
  //                 is used when applying an input, you can end up with a Slot conversion error.
  //                 This is because the ledger can change the slot length at particular times
  //                 so the runtime cannot predict what is the exact slot.
  //                 The safe way to solve this is to get the network parameters from the runtime
  //                 and instead of doing oneDayFrom, do the max safe conversion.
  const upperBound =
    getNextTimeout(currentContract, lowerBound) ?? oneDayFrom(lowerBound);

  return { timeInterval: { from: lowerBound, to: upperBound - 1n } };
}

export async function getApplicableActions(
  restClient: RestClient,
  contractId: ContractId,
  environment?: Environment
): Promise<ApplicableAction[]> {
  const contractDetails = await restClient.getContractById({ contractId });
  // If the contract is closed there are no applicable actions
  if (
    typeof contractDetails.state === "undefined" ||
    typeof contractDetails.currentContract === "undefined"
  ) {
    return [];
  }

  const env =
    environment ??
    (await computeEnvironment(restClient, contractDetails.currentContract));

  const initialReduce = reduceContractUntilQuiescent(
    env,
    contractDetails.state,
    contractDetails.currentContract
  );
  if (initialReduce == "TEAmbiguousTimeIntervalError")
    throw new Error("AmbiguousTimeIntervalError");

  const applicableActions: ApplicableAction[] = initialReduce.reduced
    ? [
        {
          type: "Advance",
          policyId: contractDetails.roleTokenMintingPolicyId,
          applyAction() {
            return {
              inputs: [],
              environment: env,
              reducedState: initialReduce.state,
              reducedContract: initialReduce.continuation,
              warnings: convertReduceWarning(initialReduce.warnings),
              payments: initialReduce.payments,
            };
          },
        },
      ]
    : [];
  const cont = initialReduce.continuation;
  if (typeof cont === "object" && "when" in cont) {
    const applicableActionsFromCases = await Promise.all(
      cont.when.map((aCase) =>
        getApplicableActionFromCase(
          restClient,
          env,
          initialReduce.continuation,
          initialReduce.state,
          initialReduce.payments,
          convertReduceWarning(initialReduce.warnings),
          aCase,
          contractDetails.roleTokenMintingPolicyId
        )
      )
    );
    return applicableActions.concat(
      toApplicableActions(
        applicableActionsFromCases.reduce(
          mergeApplicableActionAccumulator.concat,
          mergeApplicableActionAccumulator.empty
        )
      )
    );
  }
  return applicableActions;
}

export async function mkPartyFilter(wallet: WalletAPI) {
  const address = await wallet.getUsedAddresses();
  const tokens = await wallet.getTokens();
  let tokenMap = new Map<PolicyId, RoleName[]>();
  function getTokenMap() {
    if (tokenMap.size === 0 && tokens.length > 0) {
      tokens.forEach((token) => {
        // Role tokens only have 1 element
        if (token.quantity > 1) return;

        const currentTokens = tokenMap.get(token.assetId.policyId) ?? [];
        currentTokens.push(token.assetId.assetName);
        tokenMap.set(token.assetId.policyId, currentTokens);
      });
    }
    return tokenMap;
  }

  return (party: Party, policyId: PolicyId) => {
    if ("role_token" in party) {
      const policyTokens = getTokenMap().get(policyId);
      if (policyTokens === undefined) return false;
      return policyTokens.includes(party.role_token);
    } else {
      return address.includes(party.address as AddressBech32);
    }
  };
}

export async function mkApplicableActionsFilter(wallet: WalletAPI) {
  const partyFilter = await mkPartyFilter(wallet);
  return (action: ApplicableAction) => {
    const applicant = getApplicant(action);
    if (applicant === "anybody") return true;
    return partyFilter(applicant, action.policyId);
  };
}

function isDepositAction(action: Action): action is Deposit {
  return "party" in action;
}

function isNotify(action: Action): action is Notify {
  return "notify_if" in action;
}

function isChoice(action: Action): action is Choice {
  return "choose_between" in action;
}

/**
 * Internal data structure to be able to accumulate and later flatter applicable actions
 * @hidden
 */
type ApplicableActionAccumulator = {
  deposits: Record<string, CanDeposit>;
  choices: Record<string, CanChoose>;
  notifies: CanNotify | undefined;
};

const toApplicableActions = (
  accumulator: ApplicableActionAccumulator
): ApplicableAction[] => {
  const deposits = Object.values(accumulator.deposits);
  const choices = Object.values(accumulator.choices);
  const notifies = accumulator.notifies ? [accumulator.notifies] : [];
  return [...deposits, ...choices, ...notifies];
};

const flattenDeposits = {
  concat: (fst: CanDeposit, snd: CanDeposit) => {
    return fst;
  },
};

const partyKey = (party: Party) => {
  if ("role_token" in party) {
    return `role_${party.role_token}`;
  } else {
    return `address_${party.address}`;
  }
};

const tokenKey = (token: Token) => {
  return `${token.currency_symbol}-${token.token_name}`;
};
const accumulatorFromDeposit = (
  env: Environment,
  state: MarloweState,
  action: CanDeposit
) => {
  const { party, into_account, of_token, deposits } = action.deposit;
  const value = evalValue(env, state, deposits);

  const depositKey = `${partyKey(party)}-${partyKey(into_account)}-${tokenKey(
    of_token
  )}-${value}`;
  return {
    deposits: { [depositKey]: action },
    choices: {},
    notifies: undefined,
  };
};

const accumulatorFromChoice = (action: CanChoose) => {
  const { for_choice } = action.choice;
  const choiceKey = `${partyKey(for_choice.choice_owner)}-${
    for_choice.choice_name
  }`;
  return {
    deposits: {},
    choices: { [choiceKey]: action },
    notifies: undefined,
  };
};

const accumulatorFromNotify = (action: CanNotify) => {
  return {
    deposits: {},
    choices: {},
    notifies: action,
  };
};

function mergeBounds(bounds: Bound[]): Bound[] {
  const mergedBounds: Bound[] = [];

  const sortedBounds = [...bounds].sort((a, b) =>
    a.from > b.from ? 1 : a.from < b.from ? -1 : 0
  );

  let currentBound: Bound | null = null;

  for (const bound of sortedBounds) {
    if (currentBound === null) {
      currentBound = { ...bound };
    } else {
      if (bound.from <= currentBound.to) {
        currentBound.to = Big.max(currentBound.to, bound.to);
      } else {
        mergedBounds.push(currentBound);
        currentBound = { ...bound };
      }
    }
  }

  if (currentBound !== null) {
    mergedBounds.push(currentBound);
  }

  return mergedBounds;
}

const flattenChoices = {
  concat: (fst: CanChoose, snd: CanChoose): CanChoose => {
    const mergedBounds = mergeBounds(
      fst.choice.choose_between.concat(snd.choice.choose_between)
    );
    return {
      type: "Choice",
      policyId: fst.policyId,
      choice: {
        for_choice: fst.choice.for_choice,
        choose_between: mergedBounds,
      },
      applyAction: (chosenNum: ChosenNum) => {
        if (inBounds(chosenNum, fst.choice.choose_between)) {
          return fst.applyAction(chosenNum);
        } else {
          return snd.applyAction(chosenNum);
        }
      },
    };
  },
};

const mergeApplicableActionAccumulator: Monoid<ApplicableActionAccumulator> = {
  empty: {
    deposits: {},
    choices: {},
    notifies: undefined,
  },
  concat: (fst, snd) => {
    return {
      deposits: R.union(flattenDeposits)(fst.deposits)(snd.deposits),
      choices: R.union(flattenChoices)(fst.choices)(snd.choices),
      notifies: fst.notifies ?? snd.notifies,
    };
  },
};

async function getApplicableActionFromCase(
  restClient: RestClient,
  env: Environment,
  currentContract: Contract,
  state: MarloweState,
  previousPayments: Payment[],
  previousWarnings: TransactionWarning[],
  aCase: Case,
  policyId: PolicyId
): Promise<ApplicableActionAccumulator> {
  let aCaseContinuation: Contract;
  if ("merkleized_then" in aCase) {
    aCaseContinuation = await restClient.getContractSourceById({
      contractSourceId: aCase.merkleized_then,
    });
  } else {
    aCaseContinuation = aCase.then;
  }
  function decorateInput(content: InputContent): Input {
    if ("merkleized_then" in aCase) {
      const merkleizedHashAndContinuation = {
        continuation_hash: aCase.merkleized_then,
        merkleized_continuation: aCaseContinuation,
      };
      // MerkleizedNotify are serialized as the plain merkle object
      if (content === "input_notify") {
        return merkleizedHashAndContinuation;
      } else {
        // For IDeposit and IChoice is the InputContent + the merkle object
        return {
          ...merkleizedHashAndContinuation,
          ...content,
        };
      }
    } else {
      return content;
    }
  }

  if (isDepositAction(aCase.case)) {
    const deposit = aCase.case;
    return accumulatorFromDeposit(env, state, {
      type: "Deposit",
      deposit,
      policyId,
      applyAction() {
        const input = decorateInput({
          input_from_party: deposit.party,
          that_deposits: evalValue(env, state, deposit.deposits),
          of_token: deposit.of_token,
          into_account: deposit.into_account,
        });
        // TODO: Re-check if this env should be the same as the initial env or a new one.
        const appliedInput = applyAllInputs(env, state, currentContract, [
          input,
        ]);

        // TODO: Improve error handling
        if (typeof appliedInput === "string") throw new Error(appliedInput);
        return {
          inputs: [input],
          environment: env,
          reducedState: appliedInput.state,
          reducedContract: appliedInput.continuation,
          warnings: [...previousWarnings, ...appliedInput.warnings],
          payments: [...previousPayments, ...appliedInput.payments],
        };
      },
    });
  } else if (isChoice(aCase.case)) {
    const choice = aCase.case;

    return accumulatorFromChoice({
      type: "Choice",
      choice,
      policyId,
      applyAction(chosenNum: ChosenNum) {
        if (!inBounds(chosenNum, choice.choose_between)) {
          throw new Error("Chosen number is not in bounds");
        }
        const input = decorateInput({
          for_choice_id: choice.for_choice,
          input_that_chooses_num: chosenNum,
        });
        // TODO: Re-check if this env should be the same as the initial env or a new one.
        const appliedInput = applyAllInputs(env, state, currentContract, [
          input,
        ]);
        // TODO: Improve error handling
        if (typeof appliedInput === "string") throw new Error(appliedInput);
        return {
          inputs: [input],
          environment: env,
          reducedState: appliedInput.state,
          reducedContract: appliedInput.continuation,
          warnings: [...previousWarnings, ...appliedInput.warnings],
          payments: [...previousPayments, ...appliedInput.payments],
        };
      },
    });
  } else {
    const notify = aCase.case;
    if (!evalObservation(env, state, notify.notify_if)) {
      return mergeApplicableActionAccumulator.empty;
    }

    return accumulatorFromNotify({
      type: "Notify",
      policyId,
      applyAction() {
        const input = decorateInput("input_notify");
        // TODO: Re-check if this env should be the same as the initial env or a new one.
        const appliedInput = applyAllInputs(env, state, currentContract, [
          input,
        ]);
        // TODO: Improve error handling
        if (typeof appliedInput === "string") throw new Error(appliedInput);
        return {
          inputs: [input],
          environment: env,
          reducedState: appliedInput.state,
          reducedContract: appliedInput.continuation,
          warnings: [...previousWarnings, ...appliedInput.warnings],
          payments: [...previousPayments, ...appliedInput.payments],
        };
      },
    });
  }
}
