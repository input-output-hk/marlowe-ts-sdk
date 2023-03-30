
import * as t from "io-ts";
import { BlockHeader } from "../../common/block";

import { WithdrawalId } from "./id";
import { TxStatus } from "../transaction/status";


export type Header = t.TypeOf<typeof Header>
export const Header 
  = t.type(
      { withdrawalId: WithdrawalId
      , status: TxStatus
      , block: BlockHeader 
    })
  