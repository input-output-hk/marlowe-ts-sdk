
import axios from 'axios';
import * as TE from 'fp-ts/TaskEither'
import * as HTTP from '../runtime/common/http';
import * as WithdrawalSingleton from '../runtime/contract/withdrawal/endpoints/singleton';
import * as WithdrawalCollection from '../runtime/contract/withdrawal/endpoints/collection';
import * as ContractSingleton from '../runtime/contract/endpoints/singleton';
import * as ContractCollection from '../runtime/contract/endpoints/collection';
import * as TransactionSingleton from '../runtime/contract/transaction/endpoints/singleton';
import * as TransactionCollection from '../runtime/contract/transaction/endpoints/collection';
// import curlirize from 'axios-curlirize';
import { MarloweJSONCodec } from '../adapter/json';
import { pipe } from 'fp-ts/lib/function';


export interface RestAPI {
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

export const AxiosRestClient : (baseURL: string) =>  RestAPI = 
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

