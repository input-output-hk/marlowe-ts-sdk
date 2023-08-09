import * as t from "io-ts/lib/index.js"
import { PolicyId } from "./policyId.js";


export type  TokenName = t.TypeOf<typeof TokenName>
export const TokenName = t.string

export type Token = t.TypeOf<typeof Token>
export const Token = t.type({currency_symbol:PolicyId,token_name:TokenName})

export const token = (currency_symbol :PolicyId,token_name: TokenName) => ({ currency_symbol: currency_symbol, token_name: token_name })


export const tokenToString : (token : Token) => string = (token) => `${token.currency_symbol}|${token.token_name}`

export const lovelaceToken : Token = token('','')
export const adaToken: Token = lovelaceToken

