import * as t from "io-ts/lib/index.js"
import { optionFromNullable } from "io-ts-types";
import { PolicyId } from "@marlowe.io/language-core-v1";
import { AddressBech32 } from "../common/address.js";

export type  RoleName = string
export const RoleName = t.string

export type  UsePolicy = t.TypeOf<typeof UsePolicy>
export const UsePolicy = PolicyId

export type  RoleTokenSimple = t.TypeOf<typeof RoleTokenSimple>
export const RoleTokenSimple = AddressBech32

export type TokenMetadataFile = t.TypeOf<typeof TokenMetadataFile>
export const TokenMetadataFile
  = t.type({ name : t.string
    , src : t.string
    , mediaType : t.string
    })

export type TokenMetadata = t.TypeOf<typeof TokenMetadata>
export const TokenMetadata
  = t.type({ name : optionFromNullable(t.string)
           , image : optionFromNullable(t.string)
           , mediaType:  t.string
           , description:t.string
           , files:t.array(TokenMetadataFile)})

export type  RoleTokenAdvanced = t.TypeOf<typeof RoleTokenAdvanced>
export const RoleTokenAdvanced = t.type ({address : AddressBech32, metadata : TokenMetadata})


export type RoleTokenConfig = t.TypeOf<typeof RoleTokenConfig>
export const RoleTokenConfig = t.union ([RoleTokenSimple,RoleTokenAdvanced])

export type  Mint = t.TypeOf<typeof Mint>
export const Mint = t.record(RoleName, RoleTokenConfig)

export type RolesConfig = t.TypeOf<typeof RolesConfig>
export const RolesConfig = t.union([UsePolicy,Mint])