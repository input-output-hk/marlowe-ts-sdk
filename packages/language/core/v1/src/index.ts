/**
 *  This module exports static types (only useful in TypeScript) for the JSON schema as specified in the Appendix E of the {@link https://github.com/input-output-hk/marlowe/releases/download/v3/Marlowe.pdf | Marlowe specification}
   ```
  import {Value, Contract} from "@marlowe/language-core-v1"
  const four: Value = { add: 2n, and: 2n};
  const contract: Contract = {
    "when": [
      {
        "then": "close",
        "case": {
          "party": { "role_token": "Bob" },
          "of_token": { "token_name": "", "currency_symbol": "" },
          "into_account": { "role_token": "Alice" },
          "deposits": 1n
        }
      }
    ],
    "timeout_continuation": "close",
    "timeout": 1696345114737n
  }
  ```
 * @packageDocumentation
 */

export { Action, Deposit, Notify, Choice } from "./actions.js";
export { ChoiceName, ChoiceId, Bound } from "./choices.js";
export {
  Close,
  Pay,
  If,
  Let,
  Assert,
  Contract,
  When,
  Case,
  close,
  datetoTimeout,
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

export { role, Party, Address, Role } from "./participants.js";

export { Payee, PayeeAccount, PayeeParty, AccountId } from "./payee.js";

export { Token, TokenName, tokenToString, token } from "./token.js";

export { MarloweState } from "./state.js";

export {
  Value,
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
