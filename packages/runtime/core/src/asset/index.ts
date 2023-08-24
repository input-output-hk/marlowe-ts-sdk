import * as t from "io-ts/lib/index.js";
import { PolicyId } from "../policyId.js";


export type AssetName =  t.TypeOf<typeof AssetName>
export const AssetName = t.string

export type AssetQuantity =  t.TypeOf<typeof AssetQuantity>
export const AssetQuantity = t.bigint

export type AssetId = t.TypeOf<typeof AssetId>
export const AssetId
    = t.type(
        { policyId: PolicyId
        , assetName: AssetName })

export type Token = t.TypeOf<typeof Token>
export const Token
    = t.type(
        { quantity: AssetQuantity
        , assetId: AssetId 
      })
      
export type Tokens = t.TypeOf<typeof Tokens>
export const Tokens = t.record(PolicyId, t.record(AssetName, AssetQuantity))

export type Assets = t.TypeOf<typeof Assets>
export const Assets
    = t.type(
        { lovelace: AssetQuantity
        , tokens: Tokens 
      })

