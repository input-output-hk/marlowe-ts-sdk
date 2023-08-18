import { DecodingError } from './common/codec.js';
import { ContractId } from './contract/id.js';
import { RuntimeRestAPI } from './restAPI.js';
import { ApplyInputsPayload, InitialisePayload, WithdrawPayload } from './write/command.js';
import * as Command from './write/command.js';
import * as Withdrawal from './contract/withdrawal/details.js';
import * as A from 'fp-ts/lib/Array.js'
import * as TE from 'fp-ts/lib/TaskEither.js'
import * as T from 'fp-ts/lib/Task.js'
import { pipe } from 'fp-ts/lib/function.js';
import * as O from 'fp-ts/lib/Option.js'
import { WalletAPI } from './wallet/api.js';
import { mkEnvironment } from '@marlowe.io/language-core-v1/environment';
import { addMinutes, subMinutes } from 'date-fns';
import { Next } from '@marlowe.io/language-core-v1/semantics/next/index.js';
import { Party } from '@marlowe.io/language-core-v1/semantics/contract/common/payee/party.js';
import { PolicyId } from './common/policyId.js';

export type Runtime =
  { wallet : WalletAPI
      & { getLovelaces : TE.TaskEither<Error,bigint>}
    restAPI : RuntimeRestAPI
    initialise  : (payload: InitialisePayload)   => TE.TaskEither<Error | DecodingError,ContractId>
    applyInputs : (contractId: ContractId) => (provideInput : ProvideInput) => TE.TaskEither<Error | DecodingError,ContractId>
    withdraw    : (payload : WithdrawPayload)    => TE.TaskEither<Error | DecodingError,Withdrawal.Details>
  }

export type ProvideInput = (next:Next) => ApplyInputsPayload

export const mkRuntime
  :  (runtimeRestAPI : RuntimeRestAPI)
  =>  (walletAPI : WalletAPI)
  => Runtime
  = (runtimeRestAPI) => (walletAPI) =>
    ({ wallet : {...walletAPI
                ,getLovelaces : getLovelaces (walletAPI)}
     , restAPI: runtimeRestAPI
     , initialise : (payload : InitialisePayload) =>
              Command.initialise (runtimeRestAPI)(walletAPI)(payload)
     , withdraw : (payload : WithdrawPayload) =>
          Command.withdraw
            (runtimeRestAPI)
            (walletAPI)
            (payload)

     , applyInputs : (contractId : ContractId) => (provideInput:ProvideInput) =>
          pipe( runtimeRestAPI.contracts.contract.get (contractId)
              , TE.chain (header => TE.fromTask(getParties(walletAPI)(header.roleTokenMintingPolicyId)))
              , TE.chain( parties =>
                    runtimeRestAPI.contracts.contract.next
                        (contractId)
                        (mkEnvironment
                            (pipe(Date.now(),(date) => subMinutes(date,15)))
                            (pipe(Date.now(),(date) => addMinutes(date,15))))
                        (parties))
              , TE.chain( next =>
                    Command.applyInputs
                      (runtimeRestAPI)
                      (walletAPI)
                      (contractId)
                      (provideInput(next)))
              )
    })

const getLovelaces : (walletApi : WalletAPI)  => TE.TaskEither<Error,bigint>
  = (walletAPI) =>
    pipe( walletAPI.getTokenValues
        , TE.map(tokenvalues =>
            pipe(tokenvalues
                , A.filter((tokenValue) => tokenValue.token.currency_symbol == '')
                , A.map(tokenValue => tokenValue.amount)
                , A.head
                , O.getOrElse(() => 0n))))

const getParties
  : (walletApi : WalletAPI)
  =>  (roleTokenMintingPolicyId : PolicyId)
  => T.Task<Party[]>
    = (walletAPI) => (roleMintingPolicyId) => T.of ([])