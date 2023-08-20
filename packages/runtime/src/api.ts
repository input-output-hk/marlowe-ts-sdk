
import { ContractId } from './instance/overRestClient/restClient/contract/id.js';
import { RuntimeRestAPI } from './instance/overRestClient/restClient/index.js';
import * as Withdrawal from './instance/overRestClient/restClient/contract/withdrawal/details.js';
import { ApplyInputsPayload, CreatePayload, WithdrawPayload } from './txCommand.js';
import * as TE from 'fp-ts/lib/TaskEither.js'
import { WalletAPI } from './wallet/api.js';
import { Next } from '@marlowe.io/language-core-v1/semantics/next/index.js';
import { DecodingError } from '@marlowe.io/adapter/codec';

export type Runtime =
  { wallet : WalletAPI
      & { getLovelaces : TE.TaskEither<Error,bigint>}
    restAPI : RuntimeRestAPI
    create  : (payload: CreatePayload)   => TE.TaskEither<Error | DecodingError,ContractId>
    applyInputs : (contractId: ContractId) => (provideInput : ProvideInput) => TE.TaskEither<Error | DecodingError,ContractId>
    withdraw    : (payload : WithdrawPayload)    => TE.TaskEither<Error | DecodingError,Withdrawal.Details>
  }

export type ProvideInput = (next:Next) => ApplyInputsPayload
