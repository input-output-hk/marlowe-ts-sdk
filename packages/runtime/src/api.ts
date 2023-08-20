
import { ContractId } from './instance/overRestAPI/restClient/contract/id.js';
import { RestAPI } from './instance/overRestAPI/restClient/index.js';
import * as Withdrawal from './instance/overRestAPI/restClient/contract/withdrawal/details.js';

import * as TE from 'fp-ts/lib/TaskEither.js'
import { WalletAPI } from './wallet/api.js';
import { Next } from '@marlowe.io/language-core-v1/semantics/next/index.js';
import { DecodingError } from '@marlowe.io/adapter/codec';
import { RolesConfig } from './instance/overRestAPI/restClient/contract/role.js';

import { ISO8601 } from '@marlowe.io/adapter/time';

import * as WithdrawalCollection from './instance/overRestAPI/restClient/contract/withdrawal/endpoints/collection.js';

import { Contract } from '@marlowe.io/language-core-v1/semantics/contract/index.js';
import { Input } from '@marlowe.io/language-core-v1/semantics/contract/when/input/index.js';
import { Tags, Metadata } from '@marlowe.io/core/cardano';


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

export type WithdrawRequest = WithdrawalCollection.PostWithdrawalsRequest