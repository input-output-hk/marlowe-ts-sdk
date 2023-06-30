
import axios, { AxiosInstance } from 'axios';
import * as TE from 'fp-ts/TaskEither'
import * as HTTP from './common/http';
import * as WithdrawalSingleton from './contract/withdrawal/endpoints/singleton';
import * as WithdrawalCollection from './contract/withdrawal/endpoints/collection';
import * as ContractSingleton from './contract/endpoints/singleton';
import * as ContractCollection from './contract/endpoints/collection';
import * as TransactionSingleton from './contract/transaction/endpoints/singleton';
import * as TransactionCollection from './contract/transaction/endpoints/collection';
import * as ContractNext from './contract/next/endpoint';
import { JsonAlwayAndOnlyBigInt, MarloweJSONCodec } from '../adapter/json';
import { pipe } from 'fp-ts/lib/function';


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

const interceptRequest = (axiosInstance: AxiosInstance) => axiosInstance.interceptors.request.use(request => {
  console.log('Starting Request', JsonAlwayAndOnlyBigInt.stringify(request, null, 2))
  return request
})


export const mkRuntimeRestAPI : (baseURL: string) =>  RuntimeRestAPI = 
  (baseURL) => 
     pipe(axios.create
            ({ baseURL:baseURL
              , transformRequest: MarloweJSONCodec.encode
              , transformResponse: MarloweJSONCodec.decode
            })
        //  , (axiosInstance) => { interceptRequest(axiosInstance); return axiosInstance}
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



