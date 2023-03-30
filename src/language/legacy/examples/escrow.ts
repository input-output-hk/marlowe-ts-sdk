/* eslint-disable sort-keys-fix/sort-keys-fix */
import {
  Account,
  Bound,
  Case,
  Choice,
  ChoiceId,
  Close,
  ConstantParam,
  Contract,
  Deposit,
  Party,
  Pay,
  Role,
  SomeNumber,
  TimeParam,
  Timeout,
  Value,
  When,
  ada
} from '../dsl'

/**
 * Marlowe Example : Escrow
 * Description :
 *      Regulates a money exchange between a "Buyer" and a "Seller".
 *      If there is a disagreement, an "Mediator" will decide whether the money is refunded or paid to the "Seller".
 */

/* We can set explicitRefunds true to run Close refund analysis
       but we get a shorter contract if we set it to false */
const explicitRefunds: Boolean = false;

const buyer: Party = Role('Buyer');
const seller: Party = Role('Seller');
const arbiter: Party = Role('Mediator');

const price: Value = ConstantParam('Price');

const depositTimeout: Timeout = TimeParam('Payment deadline');
const disputeTimeout: Timeout = TimeParam('Complaint deadline');
const answerTimeout: Timeout = TimeParam('Complaint response deadline');
const arbitrageTimeout: Timeout = TimeParam('Mediation deadline');

const choice = function (choiceName: string, chooser: Party, choiceValue: SomeNumber, continuation: Contract): Case {
  return Case(Choice(ChoiceId(choiceName, chooser), [Bound(choiceValue, choiceValue)]), continuation);
};

const deposit = function (timeout: Timeout, timeoutContinuation: Contract, continuation: Contract): Contract {
  return When([Case(Deposit(seller, buyer, ada, price), continuation)], timeout, timeoutContinuation);
};

const choices = function (
  timeout: Timeout,
  chooser: Party,
  timeoutContinuation: Contract,
  list: { value: SomeNumber; name: string; continuation: Contract }[]
): Contract {
  const caseList: Case[] = Array.from({ length: list.length });
  for (const [index, element] of list.entries())
    caseList[index] = choice(element.name, chooser, element.value, element.continuation);
  return When(caseList, timeout, timeoutContinuation);
};

const sellerToBuyer = function (continuation: Contract): Contract {
  return Pay(seller, Account(buyer), ada, price, continuation);
};

const paySeller = function (continuation: Contract): Contract {
  return Pay(buyer, Party(seller), ada, price, continuation);
};

const refundBuyer: Contract = explicitRefunds ? Pay(buyer, Party(buyer), ada, price, Close) : Close;

const refundSeller: Contract = explicitRefunds ? Pay(seller, Party(seller), ada, price, Close) : Close;

export const escrow: Contract = deposit(
  depositTimeout,
  Close,
  choices(disputeTimeout, buyer, refundSeller, [
    { value: 0n, name: 'Everything is alright', continuation: refundSeller },
    {
      value: 1n,
      name: 'Report problem',
      continuation: sellerToBuyer(
        choices(answerTimeout, seller, refundBuyer, [
          { value: 1n, name: 'Confirm problem', continuation: refundBuyer },
          {
            value: 0n,
            name: 'Dispute problem',
            continuation: choices(arbitrageTimeout, arbiter, refundBuyer, [
              { value: 0n, name: 'Dismiss claim', continuation: paySeller(Close) },
              { value: 1n, name: 'Confirm problem', continuation: refundBuyer }
            ])
          }
        ])
      )
    }
  ])
);
