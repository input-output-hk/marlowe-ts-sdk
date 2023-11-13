import * as t from "io-ts/lib/index.js";
import { PartyGuard, Party } from "./participants.js";

/**
 * TODO: Comment
 * @category Payee
 */
export type AccountId = Party;

/**
 * TODO: Comment
 * @category Payee
 */
export const AccountIdGuard = PartyGuard;

// DISCUSSION: [[ payee-name-conflict ]]
//   The internal types for a Payee are named differently than other types because
//   there is a name conflict between the Party Constructor and the Party type.
//   The Party type is defined in the participants module and has Address and Role
//   as constructors. The Party constructor is defined here in the Payee module.
//   In Haskell/PureScript this conflict doesn't matter as they live in different
//   namespaces, but for typescript we need to avoid collision, so I've added a Payee
//   prefix.
//   Eventually it would be ideal to rename Account to Internal and Party to External
//   to better indicate the intent of a Payout. But this should be done as a single effort
//   all acrross the codebase.

/**
 * TODO: Comment
 * @category Payee
 */
// see [[ payee-name-conflict ]]
export interface PayeeAccount {
  account: AccountId;
}

/**
 * TODO: Comment
 * @category Payee
 */
// see [[ payee-name-conflict ]]
export const PayeeAccountGuard = t.type({
  account: AccountIdGuard,
});

/**
 * TODO: Comment
 * @category Payee
 */
// see [[ payee-name-conflict ]]
export interface PayeeParty {
  party: Party;
}

/**
 * TODO: Comment
 * @category Payee
 */
// see [[ payee-name-conflict ]]
export const PayeePartyGuard = t.type({
  party: PartyGuard,
});

/**
 * TODO: Comment
 * @category Payee
 */
// see [[ payee-name-conflict ]]
export type Payee = PayeeAccount | PayeeParty;

/**
 * TODO: Comment
 * @category Payee
 */
// see [[ payee-name-conflict ]]
export const PayeeGuard = t.union([PayeeAccountGuard, PayeePartyGuard]);

/**
 * Pattern match object on the Payee type
 * @category Payee
 * @hidden
 */
export type PayeeMatcher<T> = {
  party: (party: Party) => T;
  account: (account: AccountId) => T;
};

/**
 * Pattern matching on the Payee type
 * @hidden
 * @category Payee
 */
export function matchPayee<T>(matcher: PayeeMatcher<T>): (payee: Payee) => T;
export function matchPayee<T>(
  matcher: Partial<PayeeMatcher<T>>
): (payee: Payee) => T | undefined;
export function matchPayee<T>(matcher: Partial<PayeeMatcher<T>>) {
  return (payee: Payee) => {
    if (PayeePartyGuard.is(payee) && matcher.party) {
      return matcher.party(payee.party);
    } else if (PayeeAccountGuard.is(payee) && matcher.account) {
      return matcher.account(payee.account);
    }
  };
}
