/* eslint-disable sort-keys-fix/sort-keys-fix */
import {
  AddValue,
  Case,
  Close,
  ConstantParam,
  Contract,
  Deposit,
  Party,
  Pay,
  Role,
  TimeParam,
  Timeout,
  Value,
  When,
  ada
} from '../dsl'

/**
 * Marlowe Example : Zero Coupon Bond
 * Description :
 *      A simple loan. The investor pays the issuer
 *      the discounted price at the start, and is repaid
 *      the full (notional) price at the end.
 */

const discountedPrice: Value = ConstantParam('Amount');
const notionalPrice: Value = AddValue(ConstantParam('Interest'), discountedPrice);

const investor: Party = Role('Lender');
const issuer: Party = Role('Borrower');

const initialExchange: Timeout = TimeParam('Loan deadline');
const maturityExchangeTimeout: Timeout = TimeParam('Payback deadline');

const transfer = function (timeout: Timeout, from: Party, to: Party, amount: Value, continuation: Contract): Contract {
  return When(
    [Case(Deposit(from, from, ada, amount), Pay(from, Party(to), ada, amount, continuation))],
    timeout,
    Close
  );
};

export const zeroCouponBond: Contract = transfer(
  initialExchange,
  investor,
  issuer,
  discountedPrice,
  transfer(maturityExchangeTimeout, issuer, investor, notionalPrice, Close)
);
