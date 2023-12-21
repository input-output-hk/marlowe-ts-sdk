import {
  MarloweState,
  Party,
  Contract,
  Deposit,
  Choice,
  BuiltinByteString,
  Input,
  ChosenNum,
  Environment,
  Timeout,
  getNextTimeout,
  datetoTimeout,
  Case,
  Action,
  Notify,
} from "@marlowe.io/language-core-v1";
import {
  applyInput,
  ContractQuiescentReduceResult,
  convertReduceWarning,
  Payment,
  reduceContractUntilQuiescent,
  TransactionWarning,
} from "@marlowe.io/language-core-v1/semantics";
import { ContractId } from "@marlowe.io/runtime-core";
import { RestClient } from "@marlowe.io/runtime-rest-client";

type ActionApplicant = Party | "anybody";

interface CanNotify {
  type: "Notify";
  /**
   * Who can make the action
   */
  applicant: "anybody";

  /**
   * If the Case is merkleized, this is the continuation hash
   */
  merkleizedContinuation?: BuiltinByteString;
  /**
   * What is the new state after applying this action and reducing until quiescent
   */
  reducedState: MarloweState;
  /**
   * What is the new contract after applying this action and reducing until quiescent
   */
  reducedContract: Contract;
  /**
   * What warnings were produced while applying this action
   */
  warnings: TransactionWarning[];
  /**
   * What payments were produced while applying this action
   */
  payments: Payment[];

  toInput(): Promise<Input[]>;
}

interface CanDeposit {
  type: "Deposit";

  /**
   * Who can make the action
   */
  applicant: ActionApplicant;
  /**
   * If the Case is merkleized, this is the continuation hash
   */
  merkleizedContinuation?: BuiltinByteString;

  deposit: Deposit;
  /**
   * What is the new state after applying this action and reducing until quiescent
   */
  reducedState: MarloweState;
  /**
   * What is the new contract after applying this action and reducing until quiescent
   */
  reducedContract: Contract;
  /**
   * What warnings were produced while applying this action
   */
  warnings: TransactionWarning[];
  /**
   * What payments were produced while applying this action
   */
  payments: Payment[];

  toInput(): Promise<Input[]>;
}

interface CanChoose {
  type: "Choice";

  /**
   * Who can make the action
   */
  applicant: ActionApplicant;

  /**
   * If the Case is merkleized, this is the continuation hash
   */
  merkleizedContinuation?: BuiltinByteString;

  choice: Choice;
  /**
   * What is the new state after applying this action and reducing until quiescent
   */
  reducedState: MarloweState;
  /**
   * What is the new contract after applying this action and reducing until quiescent
   */
  reducedContract: Contract;
  /**
   * What warnings were produced while applying this action
   */
  warnings: TransactionWarning[];
  /**
   * What payments were produced while applying this action
   */
  payments: Payment[];

  toInput(choice: ChosenNum): Promise<Input[]>;
}

interface CanAdvanceTimeout {
  type: "AdvanceTimeout";

  /**
   * Who can make the action
   */
  applicant: "anybody";

  /**
   * What is the new state after applying this action and reducing until quiescent
   */
  reducedState: MarloweState;
  /**
   * What is the new contract after applying this action and reducing until quiescent
   */
  reducedContract: Contract;
  /**
   * What warnings were produced while applying this action
   */
  warnings: TransactionWarning[];
  /**
   * What payments were produced while applying this action
   */
  payments: Payment[];

  toInput(): Promise<Input[]>;
}

export type ApplicableAction =
  | CanNotify
  | CanDeposit
  | CanChoose
  | CanAdvanceTimeout;

export async function getApplicableActions(
  restClient: RestClient,
  contractId: ContractId,
  environment?: Environment
): Promise<ApplicableAction[]> {
  let applicableActions = [] as ApplicableAction[];
  const contractDetails = await restClient.getContractById(contractId);

  const currentContract =
    contractDetails.currentContract._tag === "None"
      ? contractDetails.initialContract
      : contractDetails.currentContract.value;
  const oneDayFrom = (time: Timeout) => time + 24n * 60n * 60n * 1000n; // in milliseconds
  const now = datetoTimeout(new Date());
  const nextTimeout = getNextTimeout(currentContract, now) ?? oneDayFrom(now);
  const timeInterval = { from: now, to: nextTimeout - 1n };

  const env = environment ?? { timeInterval };
  if (contractDetails.state._tag == "None") throw new Error("State not set");
  const initialReduce = reduceContractUntilQuiescent(
    env,
    contractDetails.state.value,
    currentContract
  );
  if (initialReduce == "TEAmbiguousTimeIntervalError")
    throw new Error("AmbiguousTimeIntervalError");
  if (initialReduce.reduced) {
    applicableActions.push({
      type: "AdvanceTimeout",
      applicant: "anybody",
      reducedState: initialReduce.state,
      reducedContract: initialReduce.continuation,
      warnings: convertReduceWarning(initialReduce.warnings),
      payments: initialReduce.payments,
      async toInput() {
        return [];
      },
    });
  }

  return applicableActions;
}

function getApplicableInputsFromReduction(
  initialReduce: ContractQuiescentReduceResult
) {
  const cont = initialReduce.continuation;
  if (cont == "close") return [];
  if ("when" in cont) {
    // cont.when
  }
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

async function getApplicableActionFromCase(restClient: RestClient, cse: Case) {
  // async function getApplicableActionFromCase(restClient: RestClient, cse: Case): ApplicableAction {
  let cont: Contract;
  if ("merkleized_then" in cse) {
    cont = await restClient.getContractSourceById({
      contractSourceId: cse.merkleized_then,
    });
  } else {
    cont = cse.then;
  }
  // Para armar el input necesito el choice, para los warnings, payments y etc
  // necesito el input, eso significa que tengo que cambiar la firma para que el toInput devuelva el
  // input y los effects
  if (isDepositAction(cse.case)) {
    applyInput(env, state, input, cont);
    // return {
    //   applicant: cse.case.party,
    //   type: "Deposit"

    // }
  } else if (isNotify(cse.case)) {
  } else {
  }

  // if (cse.case)
}
