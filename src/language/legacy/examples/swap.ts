/* eslint-disable sort-keys-fix/sort-keys-fix */
import {
  Case,
  Close,
  Constant,
  Contract,
  Deposit,
  MulValue,
  Party,
  Pay,
  Role,
  Timeout,
  Token,
  Value,
  When,
  ada
} from '../dsl'

/**
 * Marlowe Example : Swap
 * Description :
 *      Takes Ada from one party and dollar tokens from another party, and it swaps them atomically.
 */

export const swap = function (adaDepositTimeout:Timeout, tokenDepositTimeout:Timeout,amountOfADA:Value,amountOfToken:Value,token:Token): Contract { 
  const adaProvider = adaSwapProvider(amountOfADA);
  const tokenProvider = tokenSwapProvider(amountOfToken,token);
  return makeDeposit(
            adaProvider,
            adaDepositTimeout,
            Close,
            makeDeposit(
              tokenProvider,
              tokenDepositTimeout,
              refundSwapParty(adaProvider),
              makePayment(adaProvider, tokenProvider, makePayment(tokenProvider, adaProvider, Close))
            ));
  };

/* We can set explicitRefunds true to run Close refund analysis
but we get a shorter contract if we set it to false */
const explicitRefunds: Boolean = false;

const lovelacePerAda: Value = Constant(1_000_000n);
const amountOfLovelace = ( amountOfAda: Value): Value => MulValue(lovelacePerAda, amountOfAda);


interface SwapParty {
  party: Party;
  currency: Token;
  amount: Value;
};

const adaSwapProvider = ( amountOfAda: Value): SwapParty => ({
  party: Role('Ada provider'),
  currency: ada,
  amount: amountOfLovelace (amountOfAda)
});

const tokenSwapProvider = (amountofToken:Value ,token : Token) : SwapParty => ({
  party: Role('Token provider'),
  currency: token,
  amount: amountofToken
});

const makeDeposit = function (
  src: SwapParty,
  timeout: Timeout,
  timeoutContinuation: Contract,
  continuation: Contract
): Contract {
  return When(
    [Case(Deposit(src.party, src.party, src.currency, src.amount), continuation)],
    timeout,
    timeoutContinuation
  );
};

const refundSwapParty = function (party: SwapParty): Contract {
  if (explicitRefunds) {
    return Pay(party.party, Party(party.party), party.currency, party.amount, Close);
  }
  return Close;
};

const makePayment = function (src: SwapParty, dest: SwapParty, continuation: Contract): Contract {
  return Pay(src.party, Party(dest.party), src.currency, src.amount, continuation);
};

