
import axios from 'axios';
import * as TE from 'fp-ts/lib/TaskEither.js'
import { pipe } from 'fp-ts/lib/function.js';

import { MarloweJSONCodec } from '@marlowe.io/adapter/codec';
import * as HTTP from '@marlowe.io/adapter/http';

import * as Payouts from './payout/endpoints/collection.js';
import * as Payout from './payout/endpoints/singleton.js';

import * as Withdrawal from './withdrawal/endpoints/singleton.js';
import * as Withdrawals from './withdrawal/endpoints/collection.js';
import * as Contract from './contract/endpoints/singleton.js';
import * as Contracts from './contract/endpoints/collection.js';
import * as Transaction from './contract/transaction/endpoints/singleton.js';
import * as Transactions from './contract/transaction/endpoints/collection.js';
import * as ContractNext from './contract/next/endpoint.js';
// import curlirize from 'axios-curlirize';


export * from './contract/index.js'
export * from './withdrawal/index.js'
export * from './payout/index.js'

export interface RestAPI {
  healthcheck : () => TE.TaskEither<Error,Boolean>
  payouts : {
    getHeadersByRange: Payouts.GETHeadersByRange
    get: Payout.GET
  }
  withdrawals: {
    getHeadersByRange: Withdrawals.GETHeadersByRange
    post: Withdrawals.POST
    withdrawal: {
      get: Withdrawal.GET
      put: Withdrawal.PUT
    }
  }
  contracts: {
    getHeadersByRange: Contracts.GETHeadersByRange
    post: Contracts.POST
    contract: {
      get: Contract.GET
      put: Contract.PUT
      next: ContractNext.GET
      transactions: {
        getHeadersByRange: Transactions.GETHeadersByRange
        post: Transactions.POST
        transaction: {
          get: Transaction.GET
          put: Transaction.PUT
        }
      }
    }
  }
}

export const mkRestClient : (baseURL: string) =>  RestAPI =
  (baseURL) =>
     pipe(axios.create
            ({ baseURL:baseURL
              , transformRequest: MarloweJSONCodec.encode
              , transformResponse: MarloweJSONCodec.decode
            })
        //  , (axiosInstance) => {curlirize(axiosInstance) ;return axiosInstance }   
         , (axiosInstance) =>
             ({ healthcheck: () => HTTP.Get(axiosInstance)('/healthcheck')
              , payouts : 
                { getHeadersByRange: Payouts.getHeadersByRangeViaAxios(axiosInstance)
                , get: Payout.getViaAxios(axiosInstance)
                }
              , withdrawals:
                  { getHeadersByRange: Withdrawals.getHeadersByRangeViaAxios(axiosInstance)
                  , post: Withdrawals.postViaAxios(axiosInstance)
                  , withdrawal:
                    { get: Withdrawal.getViaAxios(axiosInstance)
                    , put: Withdrawal.putViaAxios(axiosInstance)}
                  }
              , contracts:
                { getHeadersByRange:  Contracts.getHeadersByRangeViaAxios(axiosInstance)
                , post: Contracts.postViaAxios(axiosInstance)
                , contract:
                    { get: Contract.getViaAxios(axiosInstance)
                    , put: Contract.putViaAxios(axiosInstance)
                    , next: ContractNext.getViaAxios(axiosInstance)
                    , transactions:
                      { getHeadersByRange: Transactions.getHeadersByRangeViaAxios(axiosInstance)
                      , post: Transactions.postViaAxios(axiosInstance)
                      , transaction:
                        { get: Transaction.getViaAxios(axiosInstance)
                        , put: Transaction.putViaAxios(axiosInstance)
                      }
                    }
                  }
                }
              }))



