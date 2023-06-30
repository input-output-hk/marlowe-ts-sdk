import * as t from "io-ts";
import { iso, Newtype } from "newtype-ts";
import { fromNewtype } from "io-ts-types";
import { TokenName } from "../token";
import { AddressBech32 } from "../address";
import { pipe } from "fp-ts/lib/function";
import * as A from 'fp-ts/Array'

export type  Address = t.TypeOf<typeof Address>
export const Address = t.type({address:AddressBech32})


export const role  = (roleToken:TokenName) => ({ role_token: roleToken })
export type  Role = t.TypeOf<typeof Role>
export const Role = t.type({role_token: TokenName })

export const party  = (party:Role|Address) => party
export type Party =  t.TypeOf<typeof Party>
export const Party = t.union([Address,Role])


export const partiesToStrings : (parties :Party[]) => (string[]) = 
    (parties) => pipe(parties,A.map (partyToString))

export const partyToString : (party :Party) => string = 
    (party) => isRole(party) ? party.role_token : party.address
    

export function isRole (party:Party) : party is Role {
    return (party as Role).role_token !== undefined
}

export function isAddress (party:Party) : party is Address {
    return (party as Address).address !== undefined
}