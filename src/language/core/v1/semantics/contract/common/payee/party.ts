import * as t from "io-ts";
import { iso, Newtype } from "newtype-ts";
import { fromNewtype } from "io-ts-types";
import { TokenName } from "../token";
import { AddressBech32 } from "../address";


export type  Address = t.TypeOf<typeof Address>
export const Address = t.type({address:AddressBech32})


export const role  = (roleToken:TokenName) => ({ role_token: roleToken })
export type  Role = t.TypeOf<typeof Role>
export const Role = t.type({role_token: TokenName })

export const party  = (party:Role|Address) => party
export type Party =  t.TypeOf<typeof Party>
export const Party = t.union([Address,Role])

  