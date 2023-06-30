import * as t from "io-ts"
import { PolicyId } from "./policyId"


export type  TokenName = t.TypeOf<typeof TokenName>
export const TokenName = t.string

export type Token = t.TypeOf<typeof Token>
export const Token = t.type({currency_symbol:PolicyId,token_name:TokenName})

export const token = (currency_symbol :PolicyId,token_name: TokenName) => ({ currency_symbol: currency_symbol, token_name: token_name })


export const toString : (token : Token) => string = (token) => `${token.currency_symbol}|${token.token_name}`

export type TokenValue = t.TypeOf<typeof TokenValue>
export const TokenValue = t.type({amount:t.bigint,token:Token})



export const tokenValue : (amount : bigint) => (token : Token) => TokenValue 
    = (amount) => (token) => ({amount:amount,token:token})

export const adaValue : (amount : bigint)  => TokenValue 
    = (amount)  => ({amount:amount*1_000_000n,token:adaToken})

export const adaToken: Token = token('','')