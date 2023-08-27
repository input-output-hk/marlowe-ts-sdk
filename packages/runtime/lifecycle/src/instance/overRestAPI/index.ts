


import * as Command from './tx.js';
import * as TE from 'fp-ts/lib/TaskEither.js'
import * as T from 'fp-ts/lib/Task.js'
import { pipe } from 'fp-ts/lib/function.js';
import * as O from 'fp-ts/lib/Option.js'
import { mkEnvironment } from '@marlowe.io/language-core-v1/environment';
import { addMinutes, subMinutes } from 'date-fns';

import { Party } from '@marlowe.io/language-core-v1/semantics/contract/common/payee/party.js';
import { Filters, RuntimeLifecycle } from '../../apis/runtimeLifecycle.js';
import { CreateRequest, ProvideInput } from '../../apis/tx.js';
import { WalletAPI } from '@marlowe.io/wallet/api';
import { PolicyId,ContractId, PayoutId, PayoutAvailable, AssetId, PayoutWithdrawn, unPolicyId } from '@marlowe.io/runtime-core';

import { RestAPI } from '@marlowe.io/runtime-rest-client';
import { DecodingError } from '@marlowe.io/adapter/codec';

export const mkRuntimeLifecycle
  :  (restAPI : RestAPI)
  => (walletAPI : WalletAPI)
  => RuntimeLifecycle
  = (restAPI) => (walletAPI) =>
    ({ wallet : walletAPI
     , contracts : 
        { create      : (payload : CreateRequest) => Command.create (restAPI)(walletAPI)(payload)
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
                  (provideInput(next))))}
     , payouts : 
        { available : (filtersOption : O.Option<Filters>) => availablePayouts(restAPI) (walletAPI) (filtersOption)
        , withdraw : (payoutIds : PayoutId[]) => Command.withdraw (restAPI) (walletAPI) (payoutIds)
        , withdrawn : (filtersOption : O.Option<Filters>) => withdrawnPayouts(restAPI) (walletAPI) (filtersOption)}})



const availablePayouts : (restAPI : RestAPI) => (walletApi : WalletAPI) => (filtersOption : O.Option<Filters>) => TE.TaskEither<Error | DecodingError,PayoutAvailable[]>
  = (restAPI) => (walletApi) => (filtersOption) => 
      pipe(getAssetIds(walletApi)
          ,TE.chain ( (walletAssetIds) => 
                pipe
                  ( restAPI.payouts.getHeadersByRange
                      (O.none)
                      (pipe(filtersOption,O.match(() => [], filters => filters.byContractIds)))
                      (pipe(filtersOption,O.match(() =>  walletAssetIds, filters => filters.byMyRoleTokens(walletAssetIds))))
                      (O.some("available"))
                  , TE.map(result => result.headers))) 
          ,TE.chain(headers => TE.sequenceArray( headers.map (header => restAPI.payouts.get(header.payoutId) ) ))
          ,TE.map (payoutsDetails => 
            payoutsDetails.map(payoutDetails => 
              ({ payoutId: payoutDetails.payoutId
                , contractId: payoutDetails.contractId
                , role: payoutDetails.role
                , assets : payoutDetails.assets
                }))))

const withdrawnPayouts : (restAPI : RestAPI) => (walletApi : WalletAPI) => (filtersOption : O.Option<Filters>) => TE.TaskEither<Error | DecodingError,PayoutWithdrawn[]>
  = (restAPI) => (walletApi) => (filtersOption) => 
      pipe(getAssetIds(walletApi)
          ,TE.chain ( (walletAssetIds) => 
              pipe(restAPI.payouts.getHeadersByRange
                    (O.none)
                    (pipe(filtersOption,O.match(() => [], filters => filters.byContractIds)))
                    (pipe(filtersOption,O.match(() =>  walletAssetIds, filters => filters.byMyRoleTokens(walletAssetIds))))
                    (O.some("withdrawn"))
                  , TE.map(result => result.headers))) 
          ,TE.chain(headers => TE.sequenceArray( headers.map (header => restAPI.payouts.get(header.payoutId))))
          ,TE.map (payoutsDetails => 
            payoutsDetails.map(payoutDetails => 
              pipe( payoutDetails.withdrawalIdOption 
                  , O.match
                      ( () => { throw "Rest API Inconsistencies for Payout API (payout withdrawn wihouth a withdrawalID)"} 
                      , withdrawalId => 
                            ({ withdrawalId : withdrawalId
                            , payoutId: payoutDetails.payoutId
                            , contractId: payoutDetails.contractId
                            , role: payoutDetails.role
                            , assets : payoutDetails.assets
                            })
                  )))))
                         

               
const getAssetIds
      : (walletApi : WalletAPI)
      => TE.TaskEither<Error,AssetId[]>
        = (walletAPI) => 
         pipe (walletAPI.getTokens,TE.map(tokens => tokens.map (token => token.assetId)))

const getParties
  : (walletApi : WalletAPI)
  =>  (roleTokenMintingPolicyId : PolicyId)
  => T.Task<Party[]>
    = (walletAPI) => (roleMintingPolicyId) => T.of ([])


