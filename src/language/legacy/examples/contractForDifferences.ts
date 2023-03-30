/* eslint-disable sort-keys-fix/sort-keys-fix */
import {
  Account,
  AddValue,
  Bound,
  Case,
  Choice,
  ChoiceId,
  ChoiceValue,
  Close,
  Cond,
  Constant,
  ConstantParam,
  Contract,
  Deposit,
  ETimeout,
  If,
  Let,
  Party,
  Pay,
  Role,
  SubValue,
  TimeParam,
  UseValue,
  Value,
  ValueGT,
  ValueId,
  ValueLT,
  When,
  ada
} from '../dsl'

/**
 * Marlowe Example : Contract For Differences
 * Description :
 *      "Party" and "Counterparty" deposit 100 Ada and after 60 slots is redistributed
 *       depending on the change in a given trade price reported by "Oracle".
 *       If the price increases, the difference goes to "Counterparty";
 *       if it decreases, the difference goes to "Party", up to a maximum of 100 Ada.
 */

/* We can set explicitRefunds true to run Close refund analysis
       but we get a shorter contract if we set it to false */
const explicitRefunds: Boolean = false;

const party: Party = Role('Party');
const counterparty: Party = Role('Counterparty');
const oracle: Party = Role('Oracle');

const partyDeposit: Value = ConstantParam('Amount paid by party');
const counterpartyDeposit: Value = ConstantParam('Amount paid by counterparty');
const bothDeposits: Value = AddValue(partyDeposit, counterpartyDeposit);

const priceBeginning: ChoiceId = ChoiceId('Price in first window', oracle);
const priceEnd: ChoiceId = ChoiceId('Price in second window', oracle);

const decreaseInPrice: ValueId = 'Decrease in price';
const increaseInPrice: ValueId = 'Increase in price';

const initialDeposit = function (
  by: Party,
  deposit: Value,
  timeout: ETimeout,
  timeoutContinuation: Contract,
  continuation: Contract
): Contract {
  return When([Case(Deposit(by, by, ada, deposit), continuation)], timeout, timeoutContinuation);
};

const oracleInput = function (
  choiceId: ChoiceId,
  timeout: ETimeout,
  timeoutContinuation: Contract,
  continuation: Contract
): Contract {
  return When([Case(Choice(choiceId, [Bound(0n, 1_000_000_000n)]), continuation)], timeout, timeoutContinuation);
};

const wait = function (timeout: ETimeout, continuation: Contract): Contract {
  return When([], timeout, continuation);
};

const gtLtEq = function (
  value1: Value,
  value2: Value,
  gtContinuation: Contract,
  ltContinuation: Contract,
  eqContinuation: Contract
): Contract {
  return If(ValueGT(value1, value2), gtContinuation, If(ValueLT(value1, value2), ltContinuation, eqContinuation));
};

const recordDifference = function (
  name: ValueId,
  choiceId1: ChoiceId,
  choiceId2: ChoiceId,
  continuation: Contract
): Contract {
  return Let(name, SubValue(ChoiceValue(choiceId1), ChoiceValue(choiceId2)), continuation);
};

const transferUpToDeposit = function (
  from: Party,
  payerDeposit: Value,
  to: Party,
  amount: Value,
  continuation: Contract
): Contract {
  return Pay(from, Account(to), ada, Cond(ValueLT(amount, payerDeposit), amount, payerDeposit), continuation);
};

const refund = function (who: Party, amount: Value, continuation: Contract): Contract {
  if (explicitRefunds) {
    return Pay(who, Party(who), ada, amount, continuation);
  }
  return continuation;
};

const refundBoth: Contract = refund(party, partyDeposit, refund(counterparty, counterpartyDeposit, Close));

const refundIfGtZero = function (who: Party, amount: Value, continuation: Contract): Contract {
  if (explicitRefunds) {
    return If(ValueGT(amount, Constant(0n)), refund(who, amount, continuation), continuation);
  }
  return continuation;
};

const refundUpToBothDeposits = function (who: Party, amount: Value, continuation: Contract): Contract {
  if (explicitRefunds) {
    return refund(who, Cond(ValueGT(amount, bothDeposits), bothDeposits, amount), continuation);
  }
  return continuation;
};

const refundAfterDifference = function (
  payer: Party,
  payerDeposit: Value,
  payee: Party,
  payeeDeposit: Value,
  difference: Value
): Contract {
  return refundIfGtZero(
    payer,
    SubValue(payerDeposit, difference),
    refundUpToBothDeposits(payee, AddValue(payeeDeposit, difference), Close)
  );
};

export const contractForDifferences: Contract = initialDeposit(
  party,
  partyDeposit,
  TimeParam('Party deposit deadline'),
  Close,
  initialDeposit(
    counterparty,
    counterpartyDeposit,
    TimeParam('Counterparty deposit deadline'),
    refund(party, partyDeposit, Close),
    wait(
      TimeParam('First window beginning'),
      oracleInput(
        priceBeginning,
        TimeParam('First window deadline'),
        refundBoth,
        wait(
          TimeParam('Second window beginning'),
          oracleInput(
            priceEnd,
            TimeParam('Second window deadline'),
            refundBoth,
            gtLtEq(
              ChoiceValue(priceBeginning),
              ChoiceValue(priceEnd),
              recordDifference(
                decreaseInPrice,
                priceBeginning,
                priceEnd,
                transferUpToDeposit(
                  counterparty,
                  counterpartyDeposit,
                  party,
                  UseValue(decreaseInPrice),
                  refundAfterDifference(
                    counterparty,
                    counterpartyDeposit,
                    party,
                    partyDeposit,
                    UseValue(decreaseInPrice)
                  )
                )
              ),
              recordDifference(
                increaseInPrice,
                priceEnd,
                priceBeginning,
                transferUpToDeposit(
                  party,
                  partyDeposit,
                  counterparty,
                  UseValue(increaseInPrice),
                  refundAfterDifference(
                    party,
                    partyDeposit,
                    counterparty,
                    counterpartyDeposit,
                    UseValue(increaseInPrice)
                  )
                )
              ),
              refundBoth
            )
          )
        )
      )
    )
  )
);
