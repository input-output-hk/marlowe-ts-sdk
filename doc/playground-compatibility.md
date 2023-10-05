# Marlowe Playground compatibility

The Marlowe TypeScript SDK was developed a couple of years after the Playground was released, so if you have defined a contract in the Playground using the JavaScript/TypeScript embedding you should follow this guide to make it compatible with the SDK.

This guide assumes that the contract is written after 16 Nov 2022, which was the last modification of the internal [marlowe-js](https://github.com/input-output-hk/marlowe-playground/commits/main/marlowe-playground-client/src/Language/Javascript/MarloweJS.ts) library. If the contract was written before that date please contact the Marlowe Team for instructions.

When you create a new JS contract in the Playground, you get the following skeleton:

```
import {
    Address, Role, Account, Party, ada, AvailableMoney, Constant, ConstantParam,
    NegValue, AddValue, SubValue, MulValue, DivValue, ChoiceValue, TimeIntervalStart,
    TimeIntervalEnd, UseValue, Cond, AndObs, OrObs, NotObs, ChoseSomething,
    ValueGE, ValueGT, ValueLT, ValueLE, ValueEQ, TrueObs, FalseObs, Deposit,
    Choice, Notify, Close, Pay, If, When, Let, Assert, SomeNumber, AccountId,
    ChoiceId, Token, ValueId, Value, EValue, Observation, Bound, Action, Payee,
    Case, Timeout, ETimeout, TimeParam, Contract
} from 'marlowe-js';

(function (): Contract {
    return Close;
})
```

The first thing to notice is that the Playground requires you to define the contract inside of a closure, but if you are working in a project it is likely that you want to modify the code to export the contract as following:

```
import {
    Address, Role, Account, Party, ada, AvailableMoney, Constant, ConstantParam,
    NegValue, AddValue, SubValue, MulValue, DivValue, ChoiceValue, TimeIntervalStart,
    TimeIntervalEnd, UseValue, Cond, AndObs, OrObs, NotObs, ChoseSomething,
    ValueGE, ValueGT, ValueLT, ValueLE, ValueEQ, TrueObs, FalseObs, Deposit,
    Choice, Notify, Close, Pay, If, When, Let, Assert, SomeNumber, AccountId,
    ChoiceId, Token, ValueId, Value, EValue, Observation, Bound, Action, Payee,
    Case, Timeout, ETimeout, TimeParam, Contract
} from 'marlowe-js';

function myContract(): Contract {
  return Close;
}
```

The next thing to do is to replace the Playgrounds internal `marlowe-js` library with the `npm` published `@marlowe.io/language-core-v1` library, which offers a `playground-v1` compatibility module.

```
import {
    Address, Role, Account, Party, ada, AvailableMoney, Constant, ConstantParam,
    NegValue, AddValue, SubValue, MulValue, DivValue, ChoiceValue, TimeIntervalStart,
    TimeIntervalEnd, UseValue, Cond, AndObs, OrObs, NotObs, ChoseSomething,
    ValueGE, ValueGT, ValueLT, ValueLE, ValueEQ, TrueObs, FalseObs, Deposit,
    Choice, Notify, Close, Pay, If, When, Let, Assert, SomeNumber, AccountId,
    ChoiceId, Token, ValueId, Value, EValue, Observation, Bound, Action, Payee,
    Case, Timeout, ETimeout, TimeParam, Contract
} from "@marlowe.io/language-core-v1/playground-v1";

function myContract(): Contract {
  return Close;
}
```

For the moment the TS-SDK doesn't have a `language-extended-v1` package, so we need to replace the `TimeParam` and the `ConstantParam` references for actual JS parameters and to remove those constructors from the imports.

For example, the escrow contract has the following parameters:

```
export function escrow(): Contract {
  const price: Value = ConstantParam("Price");

  const depositTimeout: Timeout = TimeParam("Payment deadline");
  const disputeTimeout: Timeout = TimeParam("Complaint deadline");
  const answerTimeout: Timeout = TimeParam("Complaint response deadline");
  const arbitrageTimeout: Timeout = TimeParam("Mediation deadline");
  // ...
}
```

Which can be rewritten as:

```
interface EscrowParams {
  price: number;
  depositTimeout: Timeout;
  disputeTimeout: Timeout;
  answerTimeout: Timeout;
  arbitrageTimeout: Timeout;
}
export function escrow({
  price,
  depositTimeout,
  disputeTimeout,
  answerTimeout,
  arbitrageTimeout,
}: EscrowParams): Contract {
  // ...
}
```

With those changes the contract should be compatible with the TS-SDK.
