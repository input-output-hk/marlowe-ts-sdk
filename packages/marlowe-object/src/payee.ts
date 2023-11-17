import * as t from "io-ts/lib/index.js";
import { PartyGuard, Party } from "./participants.js";

/**
 * Marlowe Object version of {@link @marlowe.io/language-core-v1!index.AccountId | Core AccountId}.
 * @category Payee
 */
export type AccountId = Party;

/**
 * {@link !io-ts-usage | Dynamic type guard} for the {@link AccountId | accountId type}.
 * @category Payee
 */
export const AccountIdGuard = PartyGuard;

/**
 * Marlowe Object version of {@link @marlowe.io/language-core-v1!index.PayeeAccount | Core PayeeAccount}.
 * @category Payee
 */
// see [[ payee-name-conflict ]]
export interface PayeeAccount {
  account: AccountId;
}

/**
 * {@link !io-ts-usage | Dynamic type guard} for the {@link PayeeAccount | account payee type}.
 * @category Payee
 */
// see [[ payee-name-conflict ]]
export const PayeeAccountGuard = t.type({
  account: AccountIdGuard,
});

/**
 * Marlowe Object version of {@link @marlowe.io/language-core-v1!index.PayeeParty | Core PayeeParty}.
 * @category Payee
 */
// see [[ payee-name-conflict ]]
export interface PayeeParty {
  party: Party;
}

/**
 * {@link !io-ts-usage | Dynamic type guard} for the {@link PayeeParty | party payee type}.
 * @category Payee
 */
// see [[ payee-name-conflict ]]
export const PayeePartyGuard = t.type({
  party: PartyGuard,
});

/**
 * Marlowe Object version of {@link @marlowe.io/language-core-v1!index.Payee | Core Payee}.
 * @category Payee
 */
// see [[ payee-name-conflict ]]
export type Payee = PayeeAccount | PayeeParty;

/**
 * {@link !io-ts-usage | Dynamic type guard} for the {@link Payee | payee type}.
 * @category Payee
 */
// see [[ payee-name-conflict ]]
export const PayeeGuard = t.union([PayeeAccountGuard, PayeePartyGuard]);
