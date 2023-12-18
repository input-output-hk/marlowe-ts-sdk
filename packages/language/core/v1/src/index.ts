/**
 *  This module exports static types (only useful in TypeScript) for the JSON schema as specified in the Appendix E of the {@link https://github.com/input-output-hk/marlowe/releases/download/v3/Marlowe.pdf | Marlowe specification}

   ```
  import { Contract, datetoTimeout } from "./contract.js";
  import { Value } from "./value-and-observation.js";
  import { lovelace } from './token.js';
  import { Party } from "./participants.js";

  const oneADA = 1000000n;
  const tenADA: Value = { multiply: 10n, times: oneADA };
  // is the same as
  // const tenADA = { multiply: 10n, times: oneADA};

  // these party definitions are the same, but specifying the type 'Party'
  // adds static guardrails to the type, making the dev process
  // more intuative
  const bob: Party = { "role_token": "Bob" };
  const alice = { "role_token": "Alice" };

  const contract: Contract = {
    "when": [
      {
        "then": "close",
        "case": {
          "party": bob,
          "of_token": lovelace,
          "into_account": alice,
          "deposits": tenADA
        }
      }
    ],
    "timeout_continuation": "close",
    "timeout": datetoTimeout(new Date("2024-05-22"))
  }
  ```
 * @packageDocumentation
 */

export { Action, Deposit, Notify, Choice } from "./actions.js";
export { ChoiceName, ChoiceId, Bound, ChosenNum } from "./choices.js";
export {
  Close,
  Pay,
  If,
  Let,
  Assert,
  Contract,
  When,
  Case,
  NormalCase,
  MerkleizedCase,
  close,
  datetoTimeout,
  timeoutToDate,
  Timeout,
} from "./contract.js";
export { Environment, mkEnvironment, TimeInterval } from "./environment.js";

export {
  Input,
  IDeposit,
  IChoice,
  INotify,
  BuiltinByteString,
  inputNotify,
  InputContent,
  NormalInput,
  MerkleizedInput,
} from "./inputs.js";

export { role, Party, Address, Role, RoleName } from "./participants.js";

export { Payee, PayeeAccount, PayeeParty, AccountId } from "./payee.js";

export {
  Token,
  TokenName,
  tokenToString,
  token,
  adaToken,
  lovelace,
} from "./token.js";

export { Accounts, MarloweState } from "./state.js";

export {
  Value,
  ValueId,
  AvailableMoney,
  Constant,
  NegValue,
  AddValue,
  SubValue,
  MulValue,
  DivValue,
  ChoiceValue,
  TimeIntervalStart,
  TimeIntervalEnd,
  UseValue,
  Cond,
  Observation,
  AndObs,
  OrObs,
  NotObs,
  ChoseSomething,
  ValueEQ,
  ValueGT,
  ValueGE,
  ValueLT,
  ValueLE,
} from "./value-and-observation.js";

export { TokenValue, tokenValue, adaValue } from "./tokenValue.js";
export { PolicyId } from "./policyId.js";
