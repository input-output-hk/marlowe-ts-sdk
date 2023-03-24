/* eslint-disable sort-keys-fix/sort-keys-fix */
/* eslint-disable no-use-before-define */
import axios from 'axios';
import * as TE from 'fp-ts/TaskEither'
import * as HTTP from './common/http';
import * as WithdrawalSingleton from './withdrawals/endpoints/singleton';
import * as WithdrawalCollection from './withdrawals/endpoints/collection';
import * as ContractSingleton from './contract/endpoints/singleton';
import * as ContractCollection from './contract/endpoints/collection';
import * as TransactionSingleton from './contract/transaction/endpoints/singleton';
import * as TransactionCollection from './contract/transaction/endpoints/collection';
import curlirize from 'axios-curlirize';
import { MarloweJSONCodec } from '../common/json';


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

export const AxiosRestClient = function (baseURL: string): RestAPI {
  const axiosInstance = axios.create(
    { baseURL:baseURL
      , transformRequest: MarloweJSONCodec.encode
      , transformResponse: MarloweJSONCodec.decode
    })
    
  // curlirize(axiosInstance) -- N.B for debugging (display all the calls executed in a "curl-ish" way) 
  return {
    healthcheck: () => HTTP.Get(axiosInstance)('/healthcheck'),
    withdrawals: {
      getHeadersByRange: WithdrawalCollection.getHeadersByRangeViaAxios(axiosInstance),
      post: WithdrawalCollection.postViaAxios(axiosInstance),
      withdrawal: {
        get: WithdrawalSingleton.getViaAxios(axiosInstance),
        put: WithdrawalSingleton.putViaAxios(axiosInstance)}}, 
    contracts: {
      getHeadersByRange:  ContractCollection.getHeadersByRangeViaAxios(axiosInstance),
      post: ContractCollection.postViaAxios(axiosInstance),
      contract: {
        get: ContractSingleton.getViaAxios(axiosInstance),
        put: ContractSingleton.putViaAxios(axiosInstance),
        transactions: {
          getHeadersByRange: TransactionCollection.getHeadersByRangeViaAxios(axiosInstance),
          post: TransactionCollection.postViaAxios(axiosInstance),
          transaction: {
            get: TransactionSingleton.getViaAxios(axiosInstance),
            put: TransactionSingleton.putViaAxios(axiosInstance)
          }
        }
      }
    }
  }
}
