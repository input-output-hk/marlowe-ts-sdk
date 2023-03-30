/* eslint-disable max-params */
/* eslint-disable sort-keys-fix/sort-keys-fix */
import {
  AddValue,
  Case,
  Close,
  Constant,
  ConstantParam,
  Contract,
  Deposit,
  ETimeout,
  MulValue,
  Party,
  Pay,
  Role,
  SomeNumber,
  Value,
  When,
  ada
} from '../dsl'

/**
 * Marlowe Example : Coupon Bond Guaranteed
 * Description :
 *      Debt agreement between an "Lender" and an "Borrower".
 *      "Lender" will advance the "Principal" amount at the beginning of the contract,
 *      and the "Borrower" will pay back "Interest instalment" every 30 slots and the
 *      "Principal" amount by the end of 3 instalments. The debt is backed by a
 *      collateral provided by the "Guarantor" which will be refunded as long as the
 *      "Borrower" pays back on time.
 */

/* We can set explicitRefunds true to run Close refund analysis
       but we get a shorter contract if we set it to false */
const explicitRefunds: Boolean = false;

const guarantor: Party = Role('Guarantor');
const investor: Party = Role('Lender');
const issuer: Party = Role('Borrower');

const principal: Value = ConstantParam('Principal');
const instalment: Value = ConstantParam('Interest instalment');

const guaranteedAmount = function (instalments: SomeNumber): Value {
  return AddValue(MulValue(Constant(instalments), instalment), principal);
};

const lastInstalment: Value = AddValue(instalment, principal);

const deposit = function (
  amount: Value,
  by: Party,
  toAccount: Party,
  timeout: ETimeout,
  timeoutContinuation: Contract,
  continuation: Contract
): Contract {
  return When([Case(Deposit(toAccount, by, ada, amount), continuation)], timeout, timeoutContinuation);
};

const refundGuarantor = function (amount: Value, continuation: Contract): Contract {
  return Pay(investor, Party(guarantor), ada, amount, continuation);
};

const transfer = function (
  amount: Value,
  from: Party,
  to: Party,
  timeout: ETimeout,
  timeoutContinuation: Contract,
  continuation: Contract
): Contract {
  return deposit(amount, from, to, timeout, timeoutContinuation, Pay(to, Party(to), ada, amount, continuation));
};

const giveCollateralToLender = function (amount: Value): Contract {
  if (explicitRefunds) {
    return Pay(investor, Party(investor), ada, amount, Close);
  }
  return Close;
};

export const couponBondGuaranteed: Contract = deposit(
  guaranteedAmount(3n),
  guarantor,
  investor,
  300n,
  Close,
  transfer(
    principal,
    investor,
    issuer,
    600n,
    refundGuarantor(guaranteedAmount(3n), Close),
    transfer(
      instalment,
      issuer,
      investor,
      900n,
      giveCollateralToLender(guaranteedAmount(3n)),
      refundGuarantor(
        instalment,
        transfer(
          instalment,
          issuer,
          investor,
          1200n,
          giveCollateralToLender(guaranteedAmount(2n)),
          refundGuarantor(
            instalment,
            transfer(
              lastInstalment,
              issuer,
              investor,
              1500n,
              giveCollateralToLender(guaranteedAmount(1n)),
              refundGuarantor(lastInstalment, Close)
            )
          )
        )
      )
    )
  )
);
