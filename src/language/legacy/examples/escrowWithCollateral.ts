/* eslint-disable sort-keys-fix/sort-keys-fix */
import {
  Account,
  Address,
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
 * Marlowe Example : Escrow with Collateral
 * Description :
 *      Regulates a money exchange between a "Buyer" and a "Seller" using a collateral
 *      from both parties to incentivize collaboration.
 *      If there is a disagreement the collateral is burned.
 */

/* We can set explicitRefunds true to run Close refund analysis
       but we get a shorter contract if we set it to false */
const explicitRefunds: Boolean = false;

const buyer: Party = Role('Buyer');
const seller: Party = Role('Seller');
const burnAddress: Party = Address('0000000000000000000000000000000000000000000000000000000000000000');

const price: Value = ConstantParam('Price');
const collateral: Value = ConstantParam('Collateral amount');

const sellerCollateralTimeout: Timeout = TimeParam('Collateral deposit by seller timeout');
const buyerCollateralTimeout: Timeout = TimeParam('Deposit of collateral by buyer timeout');
const depositTimeout: Timeout = TimeParam('Deposit of price by buyer timeout');
const disputeTimeout: Timeout = TimeParam('Dispute by buyer timeout');
const answerTimeout: Timeout = TimeParam('Complaint deadline');

const depositCollateral = function (
  party: Party,
  timeout: Timeout,
  timeoutContinuation: Contract,
  continuation: Contract
): Contract {
  return When([Case(Deposit(party, party, ada, collateral), continuation)], timeout, timeoutContinuation);
};

const burnCollaterals = function (continuation: Contract): Contract {
  return Pay(
    seller,
    Party(burnAddress),
    ada,
    collateral,
    Pay(buyer, Party(burnAddress), ada, collateral, continuation)
  );
};

const deposit = function (timeout: Timeout, timeoutContinuation: Contract, continuation: Contract): Contract {
  return When([Case(Deposit(seller, buyer, ada, price), continuation)], timeout, timeoutContinuation);
};

const choice = function (choiceName: string, chooser: Party, choiceValue: SomeNumber, continuation: Contract): Case {
  return Case(Choice(ChoiceId(choiceName, chooser), [Bound(choiceValue, choiceValue)]), continuation);
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

const refundSellerCollateral = function (continuation: Contract): Contract {
  if (explicitRefunds) {
    return Pay(seller, Party(seller), ada, collateral, continuation);
  }
  return continuation;
};

const refundBuyerCollateral = function (continuation: Contract): Contract {
  if (explicitRefunds) {
    return Pay(buyer, Party(buyer), ada, collateral, continuation);
  }
  return continuation;
};

const refundCollaterals = function (continuation: Contract): Contract {
  return refundSellerCollateral(refundBuyerCollateral(continuation));
};

const refundBuyer: Contract = explicitRefunds ? Pay(buyer, Party(buyer), ada, price, Close) : Close;

const refundSeller: Contract = explicitRefunds ? Pay(seller, Party(seller), ada, price, Close) : Close;

export const escrowWithCollateral: Contract = depositCollateral(
  seller,
  sellerCollateralTimeout,
  Close,
  depositCollateral(
    buyer,
    buyerCollateralTimeout,
    refundSellerCollateral(Close),
    deposit(
      depositTimeout,
      refundCollaterals(Close),
      choices(disputeTimeout, buyer, refundCollaterals(refundSeller), [
        { value: 0n, name: 'Everything is alright', continuation: refundCollaterals(refundSeller) },
        {
          value: 1n,
          name: 'Report problem',
          continuation: sellerToBuyer(
            choices(answerTimeout, seller, refundCollaterals(refundBuyer), [
              { value: 1n, name: 'Confirm problem', continuation: refundCollaterals(refundBuyer) },
              { value: 0n, name: 'Dispute problem', continuation: burnCollaterals(refundBuyer) }
            ])
          )
        }
      ])
    )
  )
);
