import { Sort, strCmp } from "@marlowe.io/adapter/assoc-map";
import * as t from "io-ts/lib/index.js";
import { PolicyId } from "./policyId.js";
/**
 * TODO: Comment
 * @category Token
 */
export type TokenName = string;
/**
 * TODO: Comment
 * @category Token
 */
export const TokenNameGuard: t.Type<string> = t.string;

/**
 * TODO: Comment
 * @category Token
 */
export interface Token {
  /**
   * TODO: Comment
   */
  currency_symbol: PolicyId;
  /**
   * TODO: Comment
   */

  token_name: TokenName;
}
/**
 * TODO: Comment
 * @category Token
 */
export const TokenGuard: t.Type<Token> = t.type({
  currency_symbol: PolicyId,
  token_name: TokenNameGuard,
});

/**
 * Search [[lower-name-builders]]
 * @hidden
 */
export const token = (currency_symbol: PolicyId, token_name: TokenName) => ({
  currency_symbol: currency_symbol,
  token_name: token_name,
});

/**
 * @hidden
 */
export const tokenToString: (token: Token) => string = (token) =>
  `${token.currency_symbol}|${token.token_name}`;

/**
 * The native {@link Token} of the Cardano blockchain. 1 Million lovelaces is one ADA.
 * @category Token
 */
export const lovelace: Token = token("", "");
/**
 * @deprecated Use `lovelace` instead
 * @hidden
 */
export const adaToken: Token = lovelace;

/**
 * Sorting function for Parties as defined in the Marlowe Specification (SemanticsGuarantees.thy)
 * @hidden
 */
export function tokenCmp(a: Token, b: Token): Sort {
  const currencyCmp = strCmp(a.currency_symbol, b.currency_symbol);
  if (currencyCmp !== "EqualTo") {
    return currencyCmp;
  }
  return strCmp(a.token_name, b.token_name);
}
