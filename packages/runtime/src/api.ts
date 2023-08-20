
import * as Withdrawal from '@marlowe.io/client-rest/contract/withdrawal/details.js';

import * as TE from 'fp-ts/lib/TaskEither.js'
import { WalletAPI } from '@marlowe.io/wallet/api';
import { Next } from '@marlowe.io/language-core-v1/semantics/next/index.js';
import { DecodingError } from '@marlowe.io/adapter/codec';


import { ISO8601 } from '@marlowe.io/adapter/time';



import { Contract } from '@marlowe.io/language-core-v1/semantics/contract/index.js';
import { Input } from '@marlowe.io/language-core-v1/semantics/contract/when/input/index.js';
import { Tags, Metadata } from '@marlowe.io/core/cardano';
import { RoleName, RolesConfig } from '@marlowe.io/client-rest/contract/role.js';
import { RestAPI } from '@marlowe.io/client-rest/index.js';
import { ContractId } from '@marlowe.io/client-rest/contract/id.js';


export type Runtime =
  { wallet : WalletAPI & { getLovelaces : TE.TaskEither<Error,bigint>}
    restAPI : RestAPI 
    txCommand : TxCommands
  }

export type TxCommands = {
  create      : (payload: CreateRequest)   => TE.TaskEither<Error | DecodingError,ContractId>
  applyInputs : (contractId: ContractId)  => (provideInput : ProvideInput) => TE.TaskEither<Error | DecodingError,ContractId>
  withdraw    : (payload : WithdrawRequest)    => TE.TaskEither<Error | DecodingError,Withdrawal.Details> 
  }

export type ProvideInput = (next:Next) => ApplyInputsRequest

export type CreateRequest =
   ({ contract: Contract
    , roles?: RolesConfig
    , tags? : Tags
    , metadata?: Metadata
    , minUTxODeposit?: number})


export type ApplyInputsRequest
    = ( { inputs: Input[]
        , tags? : Tags
        , metadata?: Metadata
        , invalidBefore?: ISO8601
        , invalidHereafter?: ISO8601})

export type WithdrawRequest = ({ contractId: ContractId, role: RoleName})