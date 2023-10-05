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
 * @hidden
 */
export const lovelaceToken: Token = token("", "");
/**
 * DISCUSSION: In different places (like the playground)
 * we use the name `ada` for the lovelace token, I think we
 * should only use lovelace as it can be missleading.
 * @hidden
 */
export const adaToken: Token = lovelaceToken;
