/**
  * This module offers {@link !io-ts-usage | dynamic type guards} for the for the JSON schema of marlowe-objects.
  ```
  import * as G from "@marlowe/marlowe-objects/guards"
  import { isValidBundle } from "@marlowe/marlowe-objects"

  const jsonObject = JSON.parse(fileContents)

  if (G.Bundle.is(jsonObject)) {
    // console.log("Object is a  bundle")
    //...
  } else {
    // console.error(...)
  }
  ```
  @packageDocumentation
 */
// TODO: Create isValidBundle and modify the package docs
// if (G.Bundle.is(jsonObject) && isValidBundle(jsonObject)) {

export {
  ActionGuard as Action,
  DepositGuard as Deposit,
  NotifyGuard as Notify,
  ChoiceGuard as Choice,
} from "./actions.js";

export {
  Address,
  Role,
  ChoiceName,
  Bound,
  Token as CoreToken,
  TokenName,
  Constant,
  TimeIntervalStart,
  TimeIntervalEnd,
  UseValue,
  ValueId,
  Close,
} from "@marlowe.io/language-core-v1/guards";

export { ChoiceIdGuard as ChoiceId } from "./choices.js";

export {
  ReferenceGuard as Reference,
  LabelGuard as Label,
} from "./reference.js";
export { PartyGuard as Party } from "./participants.js";
export {
  PayeeAccountGuard as PayeeAccount,
  PayeePartyGuard as PayeeParty,
  AccountIdGuard as AccountId,
} from "./payee.js";
export { TokenGuard as Token } from "./token.js";

export {
  ValueGuard as Value,
  AvailableMoneyGuard as AvailableMoney,
  NegValueGuard as NegValue,
  AddValueGuard as AddValue,
  SubValueGuard as SubValue,
  MulValueGuard as MulValue,
  DivValueGuard as DivValue,
  ChoiceValueGuard as ChoiceValue,
  CondGuard as Cond,
  ObservationGuard as Observation,
  AndObsGuard as AndObs,
  OrObsGuard as OrObs,
  NotObsGuard as NotObs,
  ChoseSomethingGuard as ChoseSomething,
  ValueEQGuard as ValueEQ,
  ValueGTGuard as ValueGT,
  ValueGEGuard as ValueGE,
  ValueLTGuard as ValueLT,
  ValueLEGuard as ValueLE,
} from "./value-and-observation.js";
export {
  ContractGuard as Contract,
  PayGuard as Pay,
  AssertGuard as Assert,
  IfGuard as If,
  LetGuard as Let,
} from "./contract.js";
export {
  BundleGuard as Bundle,
  ObjectPartyGuard as ObjectParty,
  ObjectValueGuard as ObjectValue,
  ObjectObservationGuard as ObjectObservation,
  ObjectTokenGuard as ObjectToken,
  ObjectContractGuard as ObjectContract,
  ObjectActionGuard as ObjectAction,
} from "./object.js";
