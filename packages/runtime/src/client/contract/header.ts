import { BlockHeader } from "../../common/block.js";
import { Metadata, Tags } from "../../common/metadata/index.js";
import { MarloweVersion } from "../../common/version.js";

import { TxStatus } from "./transaction/status.js";
import { ContractId } from "./id.js";
import { optionFromNullable } from "io-ts-types";
import * as t from "io-ts/lib/index.js";

import { PolicyId } from "../../common/policyId.js";

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