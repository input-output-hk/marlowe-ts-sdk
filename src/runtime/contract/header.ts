import { BlockHeader } from "../../runtime/common/block";
import { Metadata } from "../../runtime/common/metadata";
import { MarloweVersion } from "../../runtime/common/version";

import { TxStatus } from "./transaction/status";
import { ContractId } from "./id";
import { optionFromNullable } from "io-ts-types";
import * as t from "io-ts";

import { PolicyId } from "../../runtime/common/policyId";

export type Header = t.TypeOf<typeof Header>
export const Header 
    = t.type(
        { contractId: ContractId
        , roleTokenMintingPolicyId: PolicyId
        , version: MarloweVersion
        , status: TxStatus
        , block: optionFromNullable(BlockHeader)
        , metadata: Metadata
      })