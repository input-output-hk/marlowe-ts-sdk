import { DecodingError } from './common/codec';
import { ContractDetails } from './contract/details';
import { ContractId } from './contract/id';
import { AxiosRestClient, RestAPI } from './endpoints';
import { ApplyInputsPayload, InitialisePayload, WithdrawPayload } from './write/command';
import * as Command from './write/command';
import * as Transaction from '../runtime/contract/transaction/details';
import * as Withdrawal from '../runtime/contract/withdrawal/details';
import * as TE from 'fp-ts/TaskEither'
import * as T from 'fp-ts/Task'
import { pipe } from 'fp-ts/lib/function';

import { getExtensionInstance } from './wallet/cip30';
import { WalletAPI } from './wallet';
import { AddressBech32 } from './common/address';


export type SDK = 
  { restAPI : RestAPI
    commands : {
        initialise  : (payload: InitialisePayload)   => TE.TaskEither<Error | DecodingError,ContractDetails>
        applyInputs : (contractId : ContractId)    
                   => (payload : ApplyInputsPayload) => TE.TaskEither<Error | DecodingError,Transaction.Details>
        withdraw    : (payload : WithdrawPayload)    => TE.TaskEither<Error | DecodingError,Withdrawal.Details>   
    }
    wallet : {
        getChangeAddress : T.Task<AddressBech32> 
    }
  }

export const cip30SDK : (runtimeUrl : string) => (extensionName : string) => SDK = 
  (runtimeUrl) => (extensionName) => 
    ({ restAPI  : AxiosRestClient(runtimeUrl)
     , commands : 
        { initialise : (payload : InitialisePayload) => 
                        pipe( getExtensionInstance (extensionName) 
                            , TE.fromTask
                            , TE.chainW ((walletAPI) => 
                                Command.initialise 
                                    (AxiosRestClient(runtimeUrl))
                                    (walletAPI)
                                    (payload))) 
        , applyInputs : (contractId : ContractId) => (payload : ApplyInputsPayload) =>
                        pipe( getExtensionInstance (extensionName) 
                        , TE.fromTask
                        , TE.chainW ((walletAPI) => 
                            Command.applyInputs 
                                (AxiosRestClient(runtimeUrl))
                                (walletAPI)
                                (contractId)
                                (payload)))
        , withdraw : (payload : WithdrawPayload) =>
                    pipe( getExtensionInstance (extensionName) 
                    , TE.fromTask
                    , TE.chainW ((walletAPI) => 
                        Command.withdraw 
                            (AxiosRestClient(runtimeUrl))
                            (walletAPI)
                            (payload))) 
       }
     , wallet : {
        getChangeAddress : pipe( getExtensionInstance (extensionName) , T.chain (walletAPI => walletAPI.getChangeAddress))
     } 
    })


