import { DecodingError } from './common/codec';
import { ContractDetails } from './contract/details';
import { ContractId } from './contract/id';
import { mkRuntimeRestAPI, RuntimeRestAPI } from './restAPI';
import { ApplyInputsPayload, InitialisePayload, WithdrawPayload } from './write/command';
import * as Command from './write/command';
import * as Transaction from './contract/transaction/details';
import * as Withdrawal from './contract/withdrawal/details';
import * as TE from 'fp-ts/TaskEither'
import * as T from 'fp-ts/Task'
import { pipe } from 'fp-ts/lib/function';

import { getExtensionInstance } from '../wallet/cip30/index.ts';
import { AddressBech32 } from './common/address';
import { WalletAPI } from '../wallet/api';
import * as S from '../wallet/singleAddress';
import { mkEnvironment } from '../language/core/v1/semantics/environment';
import { addMinutes, subMinutes } from 'date-fns';
import { Next } from '../language/core/v1/semantics/next';
import { Party } from 'src/language/core/v1/semantics/contract/common/payee/party';
import { PolicyId } from './common/policyId';


export type Runtime = 
  { initialise  : (payload: InitialisePayload)   => TE.TaskEither<Error | DecodingError,ContractId>
    applyInputs : (contractId: ContractId) => (provideInput : ProvideInput) => TE.TaskEither<Error | DecodingError,ContractId>
    withdraw    : (payload : WithdrawPayload)    => TE.TaskEither<Error | DecodingError,Withdrawal.Details>   
  }


export type ProvideInput = (next:Next) => ApplyInputsPayload

export const mkRuntimeCIP30 
  : (extensionName : string) 
  => (runtimeRestAPI : RuntimeRestAPI) 
  => T.Task<Runtime> = 
  (extensionName) => (runtimeUrl) =>
    pipe( getExtensionInstance (extensionName) 
        , T.map (mkRuntime (runtimeUrl)))
    

export const mkRuntimeSingleAddress 
  :  ( context:S.Context) 
  => (privateKeyBech32: string) 
  => (runtimeRestAPI : RuntimeRestAPI) 
  => T.Task<Runtime> = 
  (context) => (privateKeyBech32) => (runtimeUrl) => 
    pipe( S.SingleAddressWallet.Initialise (context,privateKeyBech32)
        , T.map (mkRuntime (runtimeUrl)))


export const mkRuntime 
  :  (runtimeRestAPI : RuntimeRestAPI)  
  =>  (walletApi : WalletAPI) 
  => Runtime 
  = (runtimeRestAPI) => (walletAPI) => 
    ({ initialise : (payload : InitialisePayload) => 
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

export const getParties 
  : (walletApi : WalletAPI) 
  =>  (roleTokenMintingPolicyId : PolicyId) 
  => T.Task<Party[]> 
    = (walletAPI) => (roleMintingPolicyId) => T.of ([])