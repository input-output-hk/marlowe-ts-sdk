


import * as Command from './tx.js';
import * as A from 'fp-ts/lib/Array.js'
import * as TE from 'fp-ts/lib/TaskEither.js'
import * as T from 'fp-ts/lib/Task.js'
import { pipe } from 'fp-ts/lib/function.js';
import * as O from 'fp-ts/lib/Option.js'
import { mkEnvironment } from '@marlowe.io/language-core-v1/environment';
import { addMinutes, subMinutes } from 'date-fns';

import { Party } from '@marlowe.io/language-core-v1/semantics/contract/common/payee/party.js';
import { Runtime } from '../../apis/runtime.js';
import { CreateRequest, ProvideInput } from '../../apis/tx.js';
import { WalletAPI } from '@marlowe.io/wallet/api';
import { PolicyId,ContractId, PayoutIds } from '@marlowe.io/runtime-core';

import { RestAPI } from '@marlowe.io/runtime-rest-client';

export const mkRuntime
  :  (restAPI : RestAPI)
  =>  (walletAPI : WalletAPI)
  => Runtime
  = (restAPI) => (walletAPI) =>
    ({ wallet : {...walletAPI
                ,getLovelaces : getLovelaces (walletAPI)}
     , restAPI: restAPI
     , txCommand : 
        { create : (payload : CreateRequest) => Command.create (restAPI)(walletAPI)(payload)
        , applyInputs : (contractId : ContractId) => (provideInput:ProvideInput) =>
            pipe( restAPI.contracts.contract.get (contractId)
            , TE.chain (header => TE.fromTask(getParties(walletAPI)(header.roleTokenMintingPolicyId)))
            , TE.chain( parties =>
              restAPI.contracts.contract.next
              (contractId)
              (mkEnvironment
                (pipe(Date.now(),(date) => subMinutes(date,15)))
                (pipe(Date.now(),(date) => addMinutes(date,15))))
                (parties))
                , TE.chain( next =>
                  Command.applyInputs
                  (restAPI)
                  (walletAPI)
                  (contractId)
                  (provideInput(next))))
        , withdraw : (payoutIds : PayoutIds) => Command.withdraw (restAPI) (walletAPI) (payoutIds)}})

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