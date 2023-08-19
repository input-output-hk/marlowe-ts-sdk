
import axios from 'axios';
import * as TE from 'fp-ts/lib/TaskEither.js'
import * as HTTP from '@marlowe.io/adapter/http';
import * as WithdrawalSingleton from './contract/withdrawal/endpoints/singleton.js';
import * as WithdrawalCollection from './contract/withdrawal/endpoints/collection.js';
import * as ContractSingleton from './contract/endpoints/singleton.js';
import * as ContractCollection from './contract/endpoints/collection.js';
import * as TransactionSingleton from './contract/transaction/endpoints/singleton.js';
import * as TransactionCollection from './contract/transaction/endpoints/collection.js';
import * as ContractNext from './contract/next/endpoint.js';
import { MarloweJSONCodec } from '@marlowe.io/adapter/codec';
import { pipe } from 'fp-ts/lib/function.js';


export interface RuntimeRestAPI {
  healthcheck : () => TE.TaskEither<Error,Boolean>
  withdrawals: {
    getHeadersByRange: WithdrawalCollection.GETHeadersByRange
    post: WithdrawalCollection.POST
    withdrawal: {
      get: WithdrawalSingleton.GET
      put: WithdrawalSingleton.PUT
    }
  }
  contracts: {
    getHeadersByRange: ContractCollection.GETHeadersByRange
    post: ContractCollection.POST
    contract: {
      get: ContractSingleton.GET
      put: ContractSingleton.PUT
      next: ContractNext.GET
      transactions: {
        getHeadersByRange: TransactionCollection.GETHeadersByRange
        post: TransactionCollection.POST
        transaction: {
          get: TransactionSingleton.GET
          put: TransactionSingleton.PUT
        }
      }
    }
  }
}

export const mkRuntimeRestAPI : (baseURL: string) =>  RuntimeRestAPI =
  (baseURL) =>
     pipe(axios.create
            ({ baseURL:baseURL
              , transformRequest: MarloweJSONCodec.encode
              , transformResponse: MarloweJSONCodec.decode
            })
         , (axiosInstance) =>
             ({ healthcheck: () => HTTP.Get(axiosInstance)('/healthcheck')
              , withdrawals:
                  { getHeadersByRange: WithdrawalCollection.getHeadersByRangeViaAxios(axiosInstance)
                  , post: WithdrawalCollection.postViaAxios(axiosInstance)
                  , withdrawal:
                    { get: WithdrawalSingleton.getViaAxios(axiosInstance)
                    , put: WithdrawalSingleton.putViaAxios(axiosInstance)}
                  }
              , contracts:
                { getHeadersByRange:  ContractCollection.getHeadersByRangeViaAxios(axiosInstance)
                , post: ContractCollection.postViaAxios(axiosInstance)
                , contract:
                    { get: ContractSingleton.getViaAxios(axiosInstance)
                    , put: ContractSingleton.putViaAxios(axiosInstance)
                    , next: ContractNext.getViaAxios(axiosInstance)
                    , transactions:
                      { getHeadersByRange: TransactionCollection.getHeadersByRangeViaAxios(axiosInstance)
                      , post: TransactionCollection.postViaAxios(axiosInstance)
                      , transaction:
                        { get: TransactionSingleton.getViaAxios(axiosInstance)
                        , put: TransactionSingleton.putViaAxios(axiosInstance)
                      }
                    }
                  }
                }
              }))



