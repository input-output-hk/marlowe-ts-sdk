import * as t from "io-ts"
import { PolicyId } from "./policyId"


export type  TokenName = t.TypeOf<typeof TokenName>
export const TokenName = t.string

export type Token = t.TypeOf<typeof Token>
export const Token = t.type({currency_symbol:PolicyId,token_name:TokenName})

export const token = (currency_symbol :PolicyId,token_name: TokenName) => ({ currency_symbol: currency_symbol, token_name: token_name })
export const ada: Token = token('','')