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
  DivValue,
  ETimeout,
  If,
  Let,
  MulValue,
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
 * Marlowe Example : Contract For Differences with Oracle
 * Description :
 *      "Party" and "Counterparty" deposit 100 Ada and after 60 slots these assets
 *      are redistributed depending on the change in price of 100 Ada worth of dollars
 *      between the start and the end of the contract. If the price increases, the difference
 *      goes to "Counterparty"; if it decreases, the difference goes to "Party", up to a maximum of 100 Ada.
 */
/* We can set explicitRefunds true to run Close refund analysis
but we get a shorter contract if we set it to false */
const explicitRefunds: Boolean = false;

const party: Party = Role('Party');
const counterparty: Party = Role('Counterparty');
const oracle: Party = Role('kraken');

const partyDeposit: Value = ConstantParam('Amount paid by party');
const counterpartyDeposit: Value = ConstantParam('Amount paid by counterparty');
const bothDeposits: Value = AddValue(partyDeposit, counterpartyDeposit);

const priceBeginning: Value = ConstantParam('Amount of Ada to use as asset');
const priceEnd: ValueId = ValueId('Price in second window');

const exchangeBeginning: ChoiceId = ChoiceId('dir-adausd', oracle);
const exchangeEnd: ChoiceId = ChoiceId('inv-adausd', oracle);

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
  return When([Case(Choice(choiceId, [Bound(0n, 100_000_000_000n)]), continuation)], timeout, timeoutContinuation);
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

const recordEndPrice = function (
  name: ValueId,
  choiceId1: ChoiceId,
  choiceId2: ChoiceId,
  continuation: Contract
): Contract {
  const valueId = name;
  const value = DivValue(
    MulValue(priceBeginning, MulValue(ChoiceValue(choiceId1), ChoiceValue(choiceId2))),
    Constant(10_000_000_000_000_000n)
  );
  return Let(valueId, value, continuation);
};

const recordDifference = function (name: ValueId, val1: Value, val2: Value, continuation: Contract): Contract {
  return Let(name, SubValue(val1, val2), continuation);
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

export const contractForDifferencesWithOracle: Contract = initialDeposit(
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
        exchangeBeginning,
        TimeParam('First window deadline'),
        refundBoth,
        wait(
          TimeParam('Second window beginning'),
          oracleInput(
            exchangeEnd,
            TimeParam('Second window deadline'),
            refundBoth,
            recordEndPrice(
              priceEnd,
              exchangeBeginning,
              exchangeEnd,
              gtLtEq(
                priceBeginning,
                UseValue(priceEnd),
                recordDifference(
                  decreaseInPrice,
                  priceBeginning,
                  UseValue(priceEnd),
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
                  UseValue(priceEnd),
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
  )
);
