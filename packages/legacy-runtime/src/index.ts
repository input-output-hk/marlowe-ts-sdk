import { DecodingError } from './common/codec';
import { ContractId } from './contract/id';
import { RuntimeRestAPI } from './restAPI';
import { ApplyInputsPayload, InitialisePayload, WithdrawPayload } from './write/command';
import * as Command from './write/command';
import * as Withdrawal from './contract/withdrawal/details';
import * as TE from 'fp-ts/TaskEither'
import * as T from 'fp-ts/Task'
import { pipe } from 'fp-ts/lib/function';
import * as O from 'fp-ts/Option'
import { WalletAPI } from './wallet/api';
import { mkEnvironment } from '@marlowe/language-core-v1/semantics/environment';
import { addMinutes, subMinutes } from 'date-fns';
import { Next } from '@marlowe/language-core-v1/semantics/next';
import { Party } from '@marlowe/language-core-v1/semantics/contract/common/payee/party';
import { PolicyId } from './common/policyId';
import * as A from 'fp-ts/Array'

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