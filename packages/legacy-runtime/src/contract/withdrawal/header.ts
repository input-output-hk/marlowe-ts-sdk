
import * as t from "io-ts";
import { BlockHeader } from "../../common/block";

import { WithdrawalId } from "./id";
import { TxStatus } from "../transaction/status";
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable";


export type Header = t.TypeOf<typeof Header>
export const Header 
  = t.type(
      { withdrawalId: WithdrawalId
      , status: TxStatus
      , block: optionFromNullable(BlockHeader) 
    })
  