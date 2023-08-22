
import * as t from "io-ts/lib/index.js";
import { optionFromNullable } from "io-ts-types";

import { MarloweVersion } from "@marlowe.io/language-core-v1/version";

import { BlockHeader, Metadata, PolicyId, Tags } from "@marlowe.io/runtime-core";

import { TxStatus } from "./transaction/status.js";
import { ContractId } from "@marlowe.io/runtime-core";


export type Header = t.TypeOf<typeof Header>
export const Header
    = t.type(
        { contractId: ContractId
        , roleTokenMintingPolicyId: PolicyId
        , version: MarloweVersion
        , status: TxStatus
        , block: optionFromNullable(BlockHeader)
        , metadata: Metadata
        , tags : Tags
      })